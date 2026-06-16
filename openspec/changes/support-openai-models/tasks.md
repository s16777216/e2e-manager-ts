## 1. 後端模型工廠與 API 擴充

- [ ] 1.1 安裝 `@langchain/openai` 依賴至後端專案：`npm install @langchain/openai -w backend`。
- [ ] 1.2 擴充 `backend/src/services/settingsService.ts` 的預設配置，納入 `provider`（google 或 openai）、Gemini API Key、OpenAI Base URL、OpenAI API Key、Executor 模型與 Asserter 模型等參數。
- [ ] 1.3 建立 `backend/src/services/llmFactory.ts`，負責依據 settings 配置動態實例化並回傳 `ChatGoogleGenerativeAI` 或是 `ChatOpenAI` 實例。

## 2. 後端執行核心重構 (LangGraph 對接)

- [ ] 2.1 修改 `backend/src/graph.ts`，在 `E2EGraphBuilder` 構造函數中，調用 `llmFactory` 建立 `this.model` 與 `this.asserter_model`。
- [ ] 2.2 重構 `graph.ts` 中的 `asserterNode` 視覺斷言邏輯：在 `withStructuredOutput` 呼叫時加入 `{ includeRaw: true }`，修改對應的 `invoke` 調用，將原始 `assertion_result` 讀取處改為 `structuredResponse.parsed`，並提取 `structuredResponse.raw.usage_metadata`。
- [ ] 2.3 驗證 `executorNode` 於 `ChatOpenAI` 的 `usage_metadata` 提取邏輯，確保相容於 OpenAI 回傳結構。

## 3. 前端設定面板擴充 (AI 核心配置)

- [ ] 3.1 修改 `frontend/src/views/SettingsView.tsx`，在 Bento 網格中新增「AI 決策核心配置」表單卡片。
- [ ] 3.2 表單卡片中包含：模型提供者（Select）、API 金鑰與網址路徑、Executor 與 Asserter 的模型名稱輸入框，並與後端 GET/POST API 進行資料綁定。

## 4. 編譯與 E2E 整合測試

- [ ] 4.1 執行 `npm run build`，確保前端與後端專案皆能正常通過 TypeScript 編譯，且無打包錯誤。
- [ ] 4.2 啟動服務，於設定中將提供者切換為 `OpenAI Compatible`，填寫本地的 Ollama（或外部中轉 API 網址與 Key），執行測試並確認步驟執行、視覺斷言與 Token 計算皆能無縫運行。
