## 1. 依賴與基礎設定

- [ ] 1.1 於 `package.json` 安裝 `hono`, `@hono/node-server`, `typeorm`, `reflect-metadata`, `pg` 依賴及對應的 `@types` 開發依賴
- [ ] 1.2 於 `package.json` 配置啟動伺服器指令 `"server": "tsx src/server.ts"`
- [ ] 1.3 調整 `tsconfig.json` 開啟 `emitDecoratorMetadata` 與 `experimentalDecorators` 支援 TypeORM 裝飾子

## 2. 資料庫與 ORM 實作 (Database & TypeORM)

- [ ] 2.1 建立 `src/entities/` 目錄，實作 `Project`, `TestGroup` (使用 `@Tree("adjacency-list")`), `Testcase`, `TestRun` (含 `screenshotFailData` bytea 欄位), `TestLog` (含 `screenshotData` bytea 欄位) 的 TypeORM Entity 類別
- [ ] 2.2 新增 `src/db.ts` 實作 TypeORM `DataSource` 連線初始化，並在連線成功後執行啟動修復邏輯（將資料庫中處於 `running` 或 `pending` 狀態的任務重置為 `error` 狀態與適當理由）
- [ ] 2.3 使用 TypeORM Repository 及 TreeRepository 封裝專案 (Project)、群組 (Group)、測試案例 (Testcase) 的 CRUD 與任務紀錄新增/更新的資料庫操作

## 3. 任務佇列與非同步執行器 (PostgreSQL Queue & Runner)

- [ ] 3.1 新增 `src/queue.ts`，實作利用 PostgreSQL `FOR UPDATE SKIP LOCKED` 事務鎖定提取 `pending` 任務之 `TaskQueue` 類別，限制平行執行數量為 1，並加入 5 分鐘超時卡死任務清理機制
- [ ] 3.2 修改 `src/graph.ts` 的節點（或重構進入點），將執行過程中的日誌、二進位截圖與最終視覺斷言結果透過 TypeORM 寫入資料庫，並在步驟完成時調用 DB `NOTIFY`（發佈事件，不寫入本地 reports 目錄）
- [ ] 3.3 確保在 Worker 執行中斷、失敗或成功時，資料庫狀態能被正確更新（且發送結束 `NOTIFY` 事件），且 Playwright 瀏覽器確實被關閉釋放

## 4. API 路由與伺服器實作 (Hono Server & LISTEN)

- [ ] 4.1 建立主伺服器程式 `src/server.ts`，初始化 Hono 服務，並實作讀取 `TestLog` / `TestRun` 二進位截圖的 HTTP GET 路由端點
- [ ] 4.2 實作 Hono 路由處理 Project, TestGroup 及 Testcase 的 CRUD 請求（於業務邏輯層進行防環校驗避免循環嵌套，並使用 TreeRepository 讀取階層樹）
- [ ] 4.3 實作非同步執行觸發 API（`POST /api/testcases/:id/run`）與任務狀態查詢 API
- [ ] 4.4 使用獨立 `pg` Client 執行 `LISTEN`，並在 Hono 實作 **Server-Sent Events (SSE)** 端點，當收到 DB `NOTIFY` 時即時將日誌與截圖資訊串流給前端
- [ ] 4.5 實作佇列取消 API（`DELETE /api/runs/:runId`），允許使用者將 pending 中的任務自佇列中移除

## 5. 整合測試與驗證

- [ ] 5.1 配置 `.env` 檔案中的 PostgreSQL 連線字串 `DATABASE_URL`，本地啟動 Hono 伺服器，驗證 TypeORM 連線與自動 Schema 同步功能
- [ ] 5.2 使用 API 建立專案與群組，並在群組下建立測試案例（如維基百科搜尋劇本）
- [ ] 5.3 觸發測試案例的非同步執行，驗證當多個測試被連續觸發時，任務是否能正確在資料庫佇列中排隊、依序啟動瀏覽器執行
- [ ] 5.4 訂閱 SSE 端點，驗證測試執行時是否能即時接收到資料庫發佈的步驟日誌與截圖資訊
