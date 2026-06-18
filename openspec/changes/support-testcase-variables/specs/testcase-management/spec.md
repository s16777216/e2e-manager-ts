## ADDED Requirements

### Requirement: Multi-level Testcase Variable Storage
系統 MUST 在 `Project`、`TestGroup` 與 `Testcase` 的實體中，皆支援 `variables` 屬性（格式為 JSONB 鍵值對 `Record<string, string>`），以儲存自訂環境變數。

#### Scenario: Database schema and API transmission for variables
- **WHEN** 查詢或更新專案、群組或測試案例詳情時
- **THEN** API 回傳的資料結構中 SHALL 包含對應的 `variables` 欄位

### Requirement: Variable Interpolation Engine
系統在執行測試案例前，MUST 將專案、群組與測試案例的 `variables` 沿繼承鏈（`Project -> Group -> Testcase`）進行淺合併，並將測試案例的 `steps` 陣列、`expected`、`initCookies` 與 `initLocalStorage` 中所有的 `{{variableName}}` 預留位置，替換為對應的變數真實值。

#### Scenario: Playwright execution with interpolated variables
- **WHEN** 執行測試案例，且該測試案例的步驟中包含 `{{baseUrl}}` 等變數預留位置時
- **THEN** 後端在執行前，自動在記憶體中將該步驟替換為真實的值，並交付給 Playwright 與 AI Agent 執行
