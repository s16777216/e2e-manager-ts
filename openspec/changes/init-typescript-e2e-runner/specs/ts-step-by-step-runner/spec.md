## ADDED Requirements

### Requirement: TS JSON Test Scenario Parsing
系統 MUST 能夠解析符合結構的 JSON 測試劇本檔案（使用 Zod 進行欄位驗證），包含：唯一的 `id`、腳本名稱 `name`、測試步驟清單 `steps` 與預期結果描述 `expected`。

#### Scenario: Parse TS valid test cases
- **WHEN** 系統讀取一個格式正確的 TS JSON 測試劇本
- **THEN** 系統成功解析並初始化測試步驟佇列與預期結果變數

### Requirement: TS Step-by-Step execution queue
系統 MUST 依照測試步驟清單的順序，逐步調度並完成每一個步驟。在步驟 $n$ 成功完成前，不得執行步驟 $n+1$。

#### Scenario: Execute TS steps in sequence
- **WHEN** 系統啟動測試案例
- **THEN** 系統從第一個步驟（$n=1$）開始執行，成功完成後依序前進到下一個步驟，直到所有步驟執行完畢

### Requirement: LLM TS Step Reasoning using Playwright Tools
對於每個步驟，系統 MUST 將「當前步驟描述」、「當前網址」、「當前 DOM 結構」與「當前視窗截圖」發送給 Gemini LLM。由 LLM 根據這些資訊，決策並呼叫合適的 Playwright 模擬操作工具（如點擊、輸入等），並在網址相符時引導其呼叫 finish_step。

#### Scenario: Execute TS tool call for step
- **WHEN** 執行單一步驟時，Gemini LLM 判定需要點擊特定按鈕
- **THEN** 系統透過 Playwright 執行點擊操作，並將更新後的網頁狀態（DOM 與截圖）回傳給 Gemini LLM 進行下一步決策，直到該步驟完成
