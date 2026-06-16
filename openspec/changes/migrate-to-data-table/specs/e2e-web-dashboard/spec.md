## MODIFIED Requirements

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
