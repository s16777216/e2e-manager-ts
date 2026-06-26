## Why

目前系統在進行 E2E 測試決策（Executor）與視覺斷言（Asserter）時，硬編碼使用了 Google Gemini API 及對應的 SDK。這限制了使用者選用其他領先的多模態模型（例如 OpenAI gpt-4o 等），也無法與本機自託管大模型服務（如 Ollama、vLLM、LM Studio）或企業內部的 API 代理中轉伺服器對接。本變更案旨在承接 `system-settings` 全域設定機制的基礎，擴充對 OpenAI 相容格式模型的支援。

## What Changes

- **新增 LLM 供應商支援**：
  - 後端引入 `@langchain/openai` 依賴。
  - 實作 `llmFactory.ts` 模組，依據全域設定中的模型提供者，動態實例化並回傳 `ChatGoogleGenerativeAI` 或是 `ChatOpenAI` 實例。
  - 確保兩者在 Vision 多模態、Tool Calling 瀏覽器操作上完全相容。
  - 在視覺斷言中，使用 `.withStructuredOutput` 配合 `{ includeRaw: true }` 來擷取斷言步驟的 Token 消耗，並能完美相容兩種模型提供者。
- **後端設定層擴充**：
  - 擴充 `backend/src/services/settingsService.ts`，在取得設定時若 `aiConfig` 為 null，提供一組合理的預設 AI 模型參數（provider: "google" 等）。
  - `SystemSetting` entity 中已預留的 `aiConfig` JSONB 欄位不需修改，直接對接使用。
- **前端設定頁面擴充**：
  - 在 `SettingsView.tsx` 中，新增一個獨立的「AI 決策核心配置」`FormBlock`，與現有的「瀏覽器與執行參數」`FormBlock` 縱向並列，保持 Bento Grid 風格。
  - 表單包含提供者切換選單、API 金鑰、Base URL 輸入框，以及 Executor 與 Asserter 的模型名稱輸入，並使用 Zod Schema 進行前端校驗。

## Capabilities

### New Capabilities
<!-- 無新增 Capabilities -->

### Modified Capabilities
- `system-settings`: 擴充後端 settingsService，為 aiConfig 欄位提供預設值，並在前端設定面板中新增 AI 決策核心模型與金鑰的配置表單，完整對接後端 GET/POST API。

## Impact

- **依賴變更**：
  - [package.json](file:///c:/works/e2e-manager-ts/backend/package.json) (新增 `@langchain/openai`)
- **後端執行與決策核心**：
  - [services/settingsService.ts](file:///c:/works/e2e-manager-ts/backend/src/services/settingsService.ts) (擴充 getSettings 以提供 aiConfig 預設值)
  - [services/llmFactory.ts](file:///c:/works/e2e-manager-ts/backend/src/services/llmFactory.ts) `[NEW]` (LLM 動態工廠)
  - [graph.ts](file:///c:/works/e2e-manager-ts/backend/src/graph.ts) (重構模型初始化，適配 includeRaw 與 token 統計)
- **前端設定介面**：
  - [views/SettingsView.tsx](file:///c:/works/e2e-manager-ts/frontend/src/views/SettingsView.tsx) (新增獨立 FormBlock：AI 核心配置表單)
