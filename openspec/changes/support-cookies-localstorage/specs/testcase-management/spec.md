## ADDED Requirements

### Requirement: Multi-level Environment Setting DB Support
系統 MUST 在 `Project`、`TestGroup` 與 `Testcase` 的資料結構中皆支援 `initCookies` (JSON 陣列) 與 `initLocalStorage` (JSON 鍵值對) 屬性。

#### Scenario: Database schema and API transmission
- **WHEN** 查詢或更新專案、群組、測試案例詳情時
- **THEN** API 回傳的資料結構中 SHALL 包含對應的 `initCookies` 與 `initLocalStorage` 欄位

### Requirement: Inheritance and Merging of Environment Settings
系統在執行測試案例時，MUST 將專案、群組（含父群組）與測試案例的 `initCookies` 與 `initLocalStorage` 沿著繼承鏈進行合併。

#### Scenario: Playwright execution with merged settings
- **WHEN** 執行測試案例且該案例所屬的專案或群組有設定預置環境時
- **THEN** 後端 Playwright 執行器依 `Project -> Group -> Testcase` 優先權合併資料，並將結果注入瀏覽器 Context
