## Context

在目前的系統架構中，測試流程由 LangGraph 驅動。當步驟執行成功時，會走 `executor` -> `step_tracker` 路由。`stepTrackerNode` 會負責將記憶體中的步驟日誌寫入 `TestLog` 並發送 SSE 事件，隨後步進 `current_step_idx`。
然而當某步驟因重試超限（例如 5 次重試失敗）或異常中斷時，`routeAfterExecution` 會將路由直接導向 `reporter`。`reporterNode` 只負責更新 `TestRun` 的狀態為 `failed` 或 `error`，並儲存全域失敗截圖，卻忽略了將當前失敗步驟的記憶體暫存日誌（`state.logs` 中對應 `current_step_idx` 的資料）寫入 `TestLog` 資料表。這導致前端時間軸完全遺失了失敗步驟的詳細過程與報錯。

## Goals / Non-Goals

**Goals:**
- 在 `reporterNode` 中提取當前失敗/未完成步驟的記憶體暫存日誌，並寫入 `TestLog` 資料表中，保證日誌不丟失。
- 寫入 `TestLog` 的同時，調用 `pg_notify('test_run_logs', ...)` 發送事件為 `"log"` 的通知，使 SSE 即時串流可推播給前端。
- 將 `reporterNode` 擷取到的最終失敗截圖，一併寫入該未完成步驟最後一筆 `TestLog` 的 `screenshotData` 二進位欄位中，讓前端步驟卡片可以直接呈現失敗現場畫面。
- 前端能流暢地接收並群組這些失敗日誌，將失敗步驟的 Accordion 卡片以醒目方式展示（例如紅色警示色）並預設展開。

**Non-Goals:**
- 不改變測試框架的重試上限次數限制（5 次）。
- 不改變 `TestRun` 本身的欄位結構與既有的 `screenshotFailData` / `finalReason` 儲存邏輯。

## Decisions

### 1. 後端 `reporterNode` 補存日誌邏輯
我們將在 `reporterNode` 的處理邏輯中（[backend/src/graph.ts](file:///c:/works/e2e-manager-ts/backend/src/graph.ts)）新增日誌寫入區塊：
* **判定條件**：當 `currentStepIdx < steps.length` 且最終判定為失敗時（代表有未完成的步驟）。
* **提取日誌**：從 `state.logs` 中過濾出 `log.step_idx === currentStepIdx` 的暫存日誌。
* **關聯截圖**：若 `screenshotFailBuffer` 擷取成功，將其賦值給篩選出的最後一筆日誌的 `screenshotData` 屬性。
* **資料庫持久化與 SSE 廣播**：
  - 遍歷並建立 `TestLog` 實體，存入 `TestLog` 資料表。
  - 對每一筆寫入的 Log，調用 `SELECT pg_notify('test_run_logs', $1)` 以發送即時 `"log"` 事件。
  - 同時累加該步驟消耗的 Token 到 `TestRun` 中。

### 2. 前端失敗步驟卡片展示優化
因為失敗步驟的日誌現在會正常寫入並廣播，前端 [SSEConsoleView.tsx](file:///c:/works/e2e-manager-ts/frontend/src/views/SSEConsoleView.tsx) 將能自動透過 `groupLogsByStep` 對其進行群組。
為了提升使用者體驗，我們將在 `StepCard`（位於 [StepAccordion.tsx](file:///c:/works/e2e-manager-ts/frontend/src/components/custom/StepAccordion.tsx) 中）或相關 UI 中做以下調整：
* 偵測當前步驟是否為整個 Run 中最後且失敗的步驟。
* 若步驟內含有失敗/中斷的 action 或是整個 Run 狀態為 `failed`/`error` 且此步驟為最後一步，將其外框或標題以紅色警示，且該步驟的 Accordion 預設展開（`defaultOpen`），方便使用者一眼查閱失敗軌跡。

## Risks / Trade-offs

* **[Risk]** 寫入 `TestLog` 後，SSE 廣播的 `"log"` 事件與隨後發送的 `"completed"` 事件如果時間間距過短，前端可能會在 UI 狀態更新時產生競爭或閃爍。
  * **[Mitigation]** 前端的 `useSSEStream` 已具備很好的 state 合併與防重邏輯，後端依次 await 寫入並廣播即可確保順序。
* **[Risk]** 若 Agent 沒呼叫任何工具就崩潰，`state.logs` 中可能完全沒有對應 `current_step_idx` 的 Log。
  * **[Mitigation]** 如果 logs 為空，後端仍會生成一筆預設的「步驟超限未完成」虛擬 Log 寫入，以確保前端至少能看見一個含有錯誤原因的步驟卡片。
