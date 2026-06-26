## 1. 後端模型與設定服務擴充

- [x] 1.1 修改 `backend/src/services/settingsService.ts` 中的 `AiConfig` interface，新增 `executorProvider` 與 `asserterProvider` 欄位，並將其加入預設值中。
- [x] 1.2 在 `settingsService.ts` 的 `getSettings` 方法中，實作向下相容邏輯：當舊的 `provider` 存在而新的 `executorProvider` 或 `asserterProvider` 為空時，自動同步補填。

## 2. LLM 工廠與執行核心重構

- [x] 2.1 修改 `backend/src/services/llmFactory.ts` 中的 `getExecutorModel`，使其依據 `aiConfig.executorProvider`（原本為 `aiConfig.provider`）實例化執行器模型。
- [x] 2.2 修改 `backend/src/services/llmFactory.ts` 中的 `getAsserterModel`，使其依據 `aiConfig.asserterProvider`（原本為 `aiConfig.provider`）實例化視覺斷言器模型。

## 3. 前端設定頁面與表單重構

- [x] 3.1 修改 `frontend/src/views/SettingsView.tsx` 中的 Zod schema `aiConfigSchema`，加入 `executorProvider`、`asserterProvider`，並使用 `.superRefine` 限制僅在選用該供應商時，其模型名稱才為必填。
- [x] 3.2 在 `SettingsView.tsx` 中新增兩個 Provider 的狀態控制：`executorProvider` 與 `asserterProvider`，並在 API 載入設定後正確更新。
- [x] 3.3 重新規劃 `SettingsView.tsx` 中「AI 模型配置」FormBlock 的 UI 欄位版面：
  - 共用 API 連線憑證區（Gemini API 金鑰欄位與 OpenAI Compatible 欄位）。
  - 憑證條件渲染：有選用 Google 供應商才顯示 Gemini 金鑰輸入框，有選用 OpenAI 供應商才顯示 OpenAI 欄位。
  - 獨立的執行器配置區（選擇提供者與模型名稱）。
  - 獨立的斷言器配置區（選擇提供者與模型名稱）。

## 4. 編譯與混合配置驗證

- [x] 4.1 執行 `npm run build`，確保前端與後端編譯均能順利通過。
- [ ] 4.2 啟動服務，在設定頁面測試混合配置（例如：執行器選 `openai`，斷言器選 `google`），確認儲存成功，且在跑測試案例時，執行器與斷言器能各司其職且正確記錄 Token 消耗量。
