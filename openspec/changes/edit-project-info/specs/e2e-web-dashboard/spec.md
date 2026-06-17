## ADDED Requirements

### Requirement: Project Metadata Editing and Deletion
系統 MUST 提供專案資訊的編輯與刪除介面。編輯介面中 MUST 允許更新專案名稱與專案描述。刪除功能 MUST 提供二次確認，要求使用者輸入專案名稱以完成刪除，防止誤操作。

#### Scenario: Edit project information from project detail page
- **WHEN** 使用者進入專案詳細頁，點擊專案名稱旁的編輯按鈕，修改專案名稱或描述並點擊儲存
- **THEN** 前端發送 PATCH 請求更新資料，並在更新成功後即時在頁面上反映修改後的名稱與描述，同時彈出成功通知

#### Scenario: Delete project with confirmation
- **WHEN** 使用者在編輯專案對話框中點擊刪除按鈕，並在二次確認框中輸入正確的專案名稱並點擊確認
- **THEN** 前端發送 DELETE 請求刪除專案，在刪除成功後彈出成功通知，並自動導向專案列表首頁 `/project`
