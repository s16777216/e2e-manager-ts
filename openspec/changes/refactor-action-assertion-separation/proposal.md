## Why

目前測試步驟執行器（AI Executor）同時兼負了「動作操作」與「預期結果驗證」雙重職責。當執行沒有預期結果的步驟（例如點擊查詢按鈕重新整理列表）時，AI 因缺乏驗證指標而陷入自我懷疑的重試死循環（重複點擊），直到次數超限失敗。此外，讓 AI 自主決策何時結束步驟也增加了重複評估的 Token 與時間消耗。將「動手操作」與「畫面驗證」職責分離，能徹底根治死循環問題，並大幅提高執行效能與穩定度。

## What Changes

1. **動作與驗證分離**：AI Executor 轉型為「純動作執行器」，僅忠實執行步驟中的操作描述，並在操作完成後呼叫 `done_acting` 工具。它不再感知與判斷預期結果。
2. **框架級別自動結束**：
   - 當步驟**無預期結果**時，後端框架直接攔截 `done_acting` 並自動結束該步驟，不交還 AI 重複點擊，徹底防止死循環並節省約 50% 推理開銷。
   - 當步驟**有預期結果**時，後端框架攔截 `done_acting`，並調用獨立的 `Step Asserter` 節點進行畫面驗證。
3. **單步 Asserter 節點**：引入獨立的 `Step Asserter` 代理人。它只負責對照當前截圖與步驟預期結果，若不符預期則將錯誤反饋給 Executor，驅使 Executor 重試。
4. **等待職責歸還使用者**：將異步載入與動畫等待的控制權交給步驟操作描述本身（例如：使用者在案例中寫明「點擊送出並等待 2 秒」），Executor 僅忠實執行描述中的等待，不需自主猜測是否該等待。
5. **重命名終端工具**：移去原有的 `finish_step` 工具，新增 `done_acting` 工具。

## Capabilities

### New Capabilities
- `action-assertion-separation`: 實現 AI 動作執行（Executor）與步驟結果驗證（Asserter）分離的雙主體運行架構，支援框架級別自動結束與引導。

### Modified Capabilities
- `step-assertion-and-alignment`: 修改既有的步驟斷言與對齊規格，將步驟級別預期結果的驗證邏輯從執行節點（Executor）轉移至獨立的單步斷言節點。

## Impact

- **Backend Tools**:
  - `backend/src/tools.ts`: 移去 `finish_step`，新增 `done_acting` 工具。
- **Graph & Router**:
  - `backend/src/graph.ts`: 新增 `step_asserter` 節點，重構 `StateGraph` 的節點流向。
  - `backend/src/graph/router.ts`: 調整 `routeAfterExecution` 邏輯以攔截 `done_acting`，並支援分流（有預期結果走向 `step_asserter`；無預期結果走向 `step_tracker`）。
- **Prompts**:
  - `backend/src/graph/prompt.ts`: 大幅精簡 `buildExecutorSystemPrompt`，並新增 `buildStepAsserterSystemPrompt`。
