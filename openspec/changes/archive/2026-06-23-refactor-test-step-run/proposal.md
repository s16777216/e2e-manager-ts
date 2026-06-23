## Why

目前系統中缺乏一個明確的「步驟執行（TestRunStep）」資料庫實體。前端時間軸中的步驟卡片是藉由拉取扁平的 `TestLog` 後，在記憶體中動態依據 `stepIdx` 進行分群（Group By）反推重組出來的。
這導致了三個主要問題：
1. **資料冗餘**：每筆日誌都必須重複儲存步驟描述（`stepDescription`）和步驟索引。
2. **狀態判定模糊**：步驟是否失敗無法直接透過結構化欄位得知，只能依賴日誌結果的文字模糊匹配（如關鍵字比對）。
3. **效能與維護成本高**：無法為單個步驟單獨記錄時間、Token 與精確狀態。

## What Changes

- **新增資料庫實體**：建立新實體 `TestRunStep`，用以表示某次測試中單個步驟的執行狀態與元數據。
- **資料庫綱要正規化**：將 `TestLog` 與 `TestRunStep` 進行關聯，並自 `TestLog` 中移除重複的 `stepIdx` 與 `stepDescription` 欄位。
- **後端執行流程調整**：更新 LangGraph 節點（`stepTrackerNode` 與 `reporterNode`），將原先直接寫入 `TestLog` 的邏輯改為先建立/更新 `TestRunStep`，再寫入其關聯的 `TestLog`。
- **API 與 SSE 廣播結構調整 (BREAKING)**：
  - 調整查詢執行詳情 API (`/api/runs/:runId`)，回傳結構改為巢狀的步驟列表（包含其下關聯的日誌）。
  - 調整 `pg_notify` 的廣播格式，SSE 串流現在會推送步驟的建立、更新以及日誌的新增。
- **前端日誌呈現優化**：前端不再使用 `groupLogsByStep` 於記憶體中動態分群，而是直接讀取結構化的步驟列表進行渲染，步驟卡片的成敗（打勾或叉叉）將直接透過 `TestRunStep.status` 判定。

## Capabilities

### New Capabilities
<!-- 無新增 Capabilities -->

### Modified Capabilities
- `e2e-web-dashboard`: 調整測試執行日誌的資料傳輸與展現方式，規格上要求採用結構化的步驟列表與日誌嵌套結構（Nested Step-and-Log Structure）進行串流與呈現。

## Impact

- **資料庫實體**：
  - 新增 [TestRunStep.ts](file:///c:/works/e2e-manager-ts/backend/src/entities/TestRunStep.ts)
  - 修改 [TestLog.ts](file:///c:/works/e2e-manager-ts/backend/src/entities/TestLog.ts)（加入與 TestRunStep 的 ManyToOne 關聯，移除 redundant 欄位）
  - 修改 [TestRun.ts](file:///c:/works/e2e-manager-ts/backend/src/entities/TestRun.ts)（加入與 TestRunStep 的 OneToMany 關聯）
- **後端路由與圖節點**：
  - [run.ts](file:///c:/works/e2e-manager-ts/backend/src/routes/run.ts)：重構查詢與 SSE 串流部分以回傳步驟架構。
  - [graph.ts](file:///c:/works/e2e-manager-ts/backend/src/graph.ts)：重構寫入與廣播邏輯。
- **前端元件與 Hooks**：
  - [logUtils.ts](file:///c:/works/e2e-manager-ts/frontend/src/lib/logUtils.ts)：移除在前端分群的 `groupLogsByStep` 邏輯。
  - [StepAccordion.tsx](file:///c:/works/e2e-manager-ts/frontend/src/components/custom/StepAccordion.tsx)：直接基於步驟狀態進行渲染。
  - [useSSEStream.ts](file:///c:/works/e2e-manager-ts/frontend/src/hooks/useSSEStream.ts)：處理新的巢狀步驟與日誌更新事件。
