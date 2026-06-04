## Context

當前的 `e2e-manager-ts` 採用 CLI 單次執行設計（透過 `src/main.ts` 啟動）。雖然這證明了 LangGraph + Playwright + Gemini 的可行性，但不利於與外部系統集成或提供持續的服務。本設計旨在建立一個常駐的 HTTP API 伺服器，將測試劇本與執行歷程保存於 PostgreSQL 資料庫，並在背景以佇列方式排隊執行測試。

為了更好地管理大規模測試案例，本設計導入 **專案 (Project) > 群組 (Group) > 測試案例 (Testcase)** 的三層管理架構，其中 **群組 (Group) 支援無限層級遞迴嵌套**（類似資料夾結構）。

同時，為提升系統的可靠度與擴充性，本設計將充分利用 PostgreSQL 的進階功能，實作 **DB 事務任務佇列 (SKIP LOCKED)** 與 **即時異步通知 (LISTEN/NOTIFY)**。

## Goals / Non-Goals

**Goals:**
- 提供 REST API，支援 `Project`、`Group`（支援遞迴嵌套）與 `Testcase` 的 CRUD 管理。
- 支援非同步觸發 `Testcase` 執行並取得即時任務進度。
- 導入 PostgreSQL 資料庫，透過 TypeORM 儲存與管理 `Project`、`TestGroup`、`Testcase`、`TestRun` 與 `TestLog` 實體。
- 實作 PostgreSQL 事務任務佇列（利用 `FOR UPDATE SKIP LOCKED`），取代不具持久性的記憶體佇列，保證伺服器重啟時排隊任務不遺失。
- 實作即時通知機制，利用 PostgreSQL `LISTEN`/`NOTIFY` 通道，在步驟日誌寫入時即時通知 Hono 伺服器，以便向前端發送即時執行串流（例如使用 Server-Sent Events - SSE）。
- 將原本在執行中生成至 `reports` 目錄的截圖路徑與日誌直接回寫至資料庫中。
- 將 `reports` 目錄設為靜態資源目錄，使 API 回傳的截圖路徑能透過 HTTP 直接存取。

**Non-Goals:**
- 本階段不開發繁複的前端介面（僅專注於提供 API 接口與資料庫底層）。
- 不引入外部 Redis / BullMQ 依賴，完全依靠 PostgreSQL 內建功能達成佇列與 Pub/Sub 需求。
- 不實作多租戶權限管理與登入驗證。
- 不引入 `waiting_human`（人工介入點）的流程，測試任務以自動跑完、判定 Passed/Failed 為主。

## Decisions

### 1. 伺服器框架選擇：Hono (Node.js)
- **決策：** 使用 Hono 作為 API 伺服器框架，搭配 `@hono/node-server` 執行於 Node.js 環境。
- **理由：** Hono 是極速、現代且原生支援 TypeScript 的 Web 框架。其與 Web Standards 的 API 保持高度一致（使用 Request/Response），且中介軟體（Middleware）生態完善，相較於 Express 更為輕量與現代。

### 2. 資料庫與 ORM 選擇：PostgreSQL 與 TypeORM
- **決策：** 採用 PostgreSQL 作為儲存後端，並使用 TypeORM 作為 ORM 框架，驅動程式使用 `pg`。
- **理由：** 
  - PostgreSQL 是生產環境級別的關係型資料庫，對於大型測試平台的併發讀寫支援極佳。
  - TypeORM 提供優秀的 TypeScript 裝飾子（Decorators），且內建強大的 **Tree Entities（樹狀實體）** 支援（使用 Adjacency List 或 Materialized Path）。這能讓我們以極其優雅的方式定義 `test_groups` 的遞迴嵌套關係，並能使用 `manager.getTreeRepository()` 輕鬆取出整棵群組樹或子樹，避免手寫複雜的遞迴 SQL (CTE)。

#### 💾 實體定義與關係對照 (TypeORM Entities)

- **`Project` 實體:**
  - `id`: UUID (Primary Key)
  - `name`: String (Column)
  - `description`: String (Column, Nullable)
  - `groups`: OneToMany -> `TestGroup`
  - `createdAt` / `updatedAt`
- **`TestGroup` 實體 (採用樹狀結構裝飾子 `@Tree("adjacency-list")`):**
  - `id`: UUID (Primary Key)
  - `name`: String (Column)
  - `project`: ManyToOne -> `Project` (ON DELETE CASCADE)
  - `parent`: TreeParent -> `TestGroup` (指向父群組，若為根群組則為 null)
  - `children`: TreeChildren -> `TestGroup[]` (子群組清單)
  - `testcases`: OneToMany -> `Testcase`
  - `createdAt` / `updatedAt`
- **`Testcase` 實體:**
  - `id`: UUID (Primary Key)
  - `group`: ManyToOne -> `TestGroup` (ON DELETE CASCADE)
  - `name`: String (Column)
  - `steps`: String[] (Simple JSON Column) - 自然語言步驟陣列
  - `expected`: String (Column)
  - `runs`: OneToMany -> `TestRun`
  - `createdAt` / `updatedAt`
- **`TestRun` 實體:**
  - `id`: UUID (Primary Key)
  - `testcase`: ManyToOne -> `Testcase` (ON DELETE CASCADE)
  - `status`: String (Column) - `pending` | `running` | `passed` | `failed` | `error`
  - `startedAt` / `finishedAt` (Column, Nullable)
  - `finalResult`: String (Column, Nullable)
  - `finalReason`: String (Column, Nullable)
  - `logs`: OneToMany -> `TestLog`
- **`TestLog` 實體:**
  - `id`: UUID (Primary Key)
  - `run`: ManyToOne -> `TestRun` (ON DELETE CASCADE)
  - `stepIdx`: Number (Column)
  - `stepDescription`: String (Column)
  - `action`: String (Column, Nullable)
  - `result`: String (Column, Nullable)
  - `aiResponse`: String (Column, Nullable)
  - `screenshotPath`: String (Column, Nullable)
  - `createdAt`

### 3. 背景執行與佇列管理：PostgreSQL 事務佇列 (Database Queue)
- **決策：** 利用 PostgreSQL 的 `SELECT ... FOR UPDATE SKIP LOCKED` 語法實作可靠的資料庫任務佇列，取代原先易失的記憶體佇列。
- **理由：** 
  - **防併發衝突**：多個 Worker 領取任務時，`SKIP LOCKED` 保證同一筆 `TestRun` 僅會被一個 Worker 鎖定並執行，不會重複領取。
  - **持久性**：排隊中的任務直接儲存於 `test_runs` 表中，伺服器重啟不會遺失。
  - **具體實作 query 邏輯**：
    ```sql
    -- 獲取並鎖定最早一筆 pending 的任務，將其狀態設為 running
    UPDATE test_runs
    SET status = 'running', started_at = NOW()
    WHERE id = (
        SELECT id FROM test_runs
        WHERE status = 'pending'
        ORDER BY created_at ASC
        LIMIT 1
        FOR UPDATE SKIP LOCKED
    )
    RETURNING id;
    ```

### 4. 即時通知機制：PostgreSQL `LISTEN` / `NOTIFY`
- **決策：** 在 `TestLog` 實體儲存時，利用資料庫的 `NOTIFY` 功能發送即時事件；Hono 伺服器端監聽此通道，即時串流給連線中的客戶端。
- **理由：**
  - 不需要 Redis Pub/Sub，資料庫本身即是強大的即時通訊中繼站。
  - **工作流：** 
    1. Worker 在 `test_logs` 寫入步驟結果。
    2. 資料庫觸發 `NOTIFY test_run_logs, '{"runId":"...", "stepIdx":1}'`。
    3. Hono 使用 `pg` 連線執行 `LISTEN test_run_logs`。
    4. 當 Hono 收到事件時，透過 `hono/streaming` 的 Server-Sent Events (SSE) 接口即時推送到前端。

### 5. 靜態截圖與 URL 關聯
- **決策：** 測試截圖儲存在 `reports/` 對應目錄下，資料庫中記錄相對路徑。API 伺服器透過 Hono 的 `serveStatic` 提供 `reports` 目錄的靜態資源服務。

## Risks / Trade-offs

- **[Risk] 伺服器重啟導致執行中任務狀態永久卡在 'running'**
  - *Mitigation*: 伺服器在每次啟動（TypeORM 連線初始化完成）時，會先執行修復邏輯，將資料庫中所有狀態為 `running` 或 `pending` 的任務重置為 `error`，理由註明「伺服器重啟終止」。
- **[Risk] 連線池（Connection Pool）資源佔用**
  - *Mitigation*: 由於 `LISTEN` 會佔用一個獨立且持續的資料庫連線，因此 Hono 伺服器端必須使用一個專用的獨立 Client 進行監聽，不能從一般的 TypeORM 連線池中拿取，以避免阻塞正常的 API 請求。
- **[Risk] 遞迴群組可能造成無窮迴圈（Parent-child loop）**
  - *Mitigation*: TypeORM 樹狀實體若有循環引用會造成樹狀查詢死鎖。在 API 更新 `parent` 之前，我們必須編寫邏輯檢驗新父群組的祖先節點是否包含自己。
