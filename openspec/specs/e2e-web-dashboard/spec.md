# e2e-web-dashboard Specification

## Purpose
TBD - created by archiving change setup-monorepo-and-frontend. Update Purpose after archive.
## Requirements
### Requirement: Project and Group Tree View Sidebar
系統 MUST 在側邊欄提供極簡化的專案與首頁導航。專案詳細頁面中 MUST 提供群組與測試案例樹狀結構導航。前端的專案列表、操作按鈕及群組/測試案例管理彈窗 MUST 採用統一的 shadcn/ui 元件。點選樹狀圖的群組節點時，系統 SHALL 僅展開或收合該節點；點選測試案例節點時，系統 SHALL 將網址轉導至 `/project/:projectId/testCase/:testCaseId`。

#### Scenario: Render group tree for selected project
- **WHEN** 使用者在專案列表選擇或切換至特定專案，前端轉導至 `/project/:projectId` 載入群組樹，且在使用者點擊展開特定群組時，前端向 API 發送 `/api/groups/:groupId/testcases` 請求以加載該群組之測試案例
- **THEN** 前端將該群組的測試案例動態渲染於其子項目，且所有彈窗與表單元件均符合 shadcn 的統一設計風格，且已加載的測試案例會快取在前端以避免重複請求

### Requirement: Testcase Run Details and Real-time SSE Log Stream
系統 MUST 在觸發測試執行後，以實時日誌流（Log Stream）與步驟截圖展示執行過程。前端 MUST 將畫面轉導至 `/project/:projectId/run/:runId` 路由，並透過 SSE 訂閱即時事件，使用 ScrollArea 包裹時間軸與日誌細節等滾動區域，並在任務結束後渲染最終視覺斷言 PASS/FAIL 的判定報告。該運行頁面之返回按鈕 MUST 導向該任務所屬的測試案例詳情頁 `/project/:projectId/testCase/:testCaseId`。所有通知與錯誤回饋 MUST 採用 Sonner (Toaster) 進行 Toast 訊息提示。

#### Scenario: Stream live steps log and screenshot preview
- **WHEN** 使用者在測試案例頁面點擊執行測試，前端發送執行 API 並將畫面轉導至 `/project/:projectId/run/:runId`，以 EventSource 訂閱 `/api/runs/:runId/stream`
- **THEN** 前端即時將接收到的 `log` 事件渲染至包含 ScrollArea 的 Console 時間軸，在收到包含二進位截圖路徑的步驟日誌時更新圖片，點擊返回按鈕時正確回到該測試案例的詳情頁

