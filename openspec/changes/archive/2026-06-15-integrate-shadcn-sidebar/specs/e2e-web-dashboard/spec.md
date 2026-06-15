## MODIFIED Requirements

### Requirement: Project and Group Tree View Sidebar
系統 MUST 使用 Shadcn Sidebar 導航元件，在側邊欄提供首頁、專案列表、執行紀錄（History）三個主要入口導航。專案詳細頁面中 MUST 提供群組與測試案例樹狀結構表格（Tree Table）導航，以列與欄的形式展示資訊。點選特定群組時，系統 SHALL 僅展開或收合該節點。專案詳細頁面 MUST 以單欄滿版表格（Tree Table）的形式填滿主要工作區。專案詳細頁面中 SHALL 移除原本位於底部的歷史批次執行表格，將執行紀錄的功能統一收歸於全域執行紀錄頁面中。

系統的右側主要工作區頂端（由全域 `RootLayout` Header 提供）MUST 提供統一的動態麵包屑（Breadcrumb）導航，其高度與左側系統 LOGO Header 固定且水平切齊。麵包屑依據當前的路由層級與參數，動態拼接並展示「專案列表 / 專案名稱 / 測試案例名稱 / 執行紀錄」之導航層級，並支援點擊返回。專案詳細頁、測試案例詳情頁與即時 Console 本身作為獨立頁面填滿下方主工作區，不再重複渲染各自的麵包屑，以避免路由跳轉時 Header 版面抖動。系統 MUST 整合 Shadcn 的 `SidebarTrigger` 元件於主工作區頂端 Header 的左側，以提供無遮擋的側邊欄收合控制，且點擊時主工作區與側邊欄 SHALL 伴隨平滑的過渡動畫自動伸縮且不重疊。

#### Scenario: Render group tree for selected project
- **WHEN** 使用者切換至特定專案，前端轉導或渲染 `/project/:projectId` 並於主畫面載入滿版群組與測試案例樹狀表格，且在展開特定群組時動態向 API 發送 `/api/groups/:groupId/testcases` 加載測試案例
- **THEN** 前端將測試案例動態渲染於表格行中，各屬性橫向完美對齊，且頂端全域麵包屑路徑能即時動態更新且無閃爍，右上方之操作按鈕皆能正常運作彈出對應的 Dialog 表單

#### Scenario: Render sidebar navigation with global history entry
- **WHEN** 載入應用程式時
- **THEN** 側邊欄 MUST 以 Shadcn Sidebar 元件正確渲染首頁、專案列表及執行紀錄入口，且點擊執行紀錄入口時能正確 navigate 導航至 `/tasks`

#### Scenario: Sidebar collapse with trigger animation
- **WHEN** 使用者點擊主工作區頂端 Header 的 `SidebarTrigger` 時
- **THEN** 側邊欄將流暢地收合或展開，主要工作區（`<main>`）會同步自動寬度自適應伸縮，且兩者絕不重疊
