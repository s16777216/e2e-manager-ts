## Why

目前系統中每次觸發測試執行（無論是單一測試案例、群組批次或專案批次），均直接建立 `TestRun` 實體，不存在「任務批次」的上層概念。這導致以下問題：一次批次執行的多個 `TestRun` 之間沒有持久化的關聯，批次進度資訊僅存活於前端 React State，頁面重整後即消失；系統也無法提供批次執行歷史記錄，使用者無法回顧「上次執行整個專案的結果」。引入 `Task` 實體能將「一次執行意圖」持久化，同時統一所有執行觸發路徑的抽象層次。

## What Changes

- **[NEW]** 引入 `Task` 實體（資料庫新表），作為所有測試執行的頂層容器
- **[NEW]** `Task` 支援三種 `scope`：`"project"` / `"group"` / `"testcase"`，對應三種觸發來源
- **[BREAKING]** 所有執行觸發 API（單一測試、群組批次、專案批次）均改為先建立 `Task`，再建立關聯的 `TestRun`，並回傳 `taskId`
- **[BREAKING]** `TestRun` 新增 `task` 外鍵欄位（nullable，向下相容現有紀錄）
- 後端 Worker 在每個 `TestRun` 完成時，原子更新其所屬 `Task` 的 `doneCount`，並在全部完成時計算 `finalResult` 並設定 `Task.status = "done"`
- 新增 Task 查詢與串流 API：`GET /api/tasks/:taskId`、`GET /api/tasks/:taskId/stream`、`GET /api/projects/:projectId/tasks`
- 前端新增 `TaskDetailView`（持久化批次監控頁），路由為 `/project/:projectId/tasks/:taskId`
- 前端現有的 `ProjectDetailView` 批次監控 batchRuns state 遷移至以 `taskId` 為中心的 Task 架構
- 前端所有執行觸發邏輯（`GroupDashboardView`、`TestCaseDetailView`、`ProjectDetailView`）統一導向 `/tasks/:taskId`

## Capabilities

### New Capabilities
- `task-execution-container`: 統一的任務執行容器實體，支援單一測試案例、群組批次與專案批次三種觸發範圍，持久化批次進度（totalCount、doneCount）、最終結果（finalResult）與生命週期狀態（pending/running/done），並提供歷史查詢與即時 SSE 串流能力

### Modified Capabilities
- `background-task-runner`: Worker 在每個 TestRun 完成後，需額外執行 Task 進度更新（原子 doneCount+1，並在達到 totalCount 時計算 finalResult、發送 pg_notify）
- `e2e-web-dashboard`: 新增 TaskDetailView 頁面（持久化批次監控）、更新所有執行觸發後的導航目標由 `/runs/:runId` 延伸至 `/tasks/:taskId`，並新增專案批次歷史列表入口

## Impact

- **資料庫**：新增 `task` 表；`test_run` 表新增 nullable `taskId` 外鍵
- **後端路由**：`POST /api/testcases/:id/run`、`POST /api/projects/:id/run`、`POST /api/groups/:id/run` 回傳結構新增 `taskId`；新增 `/api/tasks/*` 路由群組
- **後端 Worker** (`queue.ts`)：`executeJob()` 完成後新增 Task 進度更新邏輯
- **前端型別** (`types/api.ts`)：新增 `Task` 型別
- **前端 API 封裝** (`lib/api.ts`)：新增 task 相關 API，更新觸發 API 回傳型別
- **前端 Views**：`GroupDashboardView`、`TestCaseDetailView`、`ProjectDetailView` 導航邏輯更新；新增 `TaskDetailView`
- **前端 Router**：新增 `/project/:projectId/tasks/:taskId` 路由
