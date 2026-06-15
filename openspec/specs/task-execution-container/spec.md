# task-execution-container Specification

## Purpose
TBD - created by archiving change batch-task-entity. Update Purpose after archive.
## Requirements
### Requirement: Unified Task Execution Container
系統 MUST 提供 `Task` 實體作為所有測試執行觸發的頂層容器。`Task` SHALL 支援三種執行範圍（scope）：`"project"`（執行整個專案的所有測試案例）、`"group"`（執行指定群組及其子群組的所有測試案例）與 `"testcase"`（執行單一測試案例）。`Task` 實體 MUST 持久化記錄 `scope`、`scopeId`（對應資源的 UUID）、`totalCount`（此批次排入的測試案例總數）、`doneCount`（已完成的執行數）、`status`（`pending` / `running` / `done`）、`finalResult`（`PASS` / `FAIL` / `null`）、`createdAt` 與 `finishedAt`。

#### Scenario: Create Task and TestRuns when triggering project-wide execution
- **WHEN** 使用者呼叫 `POST /api/projects/:projectId/run`
- **THEN** 系統 MUST 建立一個 scope="project" 的 Task，查詢該專案下所有測試案例並為每個案例建立一個關聯的 TestRun（status=pending），Task.totalCount = 測試案例數量，API 回傳 `{ taskId, runs: [{ runId, testcaseName, status }] }`

#### Scenario: Create Task and TestRuns when triggering group execution
- **WHEN** 使用者呼叫 `POST /api/groups/:groupId/run`
- **THEN** 系統 MUST 建立一個 scope="group" 的 Task，遞迴查詢該群組及其所有子群組下的測試案例並為每個案例建立關聯的 TestRun，Task.totalCount = 測試案例數量，API 回傳 `{ taskId, runs: [{ runId, testcaseName, status }] }`

#### Scenario: Create Task and single TestRun when triggering single testcase execution
- **WHEN** 使用者呼叫 `POST /api/testcases/:id/run`
- **THEN** 系統 MUST 建立一個 scope="testcase" 的 Task，並建立一個關聯的 TestRun（status=pending），Task.totalCount = 1，API 回傳 `{ taskId, runs: [{ runId, testcaseName, status }] }`

### Requirement: Worker Updates Task Progress After Each Run Completion
後端 Worker 在每個 `TestRun` 執行完成（status 變為 passed / failed / error）後，MUST 對其所屬的 `Task`（若存在）執行原子性進度更新：以 SQL `UPDATE task SET doneCount = doneCount + 1` 遞增計數。當 `doneCount` 達到 `totalCount` 時，Worker MUST 計算 `Task.finalResult`（若所有 Run 均 passed 則為 `"PASS"`，否則為 `"FAIL"`），更新 `Task.status = "done"`、`Task.finishedAt = now()`，並透過 `pg_notify` 的 `task_updates` 通道發送任務完成事件。每次 doneCount 更新時，SHALL 發送 progress 事件通知前端即時更新進度條。

#### Scenario: Task progress updated atomically after each TestRun completion
- **WHEN** Worker 完成一個 TestRun 的執行，且該 TestRun 屬於某個 Task
- **THEN** 系統 MUST 原子性地執行 `UPDATE task SET doneCount = doneCount + 1`，並透過 `task_updates` pg_notify 通道發送 `{ taskId, event: "progress", doneCount, totalCount }` 事件

#### Scenario: Task marked done when all TestRuns complete
- **WHEN** Task.doneCount 在更新後等於 Task.totalCount（所有關聯 TestRun 均已完成）
- **THEN** 系統 MUST 計算 finalResult（全部 passed → "PASS"，否則 "FAIL"），更新 Task.status = "done"、Task.finishedAt，並透過 `task_updates` pg_notify 通道發送 `{ taskId, event: "completed", finalResult, status: "done" }` 事件

### Requirement: Task Query and SSE Stream APIs
系統 MUST 提供 REST API 以查詢 Task 詳情與執行進度。`GET /api/tasks/:taskId` SHALL 回傳 Task 的所有欄位及其所屬 TestRun 的摘要（runId、testcaseId、testcaseName、status）。`GET /api/tasks/:taskId/stream` MUST 提供 Server-Sent Events 串流，訂閱 `task_updates` pg_notify 通道，僅回傳屬於指定 taskId 的 progress 與 completed 事件。`GET /api/projects/:projectId/tasks` SHALL 回傳該專案歷史上所有 Task 的列表（含 status、scope、totalCount、doneCount、finalResult、createdAt），依建立時間降冪排列。

#### Scenario: Retrieve task detail with run statuses
- **WHEN** 前端發送 `GET /api/tasks/:taskId`
- **THEN** API 回傳 Task 所有欄位及各 TestRun 的 `{ runId, testcaseId, testcaseName, status }` 摘要陣列

#### Scenario: Stream real-time task progress via SSE
- **WHEN** 前端透過 EventSource 訂閱 `GET /api/tasks/:taskId/stream`，且後端 Worker 更新 Task 進度時發送 pg_notify
- **THEN** 前端即時收到 `{ taskId, event: "progress", doneCount, totalCount }` 或 `{ taskId, event: "completed", finalResult }` 事件

#### Scenario: List project task history
- **WHEN** 前端發送 `GET /api/projects/:projectId/tasks`
- **THEN** API 依時間降冪回傳該專案所有 Task 的摘要列表，每個項目包含 taskId、scope、status、finalResult、totalCount、doneCount、createdAt、finishedAt

