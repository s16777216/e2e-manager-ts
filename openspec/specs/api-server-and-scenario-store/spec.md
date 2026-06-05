# api-server-and-scenario-store Specification

## Purpose
TBD - created by archiving change serverize-e2e-manager-with-db. Update Purpose after archive.
## Requirements
### Requirement: Project and Group Hierarchical CRUD Operations
系統 MUST 提供專案（Project）與群組（Group）的 CRUD 管理端點。群組端點 MUST 支援透過 `parent_id` 建立嵌套子群組，並在更新 `parent_id` 時驗證防止循環引用（例如群組不能成為自身的子群組）。

#### Scenario: Create nested sub-group under parent group
- **WHEN** 客戶端發送 `POST /api/projects/:projectId/groups`，帶有 `parent_id` 欄位指向同專案的現有群組
- **THEN** 系統成功儲存該群組，並回傳 HTTP 201 狀態碼

#### Scenario: Prevent circular parent-child reference loop
- **WHEN** 客戶端發送 `PUT /api/groups/:groupId` 嘗試將 `parent_id` 設為自己或自己底下的子群組
- **THEN** 系統阻擋更新，回傳 HTTP 400 狀態碼與循環引用錯誤訊息

### Requirement: Testcase CRUD Operations
系統 MUST 提供端點以管理群組下的測試案例（Testcases），支援清單查詢、建立、詳情查詢、更新與刪除。建立測試案例時，系統 MUST 驗證 steps 屬性為非空陣列，且 expected 屬性不為空。

#### Scenario: Create valid testcase under specific group
- **WHEN** 客戶端發送 `POST /api/groups/:groupId/testcases` 且包含有效欄位（name, steps 陣列, expected）
- **THEN** 系統將測試案例寫入 `testcases` 表，並回傳 HTTP 201 與新建之案例 ID

### Requirement: Testcase Execution Trigger and Run Query
系統 MUST 提供端點以非同步觸發測試案例執行（`POST /api/testcases/:id/run`）並即時返回執行任務的 ID。客戶端 MUST 能夠透過該 ID 查詢執行狀態（`GET /api/runs/:runId`）。

#### Scenario: Trigger testcase run asynchronously
- **WHEN** 客戶端發送 `POST /api/testcases/:id/run` 觸發已有測試案例之執行
- **THEN** 系統回傳 HTTP 202 狀態碼，回傳包含 `runId` 的 JSON 響應，並將任務派發至背景執行佇列

#### Scenario: Query run status and details of execution
- **WHEN** 客戶端發送 `GET /api/runs/:runId` 查詢當前狀態
- **THEN** 系統回傳該任務狀態（`pending` | `running` | `passed` | `failed` | `error`）、詳細步驟執行歷程日誌與截圖下載網址

