## ADDED Requirements

### Requirement: TestCase Detail Page Layout
測試案例詳情頁面 SHALL 提供分頁標籤 (Tabs)，以區隔「測試步驟 (Steps)」與「執行歷史 (History)」的呈現，且當處於編輯模式下時，分頁標籤必須被禁用以防未存檔變更流失。

#### Scenario: Switching between steps and history tabs
- **WHEN** user clicks on the "Steps" or "History" tab
- **THEN** the system switches the main content area to display the corresponding view

### Requirement: TestCase Step and Parameter Editing
系統 SHALL 支援測試案例編輯模式，允許使用者修改「測試案例名稱」、「自然語言步驟清單（支援引用環境變數、動態增減步驟與切換步驟預期結果開關）」、「全域預期結果」以及「Cookies/LocalStorage」與「環境變數」設定。

#### Scenario: Saving test case edits
- **WHEN** user edits the fields in the form and clicks "Save"
- **THEN** the system calls the update API and refreshes the page content with the updated values

### Requirement: Deleting Test Case Confirmation
當使用者請求刪除測試案例時，系統 SHALL 顯示二次確認彈窗，要求使用者輸入該測試案例的完整名稱以解鎖確認按鈕，確認後才執行刪除。

#### Scenario: Deleting test case with matching confirmation name
- **WHEN** user types the exact name of the test case and clicks "Confirm Delete"
- **THEN** the system deletes the testcase and redirects to the project detail view
