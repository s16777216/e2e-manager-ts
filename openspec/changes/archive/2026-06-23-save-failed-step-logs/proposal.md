## Why

目前當測試案例執行失敗時（例如：單步重試達 5 次上限而強制中斷），系統會跳過 `step_tracker` 節點直接進入 `reporter` 節點。這導致該失敗步驟在記憶體中的詳細執行日誌（如 AI 推理內容、呼叫的 Playwright 工具、工具執行的錯誤訊息等）完全沒有被寫入資料庫的 `TestLog` 表，且未發送 SSE 日誌廣播。
使用者在前端只能在最頂部的結果區域看到一筆簡短的失敗原因（`finalReason`）以及最底部的備份截圖，無法展開看見該失敗步驟的詳細工具呼叫與報錯原因，這為調試測試案例帶來了極大的困難。

## What Changes

- **後端日誌持久化補強**：在測試被迫中斷並進入 `reporterNode` 時，後端系統必須提取當前未完成步驟的所有暫存記憶體日誌，並將其寫入資料庫的 `TestLog` 中。
- **後端日誌即時廣播**：在 `reporterNode` 中，必須針對寫入的失敗步驟日誌呼叫 `pg_notify` 以發送 `event: "log"` SSE 即時廣播，確保前端在測試執行當下能即時收到失敗步驟的資料。
- **失敗步驟截圖關聯**：將失敗時擷取到的最終畫面截圖（`screenshotFailData`）除了保存在 `TestRun`，同時也應與該失敗步驟的最後一筆 `TestLog` 的 `screenshotData` 進行關聯儲存，以便在時間軸直接展示該步驟的最後失敗畫面。
- **前端日誌渲染優化**：前端系統接收到失敗步驟日誌後，應能在時間軸（`StepAccordion`）中正確渲染並展開該失敗步驟的卡片，並呈現其詳細的工具操作及錯誤記錄。

## Capabilities

### New Capabilities
<!-- 無新增 Capabilities -->

### Modified Capabilities
- `e2e-web-dashboard`: 調整測試執行日誌的展示需求，要求在測試失敗中斷時，必須在前端日誌面板中呈現該失敗步驟的詳細工具執行日誌與錯誤訊息。

## Impact

- **後端代碼**：
  - [graph.ts](file:///c:/works/e2e-manager-ts/backend/src/graph.ts)：修改 `reporterNode`，加入寫入當前失敗步驟日誌與 `pg_notify` 廣播的邏輯。
- **前端代碼**：
  - [SSEConsoleView.tsx](file:///c:/works/e2e-manager-ts/frontend/src/views/SSEConsoleView.tsx)：確保能正確渲染最後收到的失敗步驟日誌。
- **資料庫**：
  - `TestLog` 資料表會多寫入一筆（或數筆）失敗步驟的日誌，有助於完整記錄失敗現場。
