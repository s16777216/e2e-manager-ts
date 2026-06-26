## Why

目前系統在進行 E2E 測試時，其執行器（Executor）與視覺斷言器（Asserter）必須綁定在同一個全域的 AI 提供者（Gemini 或 OpenAI Compatible）之下。然而，這兩個模組對大模型的能力需求不同：執行器著重於工具呼叫（Tool Calling）與流程控制，而斷言器著重於高精度的視覺畫面判讀（Vision）。為了讓使用者能自由組合最優模型（例如：使用本機輕量模型作為執行器以加快速度，並使用雲端高精度模型作為斷言器以確保品質），兩者的模型供應商與模型名稱需要能夠獨立進行配置。

## What Changes

- **核心 AI 設定結構拆分**：
  - 將全域 AI 設定中的單一 `provider` 拆分為 `executorProvider` 與 `asserterProvider` 兩個獨立的提供者欄位。
  - 對連線 API 金鑰進行拆分或共用，使 Google Gemini 的 `apiKey` 與 OpenAI Compatible 的 `openaiApiKey` & `baseUrl` 能同時配置並由不同模型共享。
- **後端設定服務與 LLM 工廠調整**：
  - 擴充後端設定服務 `settingsService`，在讀取配置時提供舊資料的相容轉換，使舊有單一 `provider` 的資料能平滑升級為 `executorProvider` 與 `asserterProvider`。
  - 調整 `llmFactory`，使其分別依據 `executorProvider` 與 `asserterProvider` 的設定值來動態實例化並建立 `ChatGoogleGenerativeAI` 或 `ChatOpenAI` 實例。
- **前端設定頁面調整**：
  - 修改 `SettingsView.tsx` 表單，將 API 憑證（金鑰、網址）與模型配置（執行器、斷言器）在視覺上進行適度區隔，提升易用性。
  - 使用 Zod 的條件校驗（如 `.superRefine`），確保使用者在選定特定供應商時，才檢核該供應商所需的特定模型名稱是否填寫。
  - 憑證欄位採用條件渲染，僅在使用者選用了對應供應商時才顯示對應的金鑰輸入框。

## Capabilities

### New Capabilities
<!-- 無新增 Capabilities -->

### Modified Capabilities
- `system-settings`: 擴大系統設定中 AI 設定的彈性，將單一 AI 模型提供者拆分為執行器與斷言器各自獨立配置的供應商與模型名稱，並修正後端讀取/儲存機制與前端設定表單。

## Impact

- **後端設定與工廠**：
  - [settingsService.ts](file:///c:/works/e2e-manager-ts/backend/src/services/settingsService.ts) (調整 AiConfig 介面定義、預設值及相容讀取邏輯)
  - [llmFactory.ts](file:///c:/works/e2e-manager-ts/backend/src/services/llmFactory.ts) (getExecutorModel 與 getAsserterModel 分別讀取各自的 Provider)
- **前端設定頁面**：
  - [views/SettingsView.tsx](file:///c:/works/e2e-manager-ts/frontend/src/views/SettingsView.tsx) (調整 Zod Schema、增加 superRefine、改為獨立的雙 Provider UI 控制狀態，調整欄位條件渲染與版面配置)
