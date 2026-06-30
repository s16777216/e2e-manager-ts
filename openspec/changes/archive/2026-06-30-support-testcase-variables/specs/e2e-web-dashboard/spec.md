## ADDED Requirements

### Requirement: Variable Configuration UI Form
前端介面 MUST 在專案編輯、群組編輯、與測試案例對話框中，提供「環境變數設定」摺疊面板。面板內 MUST 提供可動態新增與刪除的鍵值對（Key-Value pairs）輸入表格，並在儲存前校驗變數名稱不可包含特殊字元或空白。

#### Scenario: Configure variables for project or testcase
- **WHEN** 使用者在建立或編輯測試案例時，在「環境變數設定」面板中新增鍵值對 `key: "baseUrl"`、`value: "http://prod.com"` 並儲存時
- **THEN** 前端將該變數序列化為 JSONB 發送給 API 儲存，並可在步驟、環境設定或預期結果中以 `{{baseUrl}}` 來進行引用
