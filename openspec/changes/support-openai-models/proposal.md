## Why

目前系統在進行 E2E 測試決策（Executor）與視覺斷言（Asserter）時，硬編碼使用了 Google Gemini API 及對應的 SDK。這限制了使用者選用其他領先的多模態模型（例如 OpenAI gpt-4o 等），也無法與本機自託管大模型服務（如 Ollama、vLLM、LM Studio）或企業內部的 API 代理中轉伺服器對接。本變更案旨在承接 `system-settings` 全域設定機制的基礎，擴充對 OpenAI 相容格式模型的支援。

## What Changes

- **新增 LLM 供應商支援**：
  - 後端引入 `@langchain/openai` 依賴。
  - 實作 `llmFactory.ts` 模組，依據全域設定中的模型提供者，動態實例化並回傳 `ChatGoogleGenerativeAI` 或是 `ChatOpenAI` 實例。
  - 確保兩者在 Vision 多模態、Tool Calling 瀏覽器操作上完全相容。
  - 在視覺斷言中，使用 `.withStructuredOutput` 配合 `{ includeRaw: true }` 來擷取斷言步驟的 Token 消耗，並能完美相容兩種模型提供者。
- **全域設定 (JSON Config) 擴充**：
  - 擴充由 `system-settings` 建立的 `settings.json` 結構，增加以下 AI 參數：
    - **提供者 (provider)**：`google` / `openai`
    - **API 參數**：Gemini API Key、OpenAI Base URL、OpenAI API Key
    - **模型名稱**：Executor 決策模型名稱、Asserter 斷言模型名稱
- **前端設定頁面擴充**：
  - 在 `SettingsView` 控制面板中，新增並解鎖「AI 決策核心配置」卡片，提供提供者切換選單、Base URL 與金鑰輸入框以及模型名稱選擇，並完美對接後端 API。

## Capabilities

### New Capabilities
<!-- 無新增 Capabilities -->

### Modified Capabilities
- `system-settings`: 擴充全域設定系統。在設定檔及設定面板中新增 AI 決策核心模型與金鑰的配置選項，並在後端測試執行器中動態對接對應的 LLM 供應商。

## Impact

- **依賴變更**：
  - [package.json](file:///c:/works/e2e-manager-ts/backend/package.json) (新增 `@langchain/openai`)
- **後端執行與決策核心**：
  - [services/llmFactory.ts](file:///c:/works/e2e-manager-ts/backend/src/services/llmFactory.ts) `[NEW]` (LLM 動態工廠)
  - [graph.ts](file:///c:/works/e2e-manager-ts/backend/src/graph.ts) (重構模型初始化，適配 includeRaw 與 token 統計)
- **前端設定介面**：
  - [views/SettingsView.tsx](file:///c:/works/e2e-manager-ts/frontend/src/views/SettingsView.tsx) (新增 AI 核心配置表單卡片)
