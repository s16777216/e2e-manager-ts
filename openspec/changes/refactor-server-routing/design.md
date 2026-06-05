## Context

目前專案中的 [src/server.ts](file:///c:/works/e2e-manager-ts/src/server.ts) 累積了 500 行程式碼，將專案啟動、各實體 CRUD、SSE 串流、二進位圖片輸出與資料庫 TypeORM 連線完全耦合在一起。為了改善代碼的可讀性與可維護性，本設計方案計畫將這些業務端點重構拆分至多個獨立的路由模組中。

## Goals / Non-Goals

**Goals:**
- 將 Project、Group、Testcase 與 TestRun 相關的路由 Callback 從 `server.ts` 移出，拆分至獨立路由模組。
- 大幅精簡 `server.ts`，使其規模降至 50 行以內，只專注於伺服器配置與子路由掛載。
- 確保外部 API 路由與響應行為保持 100% 的向下相容性。
- 確保重構後專案能順利編譯，且所有既有的 25 個單元測試均順利通過。

**Non-Goals:**
- 本次重構不修改資料庫 Schema，亦不調整資料庫 Entity 定義。
- 暫不對 Service 層的 API 進行二次重構（例如暫不建立 ProjectService 或是 TestcaseService）。
- 暫不調整背景 Worker 佇列 `TaskQueue` 的底層運行機制。

## Decisions

### 1. 使用 Hono 子路由器 (Sub-Routing) 進行拆分
- **決定**：在 `src/routes/` 目錄下建立 4 個子路由器，分別是 `projectRouter`、`groupRouter`、`testcaseRouter` 與 `runRouter`。
- **理由**：Hono 原生支持 `app.route()` 子路徑掛載，這能讓我們將特定模組的 HTTP method 與路由回呼函數完美隔離到獨立檔案。
- **替代方案**：使用 Controller class 注入。由於本專案為輕量級服務，直接使用 Hono Router 來寫子路由比引入大型的類別 Controller 更為簡潔。

### 2. 子路由裝配與路徑相容性設計
- **決定**：
  由於原先的路由設計中有部分交叉路徑，我們將在 [src/server.ts](file:///c:/works/e2e-manager-ts/src/server.ts) 中將子路由器以 `/api` 作為 prefix 註冊，以完美保持既有 API URL 結構不變：
  - `projectRouter` 掛載於 `app.route("/api/projects", projectRouter)`，內部路由為 `/`、`/:id`。
  - `groupRouter` 掛載於 `app.route("/api", groupRouter)`，內部路由為 `/projects/:projectId/groups`、`/groups/:id`。
  - `testcaseRouter` 掛載於 `app.route("/api", testcaseRouter)`，內部路由為 `/groups/:groupId/testcases`、`/testcases/:id`。
  - `runRouter` 掛載於 `app.route("/api", runRouter)`，內部路由為 `/testcases/:id/run`、`/runs/:runId`、`/logs/:logId/screenshot` 等。
- **理由**：這樣能最大限度地保持 URL 語意一致，避免為了迎合路徑 prefix 而改變前端已有的 API 調用路徑。

## Risks / Trade-offs

- **[Risk] 重構中打架或路徑重複導致 404** → *[Mitigation]*：在 `src/server.ts` 的子路由掛載處，優先掛載專用 prefix（如 `/api/projects`），再掛載通用 `/api` 下的子路由。並在重構後，透過編譯與運作既有的測試來防範。
- **[Risk] SSE 串流 (pg Notify) 與圖片串流在拆分檔案後丟失 database instance** → *[Mitigation]*：所有子路由檔案一律從 `../db.js` 引入 `AppDataSource`，共享同一個資料庫連接池，確保連線生命週期一致。
