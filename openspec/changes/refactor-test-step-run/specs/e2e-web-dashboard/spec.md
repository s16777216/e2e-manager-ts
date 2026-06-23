## MODIFIED Requirements

### Requirement: Testcase Run Details and Real-time SSE Log Stream
系統 MUST 在觸發測試執行後，以實時日誌流（Log Stream）與步驟截圖展示執行過程。前端 MUST 將畫面轉導至 `/project/:projectId/tasks/:taskId` 路由（TaskDetailView），由 TaskDetailView 中的 Run 項目點擊後進入 `/project/:projectId/run/:runId`（SSEConsoleView）。在日誌渲染與歷史紀錄呈現中，系統 MUST 依據後端所傳輸之結構化步驟執行實體（TestStepRun）來渲染步驟 Section/Accordion。該步驟卡片中 MUST 包含該步驟所關聯的詳細工具操作軌跡與時間，且步驟實體所關聯的網頁截圖 MUST 作為該步驟的最終狀態顯示於該 Section 下方。系統 MUST 在每個執行步驟中紀錄並即時顯示該步驟累計消耗的 LLM Token 數量，並在 Accordion Header 上渲染對應的 Token 消耗 Badge 與步驟成敗狀態（包括 pending、running、passed、failed 等）。任務結束後，系統 MUST 渲染最終視覺斷言 PASS/FAIL 的判定報告，且該判定報告中 MUST 一併展示視覺斷言判定所花費的 Token 以及整次 Run 消耗的總 Token 數。系統頂部全域麵包屑中的測試案例名稱連結 MUST 支援點擊並正確導回所屬測試案例詳情頁 `/project/:projectId/testCase/:testCaseId`。所有通知與錯誤回饋 MUST 採用 Sonner (Toaster) 進行 Toast 訊息提示。

#### Scenario: Navigate to TaskDetailView after triggering any execution
- **WHEN** 使用者點擊「執行測試」（無論是單一案例、群組批次或專案批次），API 回傳 taskId
- **THEN** 前端 MUST navigate 至 `/project/:projectId/tasks/:taskId`，顯示 TaskDetailView 批次監控面板

#### Scenario: Stream live steps log with token usage metrics
- **WHEN** 使用者在 TaskDetailView 中點擊特定 Run 進入 `/project/:projectId/run/:runId` 並建立 SSE 連線訂閱時
- **THEN** 前端即時接收後端以巢狀結構傳送之步驟及其關聯的日誌更新事件，直接渲染步驟列表及其 Token 消耗，且不需在前端執行日誌的分群計算

#### Scenario: Display final assert report with total run token usage
- **WHEN** 測試案例執行完畢，視覺斷言（Asserter）返回判定結果與理由時
- **THEN** 前端在上方即時渲染視覺斷言報告，除了展示結果與原因外，也必須展示視覺斷言花費的 Token 與整次測試執行所花費的總 Token 數量

#### Scenario: Save and display logs for failed steps
- **WHEN** 測試案例執行在特定步驟因錯誤中斷或重試超限而失敗時
- **THEN** 後端系統 MUST 將該步驟之狀態設為 failed，並將該步驟未完成的暫存日誌與失敗截圖存入資料庫並透過 SSE 發送，且前端時間軸中 MUST 能依據該步驟 status 屬性直接呈現並展開該失敗步驟的 Accordion 卡片以呈現具體錯誤軌跡與失敗畫面
