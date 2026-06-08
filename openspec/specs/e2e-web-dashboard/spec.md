# e2e-web-dashboard Specification

## Purpose
TBD - created by archiving change setup-monorepo-and-frontend. Update Purpose after archive.
## Requirements
### Requirement: Project and Group Tree View Sidebar
系統 MUST 在側邊欄提供專案切換與群組樹狀結構導航。點選特定群組時，系統 SHALL 載入並列出該群組下的所有測試案例，並支援建立、編輯與刪除群組。

#### Scenario: Render group tree for selected project
- **WHEN** 使用者在儀表板切換專案時，前端向 API 發送 `/api/projects/:projectId/groups` 請求
- **THEN** 前端將扁平群組陣列轉換為樹狀層級結構，並在側邊欄以展開/摺疊的樹狀視圖正確渲染

### Requirement: Testcase Run Details and Real-time SSE Log Stream
系統 MUST 在觸發測試執行後，以實時日誌流（Log Stream）與步驟截圖展示執行過程。前端 MUST 透過 SSE 訂閱即時事件，並在任務結束後渲染最終視覺斷言 PASS/FAIL 的判定報告。

#### Scenario: Stream live steps log and screenshot preview
- **WHEN** 使用者點擊執行測試，前端發送執行 API 並將畫面切換至執行視圖，以 EventSource 訂閱 `/api/runs/:runId/stream`
- **THEN** 前端即時將接收到的 `log` 事件渲染至 Console 時間軸，且在收到包含二進位截圖路徑的步驟日誌時，即時更新網頁預覽圖片

