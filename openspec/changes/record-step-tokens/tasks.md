## 1. 後端資料庫與 Entity 擴充

- [ ] 1.1 修改 `backend/src/entities/TestLog.ts`，新增 `promptTokens`、`completionTokens` 與 `totalTokens` 欄位。
- [ ] 1.2 修改 `backend/src/entities/TestRun.ts`，新增 `asserterPromptTokens`、`asserterCompletionTokens`、`asserterTotalTokens` 以及 `totalPromptTokens`、`totalCompletionTokens`、`totalTokens` 欄位。
- [ ] 1.3 啟動或重啟後端，藉由 TypeORM 的 `synchronize: true` 特性自動更新 PostgreSQL 中的表結構，並手動驗證資料庫欄位是否更新成功。

## 2. LangGraph 執行核心與 API 調整

- [ ] 2.1 修改 `backend/src/state.ts` 中的 `LogEntry` 介面，新增 `prompt_tokens`、`completion_tokens` 與 `total_tokens` 選填屬性。
- [ ] 2.2 修改 `backend/src/graph.ts` 中的 `executorNode` 邏輯，自 `ChatGoogleGenerativeAI` 決策回傳的 `usage_metadata` 中提取 Token 數據，並寫入該次 Action 的日誌物件。
- [ ] 2.3 修改 `backend/src/graph.ts` 中的 `asserterNode` 邏輯：在 `withStructuredOutput` 呼叫時傳入 `{ includeRaw: true }`，調整 `invoke` 調用，將原始 `assertion_result` 讀取處改為 `structuredResponse.parsed`，並提取 `structuredResponse.raw.usage_metadata` 寫入 `TestRun` 中的 asserter token 欄位。
- [ ] 2.4 在 `stepTrackerNode` 中，計算該步驟所有 logs 的 token 累計，並累加至 `TestRun` 的 `totalPromptTokens`、`totalCompletionTokens`、`totalTokens` 欄位；同時將這次 Log 的 Token 數據包含在 `pg_notify` 的 JSON payload 中廣播出去。
- [ ] 2.5 修改 `backend/src/routes/run.ts` 的 `runs/:runId` 路由與 SSE 傳輸邏輯，在傳回的 JSON 資料中補上 Token 相關欄位（`promptTokens`、`completionTokens`、`totalTokens`，以及 `TestRun` 最上層的總累計欄位）。

## 3. 前端資料累加與 UI 面板展示

- [ ] 3.1 檢查並修改前端與後端共用的 API 型別宣告（例如 `frontend/src/types/api.ts` 或 `types` 資料夾），新增對應的 Token 欄位定義。
- [ ] 3.2 修改 `frontend/src/lib/logUtils.ts` 中的 `GroupedStep` 介面及 `groupLogsByStep` 函數，在將 Logs 進行步驟分群時，將同個 `stepIdx` 底下的所有 Log 消耗 Token 進行累加，回傳為該步驟的累加 Token 值。
- [ ] 3.3 修改 `frontend/src/views/SSEConsoleView.tsx` 與 `StepAccordion`，在 Accordion Header 右側渲染一個展示該步驟累計 Token 數的 Badge，並在 Hover 時以 Tooltip 呈現輸入與輸出 Token 的明細。
- [ ] 3.4 修改 `frontend/src/views/SSEConsoleView.tsx` 的視覺斷言判定報告卡片（Assert Card），當任務結束時，在報告卡片中一併展示「視覺斷言花費 Token」與「整次執行總計花費 Token」。
- [ ] 3.5 修改 `frontend/src/views/HistoryView.tsx` 歷史紀錄表格，新增「Token 消耗」欄位，顯示每次 Run 累加的總 Token。

## 4. 編譯與整合驗證

- [ ] 4.1 執行 `npm run build`，確保前端與後端專案皆能正常通過 TypeScript 編譯，且 Vite 能無誤打包。
- [ ] 4.2 啟動服務，執行單次測試案例，在 E2E 即時 Console 頁面中驗證 Token Badge 能夠即時動態增加，且懸停 Tooltip 及最終視覺斷言報告的 Token 加總正常。
- [ ] 4.3 進入歷史紀錄頁面，確認歷史執行表格能正確載入並展示每次 Run 的總 Token 開銷。
