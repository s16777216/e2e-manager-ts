## Context

目前系統中測試執行的入口點分為三種（單一測試案例、群組批次、專案批次），但這三種觸發路徑直接建立 `TestRun` 實體，沒有共同的上層抽象。批次進度（N/M 完成）只存活於前端 React State，無法持久化。引入 `Task` 實體作為所有執行觸發的統一上層容器，讓「一次執行意圖」能被資料庫記錄、查詢與監控。

現有架構：`Testcase → TestRun (←Worker) → TestLog`

目標架構：
```
Task (scope: project|group|testcase)
  └── TestRun (×N)
        └── TestLog (×M per Run)
```

Worker 在每個 TestRun 完成後，原子更新 Task.doneCount，達到 totalCount 時計算 finalResult 並設 status = "done"。

## Goals / Non-Goals

**Goals:**
- 新增 `Task` 實體，作為所有執行觸發的持久化容器
- 所有觸發 API 統一回傳 `taskId`，前端以 `/tasks/:taskId` 為監控核心 URL
- Task 支援三種 scope：`project`、`group`、`testcase`
- Worker 主動更新 Task 進度（選項 1），提供即時 doneCount 與 finalResult
- 新增 Task 查詢、SSE 串流與歷史列表 API
- 前端新增 `TaskDetailView`，實現持久化批次監控（頁面重整後仍可查看）

**Non-Goals:**
- 不支援 Task 的取消操作（可在後續 change 實作）
- 不修改 Worker 的併發策略（維持 Concurrency = 1）
- 不為現有歷史 TestRun 進行 migration（task 外鍵設為 nullable，舊紀錄保持 null）

## Decisions

### 決策 1：Task.task 外鍵設為 nullable

**採用：** `TestRun.task` nullable  
**原因：** 現有資料庫中已有大量沒有 task_id 的 TestRun 紀錄，nullable 欄位確保向下相容，無需 migration 腳本。  
**替代方案考慮：** 為每個孤立 TestRun 建立一個對應的 Task（scope="testcase", total=1）。複雜度過高，且對使用者體驗改善有限。

### 決策 2：Worker 主動更新 Task（選項 1）

**採用：** Worker `executeJob()` 完成後，透過原子 SQL 更新 Task.doneCount  
**原因：** Task 狀態在資料庫中即時最新，API 可直接讀取 task 記錄而不必聚合計算，降低查詢複雜度。  
**替代方案考慮：** 純 derived（API 每次 COUNT 計算）。雖不需要 Worker 改動，但每次查詢需聚合，且 Task 的 status/finalResult 欄位無法使用。

### 決策 3：Task SSE 串流使用獨立 pg_notify 通道

**採用：** 新增 `task_updates` pg_notify 通道，與現有 `test_run_logs` 通道分開  
**原因：** 防止 Task-level 事件污染現有 Run-level SSE 訂閱者，且 Task 事件只需 `progress` / `completed` 兩種，不需要逐行日誌。  
**替代方案考慮：** 複用 `test_run_logs` 並加 taskId 欄位過濾。可行但語義混亂。

### 決策 4：Task.scope + scopeId 設計

**採用：** `scope: "project" | "group" | "testcase"`，`scopeId: string`（對應各自的 UUID）  
**原因：** 單一欄位對表達三種觸發範圍，不需要三個 nullable 外鍵（projectId?、groupId?、testcaseId?），更簡潔。  
**替代方案考慮：** 三個獨立 nullable 外鍵。語義更明確但冗餘。

### 決策 5：前端統一以 /project/:projectId/tasks/:taskId 為監控 URL

**採用：** 所有觸發 API 返回後，前端導向 `/project/:projectId/tasks/:taskId`  
**原因：** 讓批次監控頁面有持久化 URL（A 需求），同時保持與現有路由結構的一致性。  
**影響：** 原先單一 Run 執行後導向 `/runs/:runId` 的行為改為導向 `/tasks/:taskId`，TaskDetailView 內可點擊各個 Run 進入 SSE 日誌頁。

## Risks / Trade-offs

- **[Risk] Worker 更新 Task 失敗但 TestRun 已完成** → Mitigation：Task 更新邏輯包裹在 try/catch，失敗時記錄 error log 但不影響 TestRun 已寫入的完成狀態；Task 最終一致性由下次 GET /tasks/:taskId 的 doneCount 聚合作為備援核查。
- **[Risk] nullable task 外鍵造成舊資料 UI 顯示異常** → Mitigation：前端 SSEConsoleView 保持現有路由 `/project/:projectId/run/:runId`，使舊 run 頁面不受影響；只有透過 TaskDetailView 才需要 task 資訊。
- **[Trade-off] 單一測試案例也透過 Task** → 前端導向邏輯從 `/runs/:runId` 改為 `/tasks/:taskId`，用戶需多一層跳轉到具體 SSE 日誌。→ 在 TaskDetailView 中提供直接點擊 Run 進入日誌的快速入口（UX 補償）。

## Migration Plan

1. 後端：新增 `Task` entity 並讓 TypeORM 自動遷移（新增 task 表、test_run 表新增 nullable taskId 外鍵）
2. 後端：更新三個觸發 API 與 Worker
3. 前端：更新 API 封裝與型別，新增 TaskDetailView 與路由，更新所有觸發邏輯的導航

Rollback：Task 外鍵 nullable，舊 TestRun 不影響；可回滾到不使用 Task 的前端版本而資料庫不需要清理。

## Open Questions

（無 — 所有設計決策已在 Explore 階段確認）
