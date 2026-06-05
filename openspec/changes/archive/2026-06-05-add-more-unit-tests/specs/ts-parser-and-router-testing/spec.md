## ADDED Requirements

### Requirement: JSON Test Script Validation Spec
系統 MUST 提供對 JSON 測試劇本的欄位結構驗證，驗證劇本必須包含非空的 `id`, `name`, `expected` 屬性，且 `steps` 屬性必須為包含至少一個非空字串的陣列。若輸入格式不符，系統 MUST 拋出具體的驗證錯誤。

#### Scenario: Parse valid JSON test script
- **WHEN** 系統解析一個各欄位完整且合法的劇本 JSON 檔案
- **THEN** 系統順利回傳符合 Zod Schema 定義的測試劇本物件

#### Scenario: Parse JSON test script with empty steps array
- **WHEN** 系統解析一個 steps 屬性為空陣列 `[]` 的劇本 JSON 檔案
- **THEN** 系統拋出包含「步驟清單至少需包含一個步驟」描述的驗證失敗錯誤

### Requirement: LangGraph State Machine Routing Logic Spec
系統 MUST 根據執行狀態（TestState）進行精確的狀態機節點流轉路由。路由機制 MUST 正確判斷步驟完成、單步重試次數超限與步驟全部結束等流控制行為。

#### Scenario: Route to step tracker on finish step call
- **WHEN** 條件路由檢測到當前執行日誌的最後一筆 action 包含 `finish_step` 呼叫
- **THEN** 路由函數 SHALL 回傳 `step_tracker` 以推進步驟

#### Scenario: Route to reporter on single step retry count threshold
- **WHEN** 條件路由檢測到單一測試步驟的重試次數達到上限 5 次且仍未完成
- **THEN** 路由函數 SHALL 回傳 `reporter` 以強制中斷並寫入失敗狀態

### Requirement: DOM Element Selector Generation Spec
系統 MUST 提供對 DOM 元素資訊計算 Locator Selector 的純演算法，支援以 `id`、`name`、`placeholder` 或是文字進行定位。計算時 MUST 對含有引號的文字進行安全轉義，避免 Playwright 定位語法出錯。

#### Scenario: Generate selector for element with quotes in text
- **WHEN** 傳入帶有雙引號文字（如 `Click "Here"`）的元素資訊
- **THEN** 演算法輸出將引號進行轉義後的 CSS 定位器（如 `button:has-text("Click \"Here\"")`）

### Requirement: Task Execution State Transition Spec
任務有限狀態機 MUST 基於純邏輯規則對任務狀態進行轉換（包括啟動、完成、超時、崩潰），並組裝對應的資料庫狀態 payload，確保業務描述語句（如超時分鐘數）精確生成。

#### Scenario: Generate timeout state payload
- **WHEN** 計算 10 分鐘超時的任務更新狀態
- **THEN** 狀態機回傳狀態設為 `failed` 且理由描述精確包含「10 分鐘」與對應時間戳記的更新 payload
