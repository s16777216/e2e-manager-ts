## 1. 後端模型工廠與 API 擴充

- [ ] 1.1 安裝 `@langchain/openai` 依賴至後端專案：`npm install @langchain/openai -w backend`。
- [ ] 1.2 擴充 `backend/src/services/settingsService.ts` 的 `getSettings`，當 `SystemSetting.aiConfig` 為 `null` 時，在應用層補填預設 AI 配置（`provider: "google"`、`geminiModel`、`asserterModel` 等），確保呼叫方永遠取得完整結構（不回寫 DB）。
- [ ] 1.3 建立 `backend/src/services/llmFactory.ts`，實作 `getExecutorModel(aiConfig)` 與 `getAsserterModel(aiConfig)` 函式，依 `aiConfig.provider` 動態實例化並回傳 `ChatGoogleGenerativeAI` 或 `ChatOpenAI` 實例；Asserter 版本一律帶入 `withStructuredOutput(schema, { includeRaw: true })`。

## 2. 後端執行核心重構 (LangGraph 對接)

- [ ] 2.1 修改 `backend/src/graph.ts`，在 `E2EGraphBuilder` 建構子中，呼叫 `settingsService.getSettings()` 取得 `aiConfig`，再透過 `llmFactory` 建立 `this.model`（executor）與 `this.asserterModel`（asserter with structuredOutput）。
- [ ] 2.2 重構 `graph.ts` 中的 `asserterNode` 視覺斷言邏輯：invoke 回傳值改用 `structuredResponse.parsed` 取得斷言結果，並從 `structuredResponse.raw.usage_metadata` 提取 Token 消耗，以相容 Gemini 與 OpenAI 兩種提供者。
- [ ] 2.3 驗證 `executorNode` 的 `usage_metadata` 提取邏輯，確保 OpenAI 回傳結構中的 Token 欄位（`input_tokens`、`output_tokens`）能被正確讀取與記錄。

## 3. 前端設定面板擴充 (AI 核心配置)

- [ ] 3.1 修改 `frontend/src/views/SettingsView.tsx`，在現有「瀏覽器與執行參數」`FormBlock` 下方（縱向並列），新增「AI 決策核心配置」獨立 `FormBlock`。
- [ ] 3.2 新 `FormBlock` 中包含以下欄位（使用 Zod Schema 進行前端校驗，與後端 `aiConfig` JSONB 結構對應）：
  - 模型提供者（Select：`google` / `openai`）
  - Gemini API 金鑰（text）
  - OpenAI API 金鑰（text）
  - OpenAI Base URL（text，有預設值）
  - Executor 模型名稱（text）
  - Asserter 模型名稱（text）
- [ ] 3.3 表單 submit 時，將 `aiConfig` 物件透過 `PATCH /api/settings` 儲存至後端；頁面載入時，從 `GET /api/settings` 取得並填入初始值。

## 4. 編譯與整合驗證

- [ ] 4.1 執行 `npm run build`，確認前端與後端皆能通過 TypeScript 編譯，無打包錯誤。
- [ ] 4.2 啟動服務，進入設定頁面，切換提供者為 `OpenAI Compatible`，填入本地 Ollama 或外部 API 的 Base URL 與 API Key，執行測試計畫，確認：
  - 步驟執行（executorNode）能正常呼叫 OpenAI 格式 API。
  - 視覺斷言（asserterNode）能回傳結構化結果，且 Token 統計正常。
  - 切換回 `google` 後，原有 Gemini 流程不受影響。
