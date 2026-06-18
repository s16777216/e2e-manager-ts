## ADDED Requirements

### Requirement: Multi-level Pre-injection Configuration UI
前端介面 MUST 在專案編輯、群組編輯、以及測試案例編輯對話框中，提供「進階環境設定」的摺疊表單，以支援輸入 JSON 格式的 Cookie 與 LocalStorage 預設資訊。

#### Scenario: Edit settings with JSON validation
- **WHEN** 使用者在專案、群組或測試案例中展開「進階環境設定」，輸入 JSON 並點擊儲存時
- **THEN** 前端進行格式驗證，驗證成功後送往 API 儲存，且於執行測試時，Playwright 會套用合併後的設定
