## MODIFIED Requirements

### Requirement: Testcase Run Details and Real-time SSE Log Stream
系統 MUST 在觸發測試執行後，以實時日誌流（Log Stream）與步驟截圖展示執行過程。前端 MUST 將畫面轉導至 `/project/:projectId/run/:runId` 路由，並透過 SSE 訂閱即時事件，使用 ScrollArea 包裹日誌區域。在日誌渲染與歷史紀錄呈現中，系統 MUST 將具有相同步驟索引（`stepIdx`）的所有日誌與執行動作歸類至同一個步驟 Section/Accordion。該步驟折疊面板中 MUST 包含該步驟的詳細工具操作軌跡與時間，且該步驟最後一筆日誌所附帶的網頁截圖 MUST 作為該步驟的最終狀態顯示於該 Section 下方。任務結束後，系統 MUST 渲染最終視覺斷言 PASS/FAIL 的判定報告。系統頂部全域麵包屑中的測試案例名稱連結 MUST 支援點擊並正確導回所屬測試案例詳情頁 `/project/:projectId/testCase/:testCaseId`。所有通知與錯誤回饋 MUST 採用 Sonner (Toaster) 進行 Toast 訊息提示。

#### Scenario: Stream live steps log and screenshot preview
- **WHEN** 使用者在測試案例頁面點擊執行測試，前端發送執行 API 並將畫面轉導至 `/project/:projectId/run/:runId`，以 EventSource 訂閱 `/api/runs/:runId/stream`，並在獲取即時日誌流或讀取歷史日誌時，依據 `stepIdx` 進行歸群與 Accordion 折疊排版
- **THEN** 前端即時將接收到的日誌更新至對應的步驟區塊中，以折疊時間軸展示動作細節，且在收到包含步驟截圖時更新並常駐顯示於該步驟區塊下方，點擊頂部全域麵包屑中的測試案例名稱時能正確回到該測試案例的詳情頁
