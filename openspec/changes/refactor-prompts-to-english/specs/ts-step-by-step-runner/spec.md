## MODIFIED Requirements

### Requirement: LLM TS Step Reasoning using Playwright Tools
對於每個步驟，系統 MUST 將「當前步驟描述」、「當前網址」、「當前 DOM 結構」與「當前視窗截圖」發送給 Gemini LLM。由 LLM 根據這些資訊，決策並呼叫合適的 Playwright 模擬操作工具（如點擊、輸入等），並在網址相符時引導其呼叫 finish_step。系統向 LLM 發送提示詞時，MUST 使用結構化全英文的 System Prompt (English Core) 作為角色定義、步驟引導與強烈規則約束，以確保最高的指令遵循率與工具調用精準度。

#### Scenario: Execute TS tool call for step
- **WHEN** 執行單一步驟時，Gemini LLM 判定需要點擊特定按鈕
- **THEN** 系統透過 Playwright 執行點擊操作，並將更新後的網頁狀態（DOM 與截圖）回傳給 Gemini LLM 進行下一步決策，直到該步驟完成
