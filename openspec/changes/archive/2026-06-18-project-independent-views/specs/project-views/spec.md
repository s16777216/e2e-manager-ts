## ADDED Requirements

### Requirement: Project Creation View
系統 SHALL 提供專屬的專案建立頁面，路由路徑為 `/project/new`。該頁面 SHALL 渲染專案名稱、專案描述等輸入欄位。

#### Scenario: Navigate and create project
- **WHEN** 使用者於 `/project/new` 填寫有效的專案名稱並送出
- **THEN** 前端呼叫建立專案 API，建立成功後自動跳轉至該專案的詳情頁面 `/project/:projectId`

### Requirement: Project Edit View
系統 SHALL 提供專屬的專案編輯頁面，路由路徑為 `/project/:projectId/edit`。該頁面 SHALL 載入該專案的現有設定，並支援變更基本資訊、Cookie、LocalStorage 及執行專案刪除操作。

#### Scenario: Edit and save project settings
- **WHEN** 使用者於 `/project/:projectId/edit` 修改設定並點擊「儲存修改」
- **THEN** 前端呼叫更新專案 API，更新成功後提示儲存成功，並自動導航回該專案的詳情頁面 `/project/:projectId`

#### Scenario: Delete project with verification
- **WHEN** 使用者於 `/project/:projectId/edit` 的危險區域點擊刪除，並在二次確認區輸入與專案完全相同的名稱後點擊確定
- **THEN** 前端呼叫刪除專案 API，刪除完成後自動跳轉回專案列表首頁 `/project`
