## ADDED Requirements

### Requirement: Testcase Init Cookie and LocalStorage DB Support
系統 MUST 在 Testcase 資料結構中支援 `initCookies` 與 `initLocalStorage` 屬性。系統於執行測試案例時，SHALL 將這些欄位資料正確傳遞給 Playwright 背景執行器。

#### Scenario: Database schema and API transmission
- **WHEN** 執行測試案例，或透過 API 請求測試案例詳情時
- **THEN** API 回傳的資料結構中 SHALL 包含對應的 `initCookies` (JSON 陣列) 與 `initLocalStorage` (鍵值對) 欄位
