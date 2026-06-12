## Why

目前在劇本執行歷史紀錄與即時監控 Console 中，執行日誌是以一條條流水帳的形式平鋪呈現。由於一個測試步驟（具有相同的 `stepIdx`）在執行時，經常會因為包含多個操作動作（如連續鍵入帳密）或網絡等待而產生多筆 log 記錄，這會使執行日誌看起來過於冗長且雜亂。
此外，由於系統設計上「只有該步驟的最後一筆 log 會附帶截圖」，平鋪顯示會導致截圖與其前面的中間操作動作分離，不易對照閱讀。

藉由將同一個步驟的所有日誌聚合到同一個 UI Section/Accordion，並將該步完成時的最終畫面截圖整合展示，能大幅提升執行歷史與日誌 Console 的資訊易讀性及專業度。

## What Changes

- **步驟日誌前端分群**：在前端展示歷史日誌或接收即時 SSE 串流時，將具有相同 `stepIdx` 的日誌，依據步驟歸類為同一個 UI 區塊。
- **Bento Accordion 面板**：
  - 每一個步驟呈現為一個折疊面板（Accordion）。
  - 面板標題顯示步驟編號與自然語言步驟描述（如 `步驟 1: 點選 wikipedia 搜尋`）。
  - 面板展開後，以時間軸形式列出該步驟執行的所有詳細動作軌跡（如 `fill_input("gemini")` -> `click_button("submit")`）及執行結果。
- **截圖對照展示**：將該步驟最後一筆 log 所附帶的最終完成截圖（`screenshotData`）展示在該 Accordion 面板下方或側邊，作為該步驟的最終狀態憑證。

## Capabilities

### New Capabilities
- 無

### Modified Capabilities
- `e2e-web-dashboard`: 調整 SSE 日誌串流與執行詳情，將相同步驟的所有執行結果歸類於同一個 Section 中進行視覺化折疊與截圖展示。

## Impact

- **前端視圖與元件**：`frontend/src/views/SSEConsoleView.tsx`、`frontend/src/views/TestCaseDetailView.tsx`（執行歷史分頁）
