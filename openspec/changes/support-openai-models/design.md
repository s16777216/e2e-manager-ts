## Context

基於 `system-settings` 變更案所建立的 PostgreSQL 全域設定機制（`SystemSetting` entity 與 REST API），本設計文件專注於引入對 OpenAI API 相容模型的支援，實作 LLM 動態工廠，並重構 E2E 執行核心（LangGraph）的決策及斷言模型初始化，實現雙供應商（Gemini / OpenAI Compatible）的無縫切換。

## Goals / Non-Goals

**Goals:**
- 後端引入 `@langchain/openai` 依賴。
- 擴充 `backend/src/services/settingsService.ts` 的 `getSettings`，在 `aiConfig` JSONB 欄位為 `null` 時，回傳一組合理的預設 AI 參數（provider: "google"、預設 Gemini 模型名稱等）。
- 實作 `llmFactory.ts` 模組，依據 `SystemSetting.aiConfig.provider`，動態實例化並回傳 `ChatGoogleGenerativeAI` 或是 `ChatOpenAI` 實例。
- 調整 `graph.ts` 中決策模型（Executor）與斷言模型（Asserter）的初始化過程，改成調用 `llmFactory` 取得實例。
- 確保視覺斷言 Asserter 在實例化 `.withStructuredOutput` 時套用 `{ includeRaw: true }`，重構 `asserterNode` 以同時相容兩種模型的 Token 使用量統計與 Zod 結構化校驗。
- 在前端 `SettingsView.tsx` 中，新增一個獨立的「AI 決策核心配置」`FormBlock`（與現有「瀏覽器與執行參數」`FormBlock` 縱向並列），實現動態 AI 參數的填寫與儲存。

**Non-Goals:**
- 本次設計不包含後端多資料庫連線配置切換。
- 不包含調整瀏覽器 Viewport、SlowMo、Headless 模式等基礎設定（這些已由 `system-settings` 實作完成）。
- 不修改 `SystemSetting` entity 的資料庫 Schema（`aiConfig` JSONB 欄位已預留且就緒）。

## Architecture

### 資料流：設定 → 工廠 → 執行核心

```
┌─────────────────────────────────────────────────────────┐
│  Frontend: SettingsView (FormBlock: AI 決策核心配置)      │
│  POST /api/settings { aiConfig: { provider, apiKey... } }│
└───────────────────────────┬─────────────────────────────┘
                            │ HTTP
                            ▼
┌──────────────────────────────────────────────────────────┐
│  Backend: settingsService.saveSettings()                  │
│  → SystemSetting.aiConfig (PostgreSQL JSONB)              │
└───────────────────────────┬──────────────────────────────┘
                            │ 讀取
                            ▼
┌──────────────────────────────────────────────────────────┐
│  llmFactory.ts                                            │
│  getExecutorModel(aiConfig) → ChatGoogleGenerativeAI      │
│                             | ChatOpenAI                  │
│  getAsserterModel(aiConfig) → .withStructuredOutput(      │
│                                 schema, {includeRaw:true})│
└───────────────────────────┬──────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────┐
│  graph.ts: E2EGraphBuilder                                │
│  executorNode → this.model.bindTools(tools).invoke(...)   │
│  asserterNode → asserter.invoke(...) → { parsed, raw }    │
│                 token 從 raw.usage_metadata 讀取           │
└──────────────────────────────────────────────────────────┘
```

### `SystemSetting.aiConfig` JSONB 結構（已就緒，無需 Migration）

```typescript
aiConfig?: {
  provider?: string;        // "google" | "openai"
  apiKey?: string;          // Gemini API Key (provider=google)
  baseUrl?: string;         // OpenAI-compatible base URL
  openaiApiKey?: string;    // OpenAI API Key (provider=openai)
  geminiModel?: string;     // e.g. "gemini-2.0-flash"
  asserterModel?: string;   // Gemini asserter model
  openaiModel?: string;     // e.g. "gpt-4o"
  openaiAsserterModel?: string; // OpenAI asserter model
}
```

> `settingsService.getSettings()` 若 `aiConfig` 為 `null`，則在應用層補填預設值（不寫入 DB），確保呼叫方永遠取得完整結構。

## Decisions

### 1. 實作 `llmFactory` 進行模型介面整合

- **決策說明**：建立 `llmFactory.ts` 模組，根據 `aiConfig.provider` 回傳對應的模型實例。
- **理由**：`ChatOpenAI` 與 `ChatGoogleGenerativeAI` 繼承自相同的 Base Class，均實作了標準的 `.bindTools()` 及 `.withStructuredOutput()` 介面。透過工廠封裝，`graph.ts` 的執行器與斷言器運作邏輯不需做任何分支判斷，降低核心邏輯複雜度。

### 2. 視覺斷言模型啟用 `includeRaw: true`

- **決策說明**：在 `llmFactory` 中，為斷言模型實例化 `.withStructuredOutput` 時，一律帶入 `{ includeRaw: true }` 參數。
- **理由**：結構化輸出預設會包裝回傳物件，導致 `usage_metadata` 遺失。啟用 `includeRaw` 後，invoke 回傳 `{ parsed, raw }`，可從 `raw.usage_metadata` 安全讀取 Token 消耗，對 Gemini 與 OpenAI 兩種提供者均有效。

### 3. 前端使用獨立 `FormBlock`（不混合現有卡片）

- **決策說明**：在 `SettingsView.tsx` 中，「AI 決策核心配置」與「瀏覽器與執行參數」分為兩個獨立的 `FormBlock`。
- **理由**：維持 Bento Grid 視覺語言一致性，並避免單一表單欄位過多、使用者認知負擔過重。

## Risks / Trade-offs

- **[風險]**: 使用者設定了不正確的 OpenAI Base URL 或 API Key，導致測試啟動時 LLM 呼叫失敗。
  - **[對策]**: 在 `graph.ts` 中捕獲 LLM 呼叫的連線或認證錯誤，將友善的錯誤訊息寫入 `TestRun` 的 `finalReason`，讓前端能清晰呈現失敗原因。
- **[風險]**: 部分開源本地模型不支援 Vision 或 Tool Calling，導致測試失敗。
  - **[對策]**: 在前端 UI 加入提示文字，說明需選用支援多模態（Vision）與工具呼叫（Tool Calling）功能的模型，如 `gpt-4o`、`gpt-4o-mini` 或 `llama3.2-vision`。
