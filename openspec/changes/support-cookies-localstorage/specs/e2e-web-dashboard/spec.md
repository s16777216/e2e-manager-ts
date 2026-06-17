## ADDED Requirements

### Requirement: Cookie and LocalStorage Pre-injection Configuration Form
前端介面 MUST 提供編輯與新增測試案例的 UI 配置，以支援輸入 JSON 格式的 Cookie 與 LocalStorage 預設資訊，且在執行測試前將其寫入 Playwright Context 中。

#### Scenario: Edit testcase with environment injection
- **WHEN** 使用者在建立或編輯測試案例時，展開「進階環境設定」並輸入有效的 Cookie 與 LocalStorage JSON 後儲存
- **THEN** 前端將其傳送至 API，且於啟動測試時，Playwright 自動載入此 Cookie 並在頁面初始化時注入對應的 LocalStorage 值
