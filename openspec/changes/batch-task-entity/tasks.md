## 1. 後端資料層：新增 Task 實體

- [ ] 1.1 建立 `backend/src/entities/Task.ts` — 定義欄位：id(uuid)、scope("project"|"group"|"testcase")、scopeId、status("pending"|"running"|"done")、finalResult("PASS"|"FAIL"|null)、totalCount、doneCount、createdAt、finishedAt
- [ ] 1.2 修改 `backend/src/entities/TestRun.ts` — 新增 `@ManyToOne(() => Task)` 的 nullable task 外鍵欄位
- [ ] 1.3 在 `backend/src/db.ts` (AppDataSource entities 列表) 中引入 Task entity，驗證 TypeORM 自動建立 task 表與 test_run.taskId 外鍵欄位

## 2. 後端 API：重構觸發端點，新增 Task 路由

- [ ] 2.1 修改 `backend/src/routes/run.ts` — `POST /testcases/:id/run`：先建立 Task(scope="testcase", scopeId=testcaseId, totalCount=1)，再建立 TestRun 並關聯至 Task，回傳 `{ taskId, runs: [{ runId, testcaseName, status }] }`
- [ ] 2.2 修改 `backend/src/routes/run.ts` — `POST /projects/:projectId/run`：先建立 Task(scope="project")，再批量建立 TestRun 並關聯至 Task，回傳 `{ taskId, runs: [...] }`
- [ ] 2.3 修改 `backend/src/routes/run.ts` — `POST /groups/:groupId/run`：先建立 Task(scope="group")，再批量建立 TestRun 並關聯至 Task，回傳 `{ taskId, runs: [...] }`
- [ ] 2.4 新增 `GET /tasks/:taskId` 端點 — 回傳 Task 所有欄位 + 所有關聯 TestRun 的摘要（runId、testcaseId、testcaseName、status）
- [ ] 2.5 新增 `GET /tasks/:taskId/stream` SSE 端點 — 訂閱 `task_updates` pg_notify 通道，過濾屬於該 taskId 的 progress 與 completed 事件
- [ ] 2.6 新增 `GET /projects/:projectId/tasks` 端點 — 查詢該專案（透過 scope+scopeId 或 JOIN group/testcase 反查）的 Task 歷史列表，依 createdAt 降冪排列
- [ ] 2.7 在 `backend/src/server.ts` 中引入並掛載新的 task 路由

## 3. 後端 Worker：實作 Task 進度更新邏輯

- [ ] 3.1 修改 `backend/src/queue.ts` — 在 `executeJob()` 完成後（TestRun 寫入 passed/failed/error 後），讀取 run.task 外鍵
- [ ] 3.2 實作 `updateTaskProgress(taskId)` 方法：執行原子 SQL `UPDATE task SET doneCount = doneCount + 1 WHERE id = $1`，讀取更新後的 doneCount
- [ ] 3.3 若 doneCount < totalCount：透過 `task_updates` pg_notify 發送 `{ taskId, event: "progress", doneCount, totalCount }`
- [ ] 3.4 若 doneCount >= totalCount：計算 finalResult（查詢所有關聯 TestRun 判斷是否全部 passed），更新 Task.status="done"、Task.finalResult、Task.finishedAt，透過 `task_updates` pg_notify 發送 `{ taskId, event: "completed", finalResult, status: "done" }`

## 4. 前端型別與 API 封裝

- [ ] 4.1 修改 `frontend/src/types/api.ts` — 新增 `Task` 型別（id、scope、scopeId、status、finalResult、totalCount、doneCount、createdAt、finishedAt、runs: TaskRun[]）；新增 `TaskRun` 子型別（runId、testcaseId、testcaseName、status）
- [ ] 4.2 修改 `frontend/src/lib/api.ts` — 更新 `triggerRun`（回傳新增 taskId）、`runProject`、`runGroup` 三個觸發 API 的回傳型別均包含 `{ taskId, runs: [...] }`
- [ ] 4.3 新增 `api.getTask(taskId)` — `GET /api/tasks/:taskId`
- [ ] 4.4 新增 `api.getTaskStream(taskId)` URL helper — 回傳 SSE stream URL
- [ ] 4.5 新增 `api.getProjectTasks(projectId)` — `GET /api/projects/:projectId/tasks`

## 5. 前端：新增 TaskDetailView

- [ ] 5.1 建立 `frontend/src/views/TaskDetailView.tsx` — 讀取 `:taskId` 路由參數，呼叫 `api.getTask(taskId)` 載入 Task 資訊
- [ ] 5.2 實作 TaskDetailView 的 Task-level SSE 訂閱（訂閱 `api.getTaskStream(taskId)` EventSource），接收 progress / completed 事件並更新本地 doneCount、各 Run 的 status
- [ ] 5.3 實作 TaskDetailView Bento 監控面板 UI：頂部顯示 scope/範圍、進度條（doneCount/totalCount %）、最終結果 Badge
- [ ] 5.4 實作 TaskDetailView 的 Run 狀態 Grid（3 欄）：每個卡片顯示 testcaseName、runId 前綴、status Badge；點擊導航至 `/project/:projectId/run/:runId`
- [ ] 5.5 實作 TaskDetailView 麵包屑（setBreadcrumbs）：「專案列表 / 專案名稱 / 批次任務 #taskId 前綴」

## 6. 前端：更新 Router 與現有 Views

- [ ] 6.1 修改 `frontend/src/router.tsx`（或 App.tsx）— 新增 `/project/:projectId/tasks/:taskId` 路由，指向 `TaskDetailView`
- [ ] 6.2 修改 `frontend/src/views/GroupDashboardView.tsx` — `handleRun()` 觸發成功後，以 `taskId` 導向 `/project/:projectId/tasks/:taskId`（而非原本的 `/runs/:runId`）
- [ ] 6.3 修改 `frontend/src/views/TestCaseDetailView.tsx` — `handleRunTestCase()` 觸發成功後，以 `taskId` 導向 `/project/:projectId/tasks/:taskId`
- [ ] 6.4 修改 `frontend/src/views/ProjectDetailView.tsx` — 移除 `batchRuns` 和 `isBatchRunning` State 及 polling 邏輯；`handleRunAllProject()` 和 `handleRunGroup()` 觸發成功後，以 `taskId` 導向 TaskDetailView

## 7. 驗證

- [ ] 7.1 執行 `npm run build` 確認後端與前端 TypeScript 零錯誤
- [ ] 7.2 手動測試：點擊單一測試案例的「執行測試」→ 確認轉導至 TaskDetailView，Task scope="testcase"，1 個 Run 顯示
- [ ] 7.3 手動測試：點擊群組的「執行此群組所有測試案例」→ 確認 Task scope="group"，多個 Run 顯示進度
- [ ] 7.4 手動測試：點擊「執行所有案例」→ 確認 Task scope="project"，進度條即時更新，頁面重整後仍顯示正確狀態
- [ ] 7.5 手動測試：TaskDetailView 中點擊 Run 卡片 → 確認正確導向 SSEConsoleView 日誌頁
- [ ] 7.6 驗證 `GET /api/projects/:projectId/tasks` 回傳歷史批次列表
