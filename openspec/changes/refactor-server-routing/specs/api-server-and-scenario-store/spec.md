## MODIFIED Requirements

### Requirement: Project and Group Hierarchical CRUD Operations
系統 MUST 提供專案（Project）與群組（Group）的 CRUD 管理端點。群組端點 MUST 支援透過 `parent_id` 建立嵌套子群組，並在更新 `parent_id` 時驗證防止循環引用。此外，系統的 API 路由模組 SHALL 進行模組化拆分與解耦，且保證外部 API 的存取路徑與響應行為完全不變。

#### Scenario: Create nested sub-group under parent group
- **WHEN** 客戶端發送 `POST /api/projects/:projectId/groups`，帶有 `parent_id` 欄位指向同專案的現有群組
- **THEN** 系統成功儲存該群組，並回傳 HTTP 201 狀態碼

#### Scenario: Prevent circular parent-child reference loop
- **WHEN** 客戶端發送 `PUT /api/groups/:groupId` 嘗試將 `parent_id` 設為自己或自己底下的子群組
- **THEN** 系統阻擋更新，回傳 HTTP 400 狀態碼與循環引用錯誤訊息
