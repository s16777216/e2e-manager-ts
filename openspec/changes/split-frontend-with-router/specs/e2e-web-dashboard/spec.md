## MODIFIED Requirements

### Requirement: Project and Group Tree View Sidebar
系統 MUST 在側邊欄提供專案切換與群組樹狀結構導航。前端的專案選單、操作按鈕及群組管理彈窗 MUST 採用統一的 shadcn/ui 元件（如 Select, Button, Dialog）。點選特定群組時，系統 SHALL 將網址轉導至 `/projects/:projectId/groups/:groupId` 並載入並列出該群組下的所有測試案例，且整個專案切換與群組樹導航狀態 MUST 與前端路由進行 URL 狀態同步。

#### Scenario: Render group tree for selected project
- **WHEN** 使用者在儀表板切換專案時，前端轉導至 `/projects/:projectId`，向 API 發送 `/api/projects/:projectId/groups` 請求並加載該專案的群組樹
- **THEN** 前端將扁平群組陣列轉換為樹狀層級結構，並在側邊欄以展開/摺疊的樹狀視圖正確渲染，且所有彈窗與表單元件均符合 shadcn 的統一設計風格

### Requirement: Testcase Run Details and Real-time SSE Log Stream
系統 MUST 在觸發測試執行後，以實時日誌流（Log Stream）與步驟截圖展示執行過程。前端 MUST 將畫面轉導至 `/runs/:runId` 路由，並透過 SSE 訂閱即時事件，使用 ScrollArea 包裹時間軸與日誌細節等滾動區域，並在任務結束後渲染最終視覺斷言 PASS/FAIL 的判定報告。該運行頁面 MUST 支援 URL 複製分享以直接檢視測試報告。所有通知與錯誤回饋 MUST 採用 Sonner (Toaster) 進行 Toast 訊息提示。

#### Scenario: Stream live steps log and screenshot preview
- **WHEN** 使用者點擊執行測試，前端發送執行 API 並將畫面轉導至 `/runs/:runId`，以 EventSource 訂閱 `/api/runs/:runId/stream`
- **THEN** 前端即時將接收到的 `log` 事件渲染至包含 ScrollArea 的 Console 時間軸，且在收到包含二進位截圖路徑的步驟日誌時，即時更新網頁預覽圖片，使用者亦可透過點選歷史紀錄返回前一個群組頁面
