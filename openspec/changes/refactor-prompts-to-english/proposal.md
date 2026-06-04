## Why

目前 E2E 測試管理器核心節點使用的 System Prompts 均為中文。在實際測試過程中，中文提示詞對於邏輯邊界條件的限制力（Instruction-following）在 Gemini 3.1 Flash Lite 上不夠穩定，偶爾會導致 AI 代理重複調用工具或未即時呼叫 `finish_step`。將核心提示詞重構為結構化的英文 (English Core)，能顯著提高模型工具調用的精準度、降低幻覺機率，並節省 Token 消耗。

## What Changes

- **重構步驟決策提示詞：** 將 `executorNode` 中的 System Prompt 重構為全英文，結構化地定義 Agent 的行為規則與強制性約束，僅將使用者的中文步驟與 DOM 以變數形式原樣傳入。
- **重構視覺斷言提示詞：** 將 `asserterNode` 的 System Prompt 重構為英文，使用更嚴格的指令規範其進行預期結果與最後截圖的比對。

## Capabilities

### New Capabilities
<!-- 無新增 Capability -->

### Modified Capabilities
- `ts-step-by-step-runner`: 重構 AI 決策與工具調用之 Prompt 語系與規則約束，提高步驟佇列執行的穩定性。
- `ts-step-assertion-and-reporting`: 重構視覺斷言的 Prompt 語系與指令約束，提升視覺 PASS/FAIL 判定的準確性。

## Impact

- **程式碼修改：** 僅需修改 `src/graph.ts` 中的 System Prompt 字串常數。
- **依賴與系統：** 無新增依賴，無外部系統影響。
