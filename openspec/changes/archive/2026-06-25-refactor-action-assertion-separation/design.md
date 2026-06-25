## Context

目前的 E2E 測試框架中，AI Executor（單步執行器）擁有過度的自主權。它既要執行瀏覽器操作工具，又要自我判定是否達成了步驟的預期結果。
當步驟「沒有預期結果」時，AI 因為沒有明確的驗證依據，在看到點擊（如查詢）後畫面沒有大變化時，會陷入「懷疑沒有點到 ➔ 重複點擊」的死循環，直到次數上限（5 次）失敗。
此設計旨在將「動作執行（Executor）」與「結果驗證（Asserter）」在框架與狀態機層面進行徹底分離，從而消除自我懷疑死循環，並降低無驗證步驟的 Token 與時間開銷。

## Goals / Non-Goals

**Goals:**
* 移去 AI Executor 的 `finish_step` 自我結束權力，引入 `done_acting` 工具，使其退化為「純粹的動作執行器」。
* 實現框架級別的步驟自動結束：當步驟沒有預期結果時，動作執行成功後直接在框架層面判定為成功並前進，不需 AI 重複推理判定。
* 實現獨立的單步驗證：當步驟有預期結果時，由後端框架調用獨立的 `Step Asserter` 進行斷言。若不符預期，則將原因反饋給 Executor 以進行操作重試。
* 將異步等待控制權歸還使用者：由使用者在步驟描述中指定等待（如「點擊並等待 2 秒」），Executor 僅忠實執行工具，框架不額外猜測等待時間。

**Non-Goals:**
* 修改全域測試案例最後的最終驗證（Asserter Node）的呼叫邏輯。
* 在前端對步驟展示介面做大幅度修改。

## Decisions

### 1. 移去 `finish_step`，引入 `done_acting` 工具
* **決策**：AI Executor 唯一的終端工具改為 `done_acting`，其語意改為「我已完成步驟描述中的所有必要動作」。
* ** rationale**：避免 AI 將「完成動作」與「驗證通過」的概念混淆。當沒有預期結果時，AI 只要點擊/輸入完畢，就可以放心地呼叫 `done_acting` 結束操作。

### 2. LangGraph 引入 `Step Asserter` 節點與條件路由
* **決策**：在 `StateGraph` 中新增節點 `step_asserter`，並重構 Executor 的條件路由：
  ```
                   [Executor Node]
                          │
                   (呼叫 done_acting)
                          │
                          ▼
            /───────────────────────────\
           <   當前步驟有步驟預期結果嗎？   >
            \───────────────────────────/
                     /          \
                   Yes           No
                   /              \
                  ▼                ▼
          [Step Asserter]    [Step Tracker] (自動完成)
  ```
* **運作機制**：
  - `Step Asserter` 會呼叫一個獨立的 Prompt `buildStepAsserterSystemPrompt`，對照當前網頁截圖與步驟預期結果。
  - 若 **PASS** ➔ 前進至 `Step Tracker`（進入下一步驟）。
  - 若 **FAIL** ➔ 前進至 `Executor`（重試），並將失敗原因寫入 `logs` 作為 context 餵給 Executor 以指導其下一輪操作（例如提示「你已點擊，但列表並未加載，請重新點擊或等待」）。

### 3. 等待職責完全移交步驟操作描述
* **決策**：系統 Prompt 不再包含任何「自行判斷是否等待」的模糊引導。如果步驟在點擊後需要載入，使用者必須在步驟描述中寫明（例如「點擊搜尋按鈕並等待 2 秒」），AI 就會老實地執行 `click_element` 之後再執行 `wait_for_seconds`，然後呼叫 `done_acting`。這確保了系統行為的高度可預測性。

## Risks / Trade-offs

* **[Risk]**: Executor 在執行複合步驟（如輸入帳號且點擊登入）時，在第一個輸入完後就提早呼叫了 `done_acting`。
  - *Mitigation*: 在 Executor 系統 Prompt 中強調「必須在完成該步驟描述中要求的所有必要動作後，才能呼叫 `done_acting`」。
* **[Risk]**: 在有預期結果的步驟中，每次重試都要呼叫一次獨立的 `Step Asserter`，導致 LLM 呼叫次數和 Token 開銷增加。
  - *Mitigation*: 由於單步 Asserter 僅負責布林值判定，不需要執行複雜的操作或推理，我們在代碼中可以使用更輕量、便宜且速度更快的模型（如 `gemini-1.5-flash`）來擔任 `Step Asserter`，以降低成本並提升整體速度。
