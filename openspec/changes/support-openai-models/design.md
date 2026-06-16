## Context

基於 `system-settings` 變更案所建立的全域設定與 API 管道，本設計文件專注於引入對 OpenAI API 相容模型的支援，實作 LLM 動態生產工廠，並重構 E2E 執行核心（LangGraph）的決策及斷言模型初始化，實現雙供應商（Gemini / OpenAI Compatible）的無縫切換。

## Goals / Non-Goals

**Goals:**
- 後端引入 `@langchain/openai` 依賴。
- 擴充 `settings.json` 資料結構，納入 `provider`、API Keys、Base URL、`geminiModel`、`asserterModel`、`openaiModel` 與 `openaiAsserterModel` 等 AI 參數。
- 實作 `LLMFactory` 模組，依據全域設定檔，動態實例化並回傳 `ChatGoogleGenerativeAI` 或是 `ChatOpenAI` 實例。
- 調整 `graph.ts` 中決策模型與斷言模型的初始化過程，改成調用 `LLMFactory` 取得實例。
- 確保視覺斷言 Asserter 在實例化 `.withStructuredOutput` 時套用 `{ includeRaw: true }`，重構 `asserterNode` 以同時相容兩種模型的 Token 使用量統計與 Zod 結構化校驗。
- 在前端已有的 `SettingsView.tsx` 中，擴充並新增「AI 決策核心配置」表單卡片，實現動態參數的填寫與儲存。

**Non-Goals:**
- 本次設計不包含在後端多資料庫連線配置切換。
- 不包含調整瀏覽器 Viewport、SlowMo、Headless 模式等基礎設定（這些已由 `system-settings` 實作完成）。

## Decisions

### 1. 實作 LLMFactory 進行 ChatGoogleGenerativeAI 與 ChatOpenAI 介面整合
- **決策說明**：建立統一的 LLM 生產工廠，根據 `settings.json` 的 `provider` 返回對應的模型實例。
- **理由**：`ChatOpenAI` 與 `ChatGoogleGenerativeAI` 繼承自相同的 Base Class，均實作了標準的 `.bindTools()` 及 `.withStructuredOutput()` 介面。透過工廠封裝，可以讓 LangGraph 的執行器與斷言器運作邏輯完全不需做分支判斷，降低核心邏輯複雜度。

### 2. 視覺斷言模型啟用 `includeRaw: true`
- **決策說明**：在 `LLMFactory` 中，當為斷言模型實例化 `.withStructuredOutput` 時，一律帶入 `{ includeRaw: true }` 參數。
- **理由**：結構化輸出會過濾掉原始的 `AIMessage` 物件，導致無法讀取 `usage_metadata`。啟用 `includeRaw` 後，模型 invoke 的回傳結構會變為 `{ parsed, raw }`，我們可以從 `raw.usage_metadata` 中安全且一致地讀取 Token，不論提供者是 Gemini 還是 OpenAI。

## Risks / Trade-offs

- **[風險]**: 使用者設定了不正確的 OpenAI Base URL 或 API Key，導致測試啟動時 LLM 呼叫失敗。
  - **[對策]**: 在 `graph.ts` 中執行 LLM 呼叫時，捕獲連線或認證錯誤，將其轉換為友善的文字訊息寫入 `TestRun` 的 `finalReason` 中，使前端能清晰呈現失敗原因，而非卡在背景死鎖。
- **[風險]**: 不同模型對 Tool Calling 或 Vision 格式的支援程度不同（有些本地開源模型可能不支援 vision 或 tool calling 導致報錯）。
  - **[對策]**: 在前端與說明文件中提示使用者：欲切換為 OpenAI 格式時，請確認所選模型具備多模態（Vision）與工具呼叫（Tool Calling / Function Calling）功能，如 `gpt-4o`、`gpt-4o-mini` 或本機 `llama3.2-vision`。
