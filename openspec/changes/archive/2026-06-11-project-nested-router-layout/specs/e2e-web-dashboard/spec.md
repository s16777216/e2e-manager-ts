## MODIFIED Requirements

### Requirement: Project and Group Tree View Sidebar
系統 MUST 在側邊欄提供極簡化的專案與首頁導航。專案詳細頁面中 MUST 提供群組與測試案例樹狀結構導航，且點選特定群組時僅展開或收合該節點。目錄導航面板 MUST 作為可摺疊的側邊欄（Sidebar）呈現，支援使用按鈕或快捷鍵（如 Ctrl+B）進行一鍵折疊與展開（折疊後右側內容區平滑延展至 100% 寬度），且面板邊軌 MUST 支援滑鼠拖曳調整寬度。專案詳細頁面 MUST 採用巢狀路由（Nested Router）結構，在右側提供 `<Outlet />` 容器。當網址轉導至 `/project/:projectId/testCase/:testCaseId` 或 `/project/:projectId/run/:runId` 時，系統 MUST 保持左側劇本樹狀導航的展開狀態與選取狀態，並在右側 Outlet 容器中分別渲染對應的測試案例詳情或即時監控 Console，不得重新載入或解除安裝（unmount）左側面板。專案詳細頁面頂端 MUST 提供動態麵包屑（Breadcrumb）導航，依據當前的子路由層級與參數，動態拼接並展示「專案 / 專案名稱 / 劇本名稱 / 執行紀錄」之導航層級，並支援點擊返回。 「建立群組」按鈕 MUST 放置於左側劇本樹狀導航面板的 Header 右側。「建立測試案例」按鈕 MUST 在未選定測試案例時，展示於右側的預設引導頁中。

#### Scenario: Render group tree for selected project
- **WHEN** 使用者切換至特定專案或其子路由，前端轉導或渲染 `/project/:projectId` 並於左側載入群組樹，且在展開特定群組時動態向 API 發送 `/api/groups/:groupId/testcases` 加載測試案例
- **THEN** 前端將測試案例動態渲染於子項目，並在切換子路由時完整維持左側樹狀導航的展開與選取狀態，支援側邊欄拖曳拉伸與一鍵收合，且頂端麵包屑路徑能即時動態更新且無閃爍
