## Why

隨著 AI 驅動的 E2E 測試執行頻率與複雜度增加，追蹤每一次執行（Run）與每一個測試步驟（Step）的 LLM Token 消耗量與運算成本變得至關重要。目前系統尚未對 AI 決策與斷言過程中的 Token 消耗進行任何記錄，使得開發團隊無法進行成本核算、評估優化效果，或偵測耗費過高 Token 的異常步驟。

## What Changes

- **資料庫 Schema 擴充**：
  - 在 `TestLog` Entity 中新增 `promptTokens`、`completionTokens` 與 `totalTokens` 欄位，以記錄單次 AI 決策的開銷。
  - 在 `TestRun` Entity 中新增視覺斷言專用的 `asserterPromptTokens`、`asserterCompletionTokens`、`asserterTotalTokens` 欄位，以及整次執行總計的 `totalPromptTokens`、`totalCompletionTokens` 和 `totalTokens` 實體欄位。
- **LangGraph 執行核心擴充**：
  - 於 `executorNode` 執行決策後，自模型回傳值 `usage_metadata` 中提取輸入/輸出 Token 數量，並存入 `TestLog` 中。
  - 於 `asserterNode` 視覺斷言時，調整 `withStructuredOutput` 呼叫參數，加入 `{ includeRaw: true }`，以自 `raw` 回傳中提取並儲存斷言步驟的 Token 用量。
- **即時廣播與 API 傳輸調整**：
  - 於 `stepTrackerNode` 中透過 `pg_notify` 的 JSON payload 傳送即時的 Token 資訊。
  - 於 `/api/runs/:runId` 查詢及 SSE 連線中，在傳回的 JSON 資料中補上 Token 欄位。
- **前端 Console 與歷史紀錄 UI 展現**：
  - 在 `SSEConsoleView` 的步驟 Accordion 標頭右側新增微型 Badge，動態展示該步驟累計消耗的 Token（將該步驟底下的所有 Logs Token 累加）。
  - 在步驟 Accordion 標頭的 Hover Tooltip 中，展示 `輸入 (Prompt)` 與 `輸出 (Generation)` 的拆分明細。
  - 在歷史紀錄頁面的執行表格中，新增「Token 消耗」欄位，以統計每次執行的總消耗。

## Capabilities

### New Capabilities
<!-- 無新增 Capabilities -->

### Modified Capabilities
- `e2e-web-dashboard`: 擴充 `Testcase Run Details and Real-time SSE Log Stream` 要求，在每個步驟中紀錄並展示 Token 消耗資訊；同時擴充 `TestCase Run History Table View` 要求，在歷史表格中統計並展示該次 Run 的總計 Token 消耗量。

## Impact

- **後端 Entity 與資料庫**：
  - [TestLog.ts](file:///c:/works/e2e-manager-ts/backend/src/entities/TestLog.ts)
  - [TestRun.ts](file:///c:/works/e2e-manager-ts/backend/src/entities/TestRun.ts)
- **後端運作邏輯**：
  - [graph.ts](file:///c:/works/e2e-manager-ts/backend/src/graph.ts) (LangGraph Node 邏輯擴充)
  - [routes/run.ts](file:///c:/works/e2e-manager-ts/backend/src/routes/run.ts) (API/SSE JSON payload 調整)
- **前端資料處理與 UI**：
  - [logUtils.ts](file:///c:/works/e2e-manager-ts/frontend/src/lib/logUtils.ts) (新增 Token 欄位與累加邏輯)
  - [types/api.ts](file:///c:/works/e2e-manager-ts/frontend/src/types/api.ts) (定義 Token 相關欄位類型)
  - [views/SSEConsoleView.tsx](file:///c:/works/e2e-manager-ts/frontend/src/views/SSEConsoleView.tsx) 與 `StepAccordion` (即時展示與 Accordion 改動)
  - [views/HistoryView.tsx](file:///c:/works/e2e-manager-ts/frontend/src/views/HistoryView.tsx) (歷史表格新增 Token 欄位)
