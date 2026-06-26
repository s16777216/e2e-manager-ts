## Context

目前系統已實作 AI 設定的持久化儲存與 LLM 動態工廠，但其運作邏輯綁定於單一的全域 `provider` 欄位。這意味著「步驟執行器（Executor）」與「視覺斷言器（Asserter）」必須共用相同的 AI 供應商。
在實際運行中，這兩個模組的需求存在明顯差異：
- **Executor**：需要具備穩定的 Tool Calling 能力，頻繁與瀏覽器互動。對速度與執行成本較為敏感。
- **Asserter**：需要強大的多模態視覺判讀能力（Vision），以精準判斷測試畫面是否符合預期。
為了提供最大的彈性，這兩個角色的模型供應商與模型名稱應該被獨立配置。

## Goals / Non-Goals

**Goals:**
- 在後端 [settingsService.ts](file:///c:/works/e2e-manager-ts/backend/src/services/settingsService.ts) 中為 `aiConfig` 引入 `executorProvider` 與 `asserterProvider` 欄位，並確保對舊有資料的平滑向下相容。
- 修改 [llmFactory.ts](file:///c:/works/e2e-manager-ts/backend/src/services/llmFactory.ts) 中的 `getExecutorModel` 與 `getAsserterModel`，使其分別依據 `executorProvider` 與 `asserterProvider` 獨立實實例化對應的 LLM。
- 修改前端 [SettingsView.tsx](file:///c:/works/e2e-manager-ts/frontend/src/views/SettingsView.tsx)，優化 UI 佈局，使連線憑證共用化，並提供執行器與斷言器獨立的供應商選擇與條件式 Zod 表單驗證。

**Non-Goals:**
- 本次變更不調整資料庫 PostgreSQL 的 Table Schema（`aiConfig` 欄位原本即為 JSONB，可直接擴展欄位）。
- 不調整 API 路由（仍使用原本的 `GET /api/settings` 與 `POST /api/settings`）。

## Decisions

### 1. 金鑰憑證與模型解耦設計
- **決策說明**：將 API 金鑰/網址等「憑證資訊」與執行器/斷言器的「模型與提供者」解耦。
- **理由**：使用者不論將 Executor 與 Asserter 怎麼搭配（例如：兩者都選 Google、或一個選 Google 一個選 OpenAI），同一供應商的金鑰與 API 網址只需要填寫一次，避免重複填寫與不必要的複雜化。

### 2. 應用層無縫向下相容
- **決策說明**：在 `settingsService.getSettings()` 回傳 `aiConfig` 時，若 `executorProvider` 或 `asserterProvider` 不存在，自動同步並 fallback 為舊的 `provider` 欄位值。
- **理由**：不需執行資料庫 Migration，即可在前端與後端安全讀取並順暢升級成新配置。

### 3. 前端聯動 Zod 表單驗證與條件渲染
- **決策說明**：
  - 使用 Zod 的 `.superRefine` 進行條件式欄位檢驗（例如：只有當 `executorProvider === 'google'` 時，`geminiModel` 才為必填，且不允許空值）。
  - 對 API 金鑰欄位使用「任一選中才渲染」的邏輯：
    - 當 `executorProvider === 'google' || asserterProvider === 'google'`，才顯示「Gemini API 金鑰」欄位。
    - 當 `executorProvider === 'openai' || asserterProvider === 'openai'`，才顯示「OpenAI Base URL 與 API 金鑰」欄位。
- **理由**：避免在畫面上充斥無關的輸入框，且提供精確的前端表單驗證提示。

## Risks / Trade-offs

- **[風險]**: 使用者將執行器與斷言器設定在不同 Provider 時，由於 API 連線各自獨立，若有一方斷網或 API Key 錯誤，將會在不同的 LangGraph 節點拋出錯誤。
  - **[對策]**: 保持 `graph.ts` 中原有的錯誤處理與 Token 統計邏輯。因為不論是 `ChatOpenAI` 還是 `ChatGoogleGenerativeAI` 均已實作統一的標準介面，執行核心已具備極高的容錯能力。
