## MODIFIED Requirements

### Requirement: Testcase Run Details and Real-time SSE Log Stream
系統 MUST 在觸發測試執行後，以實時日誌流（Log Stream）與步驟截圖展示執行過程。前端 MUST 將畫面轉導至 `/project/:projectId/tasks/:taskId` 路由（TaskDetailView），由 TaskDetailView 中的 Run 項目點擊後進入 `/project/:projectId/run/:runId`（SSEConsoleView）。在日誌渲染與歷史紀錄呈現中，系統 MUST 將具有相同步驟索引（`stepIdx`）的所有日誌與執行動作歸類至同一個步驟 Section/Accordion。該步驟折疊面板中 MUST 包含該步驟的詳細工具操作軌跡與時間，且該步驟最後一筆日誌所附帶的網頁截圖 MUST 作為該步驟的最終狀態顯示於該 Section 下方。系統 MUST 在每個執行步驟中紀錄並即時顯示該步驟累計消耗的 LLM Token 數量，並在 Accordion Header 上渲染對應的 Token 消耗 Badge。任務結束後，系統 MUST 渲染最終視覺斷言 PASS/FAIL 的判定報告，且該判定報告中 MUST 一併展示視覺斷言判定所花費的 Token 以及整次 Run 消耗的總 Token 數。系統頂部全域麵包屑中的測試案例名稱連結 MUST 支援點擊並正確導回所屬測試案例詳情頁 `/project/:projectId/testCase/:testCaseId`。所有通知與錯誤回饋 MUST 採用 Sonner (Toaster) 進行 Toast 訊息提示。TaskDetailView 中的批次任務狀態與 TestRun 狀態 MUST 採用統一的狀態組件進行一致化視覺渲染（包括 pending、running、passed、failed、error）。

#### Scenario: Navigate to TaskDetailView after triggering any execution
- **WHEN** 使用者點擊「執行測試」（無論是單一案例、群組批次或專案批次），API 回傳 taskId
- **THEN** 前端 MUST navigate 至 `/project/:projectId/tasks/:taskId`，顯示 TaskDetailView 批次監控面板，並以統一狀態徽章（StatusBadge）顯示批次任務的目前狀態

#### Scenario: Stream live steps log with token usage metrics
- **WHEN** 使用者在 TaskDetailView 中點擊特定 Run 進入 `/project/:projectId/run/:runId` 並建立 SSE 連線訂閱時
- **THEN** 前端即時將接收到的日誌更新至對應 Graves 的步驟區塊中，並在獲取即時日誌流時解析日誌中的 promptTokens、completionTokens 與 totalTokens，將其依據 `stepIdx` 進行歸群，並於步驟 Accordion 標頭右側動態顯示該步驟累計的 Token 消耗

#### Scenario: Display final assert report with total run token usage
- **WHEN** 測試案例執行完畢，視覺斷言（Asserter）返回判定結果與理由時
- **THEN** 前端在上方即時渲染視覺斷言報告，除了展示結果與原因外，也必須展示視覺斷言花費的 Token 與整次測試執行所花費的總 Token 數量
