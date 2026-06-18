# e2e-web-dashboard Specification

## Purpose
TBD - created by archiving change setup-monorepo-and-frontend. Update Purpose after archive.
## Requirements
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

### Requirement: Testcase Run Details and Real-time SSE Log Stream
系統 MUST 在觸發測試執行後，以實時日誌流（Log Stream）與步驟截圖展示執行過程。前端 MUST 將畫面轉導至 `/project/:projectId/tasks/:taskId` 路由（TaskDetailView），由 TaskDetailView 中的 Run 項目點擊後進入 `/project/:projectId/run/:runId`（SSEConsoleView）。在日誌渲染與歷史紀錄呈現中，系統 MUST 將具有相同步驟索引（`stepIdx`）的所有日誌與執行動作歸類至同一個步驟 Section/Accordion。該步驟折疊面板中 MUST 包含該步驟的詳細工具操作軌跡與時間，且該步驟最後一筆日誌所附帶的網頁截圖 MUST 作為該步驟的最終狀態顯示於該 Section 下方。系統 MUST 在每個執行步驟中紀錄並即時顯示該步驟累計消耗的 LLM Token 數量，並在 Accordion Header 上渲染對應的 Token 消耗 Badge。任務結束後，系統 MUST 渲染最終視覺斷言 PASS/FAIL 的判定報告，且該判定報告中 MUST 一併展示視覺斷言判定所花費的 Token 以及整次 Run 消耗的總 Token 數。系統頂部全域麵包屑中的測試案例名稱連結 MUST 支援點擊並正確導回所屬測試案例詳情頁 `/project/:projectId/testCase/:testCaseId`。所有通知與錯誤回饋 MUST 採用 Sonner (Toaster) 進行 Toast 訊息提示。

#### Scenario: Navigate to TaskDetailView after triggering any execution
- **WHEN** 使用者點擊「執行測試」（無論是單一案例、群組批次或專案批次），API 回傳 taskId
- **THEN** 前端 MUST navigate 至 `/project/:projectId/tasks/:taskId`，顯示 TaskDetailView 批次監控面板

#### Scenario: Stream live steps log with token usage metrics
- **WHEN** 使用者在 TaskDetailView 中點擊特定 Run 進入 `/project/:projectId/run/:runId` 並建立 SSE 連線訂閱時
- **THEN** 前端即時將接收到的日誌更新至對應的步驟區塊中，並在獲取即時日誌流時解析日誌中的 promptTokens、completionTokens 與 totalTokens，將其依據 `stepIdx` 進行歸群，並於步驟 Accordion 標頭右側動態顯示該步驟累計的 Token 消耗

#### Scenario: Display final assert report with total run token usage
- **WHEN** 測試案例執行完畢，視覺斷言（Asserter）返回判定結果與理由時
- **THEN** 前端在上方即時渲染視覺斷言報告，除了展示結果與原因外，也必須展示視覺斷言花費的 Token 與整次測試執行所花費的總 Token 數量

### Requirement: Project List Table View
系統 MUST 在首頁的專案入口提供表格（Table）形式的專案列表，以 shadcn DataTable 組件呈現（使用 `@tanstack/react-table` + `components/ui/table.tsx`）。表格欄位 MUST 包含專案名稱（附帶圖示）、描述、群組數量、測試案例數量、最後執行時間與建立時間。視覺風格 MUST 使用 shadcn 預設主題，不覆蓋 zinc 色號。排序功能 MUST 由 TanStack Table 的 `getSortedRowModel()` 提供，移除手寫排序邏輯；搜尋過濾功能 MUST 由 TanStack Table 的 `getFilteredRowModel()` 配合 globalFilter 提供，移除手寫 `Array.filter()` 邏輯。

#### Scenario: Display and search projects table
- **WHEN** 使用者進入專案首頁，且輸入搜尋關鍵字或點擊欄位標頭進行排序時
- **THEN** 前端以 shadcn DataTable 形式載入所有專案資訊，TanStack Table 即時依關鍵字過濾或依所選欄位排序資料列，點擊 Row 可正確導向專案詳細頁面

### Requirement: TestCase Run History Table View
系統 MUST 在測試案例的歷史紀錄中，以 shadcn DataTable 組件呈現過往所有執行任務（使用 `@tanstack/react-table` + `components/ui/table.tsx`）。表格欄位 MUST 包含執行編號、狀態（Badge）、啟動時間、執行耗時與最終審查報告摘要。視覺風格 MUST 使用 shadcn 預設主題，不覆蓋 zinc 色號。

#### Scenario: View and navigate run history table
- **WHEN** 使用者在測試案例詳情頁點選進入歷史紀錄分頁，且該測試案例存在歷史執行紀錄時
- **THEN** 前端以 shadcn DataTable 形式依時間降冪排列展示所有執行紀錄，點擊特定 Row 會正確 navigate 導航至 `/project/:projectId/run/:runId`

### Requirement: Project Metadata Editing and Deletion
系統 MUST 提供專案資訊的編輯與刪除介面。編輯介面中 MUST 允許更新專案名稱與專案描述。刪除功能 MUST 提供二次確認，要求使用者輸入專案名稱以完成刪除，防止誤操作。

#### Scenario: Edit project information from project detail page
- **WHEN** 使用者進入專案詳細頁，點擊專案名稱旁的編輯按鈕，修改專案名稱或描述並點擊儲存
- **THEN** 前端發送 PATCH 請求更新資料，並在更新成功後即時在頁面上反映修改後的名稱與描述，同時彈出成功通知

#### Scenario: Delete project with confirmation
- **WHEN** 使用者在編輯專案對話框中點擊刪除按鈕，並在二次確認框中輸入正確的專案名稱並點擊確認
- **THEN** 前端發送 DELETE 請求刪除專案，在刪除成功後彈出成功通知，並自動導向專案列表首頁 `/project`

