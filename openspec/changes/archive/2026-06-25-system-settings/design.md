## Context

目前 Playwright 的 headless、slowMo、viewport 等調試與瀏覽器參數皆硬編碼於 `browser.ts` 的 `BrowserManager` 類別中，不利於開發者在 headed 模式下檢視 AI 執行的操作軌跡，或針對網頁渲染速度調整延遲。
為了建立安全、高併發安全的調試手段，並提供資料庫歷史清除機制，本變更案將實作系統全域設定的 API 管道、後端 PostgreSQL 資料庫儲存，以及前端 Bento 風格的設定面板與導航列渲染修復。

## Goals / Non-Goals

**Goals:**
- 建立 `SystemSetting` PostgreSQL 實體與資料表，並於系統啟動時進行 Seeding 自動初始化預設值。
- 後端建立設定讀寫服務（`settingsService.ts`），並提供 `GET /api/settings` 與 `POST /api/settings` API。
- 後端提供 `DELETE /api/settings/history` API，利用外鍵 CASCADE 機制一鍵級聯清除所有 `TestRun`、`TestRunStep` 與 `TestLog`，防止空間爆滿。
- 重構 `BrowserManager.initBrowser()` 為非同步方法，動態從資料庫載入並套用 `headless`、`slowMo`、`defaultTimeout`、`viewportWidth`、`viewportHeight` 配置。
- 前端修正側邊欄導航，使 `RootLayout` 正確傳入 `SidebarFooter`，並使設定按鈕導向 `/settings` 路由。
- 前端實作 `SettingsView.tsx`，以 Bento 排版提供設定調整表單與防誤點二次確認的「清除歷史紀錄」按鈕。

**Non-Goals:**
- 本變更案不包含對模型提供者（LLM Provider）的切換或 OpenAI 相容格式支援。該功能將留待下一階段的獨立變更案（`support-openai-models`）實作，但本設計將保留 AI 參數的 JSONB 儲存擴充欄位以防破壞 Schema。
- 不包含設定多使用者權限，所有操作者皆共用此全域設定。

## Decisions

### 1. 採用 PostgreSQL 單一資料列實體（Singleton）進行設定持久化
- **決策說明**：將設定儲存於 PostgreSQL 資料庫的 `system_setting` 資料表中，且該表永遠只有一筆主鍵為 `"default"` 的紀錄。
- **理由**：
  - **安全性較佳**：避免將後續要引入的 OpenAI API Key 等敏感金鑰存在明文的本地 JSON 檔案中，防止不小心將設定檔 commit 至 git 導致外洩。
  - **併發與一致性**：由資料庫 Transaction 與 Connection Pool 管理併發寫入，不會像 JSON 檔案在大併發讀寫下發生檔案鎖死或寫入衝突。
  - **無維護負擔**：藉由 TypeORM 的 `synchronize: true` 特性，系統啟動時會自動完成 Schema 建立，不需要手動撰寫 SQL Migration。

### 2. 系統啟動時自動進行 Seeding 檢測
- **決策說明**：在 `db.ts` 啟動資料庫後，檢測 `SystemSetting` 表。若 count 為 0，則存入一筆預設值紀錄。
- **理由**：確保系統開箱即用，免去手動初始設定的步驟，且讓後續的 API 與執行核心呼叫時必定能撈到設定值。

### 3. 三層級 headless 判定覆寫機制
- **決策說明**：在啟動 Playwright 時，headless 的判定順序為：
  - 第一優先：CI/CD 環境（`process.env.CI` 或 `process.env.HEADLESS_FORCE`），強制 headless = true，以防在沒有圖形介面的伺服器崩潰。
  - 第二優先：明確傳入的參數值（例如 CLI 呼叫傳入 `--headed` 參數時，顯示覆寫為 headed）。
  - 第三優先：資料庫中的全域設定（用於 web UI 啟動測試的預設模式）。
- **理由**：既能滿足 Web 控制面板動態控制的需求，也能確保 CLI 模式的靈活性與 CI 環境下的安全性。

### 4. 歷史紀錄清除利用 PostgreSQL 外鍵 Cascade 機制
- **決策說明**：在清除執行歷史時，直接清除 `TestRun` 資料表。
- **理由**：在 `TestRunStep` 和 `TestLog` 實體中，對 `TestRun` 的關係皆已宣告 `{ onDelete: "CASCADE" }`。因此，直接從 `TestRun` 表進行清空刪除時，PostgreSQL 會自動級聯清空關聯的所有步驟日誌及二進位截圖數據，這不僅速度極快，也能防止資料庫產生孤立的髒數據。

## Risks / Trade-offs

- **[風險]**: 由於設定讀取改為資料庫異步讀取，所有調用 `BrowserManager.initBrowser()` 的位置（如 CLI `main.ts` 與 Queue `queue.ts`）都必須加上 `await`，且方法必須改為 `async`。
  - **[對策]**: 徹底全面清查並重構所有調用點。
- **[風險]**: 使用者將 `slowMo` 動作延遲設定過高，導致整個測試案例大幅拉長並超出預設等待時間。
  - **[對策]**: 前端表單輸入時限制最大毫秒值（例如 `slowMo` 上限 3000ms），並在 Timeout 輸入框增加合理範圍提示。
