# e2e-web-dashboard Specification

## Purpose
TBD - created by archiving change setup-monorepo-and-frontend. Update Purpose after archive.
## Requirements
### Requirement: Project and Group Tree View Sidebar
系統 MUST 在側邊欄提供極簡化的專案與首頁導航。專案詳細頁面中 MUST 提供群組與測試案例樹狀結構表格（Tree Table）導航，以列與欄的形式展示資訊。點選特定群組時，系統 SHALL 僅展開或收合該節點。專案詳細頁面 MUST 以單欄滿版表格（Tree Table）的形式填滿主要工作區。
系統的右側主要工作區頂端（由全域 `RootLayout` Header 提供）MUST 提供統一的動態麵包屑（Breadcrumb）導航，其高度與左側系統 LOGO Header 固定且水平切齊。麵包屑依據當前的路由層級與參數，動態拼接並展示「專案列表 / 專案名稱 / 測試案例名稱 / 執行紀錄」之導航層級，並支援點擊返回。專案詳細頁、測試案例詳情頁與即時 Console 本身作為獨立頁面填滿下方主工作區，不再重複渲染各自的麵包屑，以避免路由跳轉時 Header 版面抖動。「建立群組」與「建立測試案例」操作按鈕 MUST 整合至專案詳細頁面的頂部 Header 右側。

#### Scenario: Render group tree for selected project
- **WHEN** 使用者切換至特定專案，前端轉導或渲染 `/project/:projectId` 並於主畫面載入滿版群組與測試案例樹狀表格，且在展開特定群組時動態向 API 發送 `/api/groups/:groupId/testcases` 加載測試案例
- **THEN** 前端將測試案例動態渲染於表格行中，各屬性橫向完美對齊，且頂端全域麵包屑路徑能即時動態更新且無閃爍，右上方之操作按鈕皆能正常運作彈出對應的 Dialog 表單

### Requirement: Testcase Run Details and Real-time SSE Log Stream
系統 MUST 在觸發測試執行後，以實時日誌流（Log Stream）與步驟截圖展示執行過程。前端 MUST 將畫面轉導至 `/project/:projectId/tasks/:taskId` 路由（TaskDetailView），由 TaskDetailView 中的 Run 項目點擊後進入 `/project/:projectId/run/:runId`（SSEConsoleView）。在日誌渲染與歷史紀錄呈現中，系統 MUST 將具有相同步驟索引（`stepIdx`）的所有日誌與執行動作歸類至同一個步驟 Section/Accordion。該步驟折疊面板中 MUST 包含該步驟的詳細工具操作軌跡與時間，且該步驟最後一筆日誌所附帶的網頁截圖 MUST 作為該步驟的最終狀態顯示於該 Section 下方。任務結束後，系統 MUST 渲染最終視覺斷言 PASS/FAIL 的判定報告。系統頂部全域麵包屑中的測試案例名稱連結 MUST 支援點擊並正確導回所屬測試案例詳情頁 `/project/:projectId/testCase/:testCaseId`。所有通知與錯誤回饋 MUST 採用 Sonner (Toaster) 進行 Toast 訊息提示。

#### Scenario: Navigate to TaskDetailView after triggering any execution
- **WHEN** 使用者點擊「執行測試」（無論是單一案例、群組批次或專案批次），API 回傳 taskId
- **THEN** 前端 MUST navigate 至 `/project/:projectId/tasks/:taskId`，顯示 TaskDetailView 批次監控面板

#### Scenario: Stream live steps log and screenshot preview from TaskDetailView
- **WHEN** 使用者在 TaskDetailView 中點擊特定 Run 的連結，前端導向 `/project/:projectId/run/:runId` 並以 EventSource 訂閱 `/api/runs/:runId/stream`，並在獲取即時日誌流或讀取歷史日誌時，依據 `stepIdx` 進行歸群與 Accordion 折疊排版
- **THEN** 前端即時將接收到的日誌更新至對應的步驟區塊中，以折疊時間軸展示動作細節，且在收到包含步驟截圖時更新並常駐顯示於該步驟區塊下方，點擊頂部全域麵包屑中的測試案例名稱時能正確回到該測試案例的詳情頁

### Requirement: Project List Table View
系統 MUST 在首頁的專案入口提供表格（Table）形式的專案列表，橫向展示多維度屬性對照。表格欄位 MUST 包含專案名稱（附帶連結與圖示）、描述、群組數量、測試案例數量、最後執行時間與操作動作。表格 MUST 支援搜尋與排序。

#### Scenario: Display and search projects table
- **WHEN** 使用者進入專案首頁，且輸入搜尋關鍵字或點擊欄位標頭進行排序時
- **THEN** 前端以表格形式載入所有專案資訊，並即時依據關鍵字進行過濾或依據所選欄位變更排列順序，點擊進入可正確導向專案詳細頁面

### Requirement: TestCase Run History Table View
系統 MUST 在測試案例的歷史紀錄中，以表格（Table）形式展示過往所有的執行任務。表格欄位 MUST 包含執行編號（帶跳轉連結）、狀態（Badge）、啟動時間、執行耗時與最終審查報告。

#### Scenario: View and navigate run history table
- **WHEN** 使用者在測試案例詳情頁點選進入歷史紀錄分頁，且該測試案例存在歷史執行紀錄時
- **THEN** 前端以表格形式依時間降冪排列展示所有執行紀錄，點擊特定編號的 Row 會正確 navigate 導航至 `/project/:projectId/run/:runId`

