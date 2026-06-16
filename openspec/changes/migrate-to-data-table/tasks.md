## 1. 安裝依賴與 shadcn 組件

- [ ] 1.1 在 `frontend` 執行 `npm install @tanstack/react-table`
- [ ] 1.2 在 `frontend` 執行 `npx shadcn@latest add table`，確認 `components/ui/table.tsx` 已建立

## 2. 建立共用 DataTable 組件

- [ ] 2.1 建立 `frontend/src/components/custom/DataTable.tsx`，實作泛型 `DataTable<TData>` 組件
- [ ] 2.2 組件接受 `columns: ColumnDef<TData>[]`、`data: TData[]`、`onRowClick?: (row: TData) => void`、`globalFilter?: string`、`onGlobalFilterChange?: (v: string) => void`
- [ ] 2.3 組件內使用 `useReactTable` 啟用 `getCoreRowModel()`、`getSortedRowModel()`、`getFilteredRowModel()`
- [ ] 2.4 渲染層使用 `components/ui/table.tsx` 的 `Table`、`TableHeader`、`TableBody`、`TableRow`、`TableHead`、`TableCell` 組件
- [ ] 2.5 Column header 顯示排序狀態（上箭頭 / 下箭頭 / 預設），點擊觸發 `column.getToggleSortingHandler()`
- [ ] 2.6 `onRowClick` 有傳入時，在 `TableRow` 加上 `onClick` 與 `cursor-pointer` 樣式
- [ ] 2.7 無資料或過濾後空白時，顯示 `找不到符合條件的紀錄。` 提示

## 3. 改寫 HistoryView

- [ ] 3.1 在 `HistoryView.tsx` 定義 `columns: ColumnDef<Task>[]`，欄位包含：任務編號、所屬專案、範圍、進度、建立時間、Token 消耗、結果
- [ ] 3.2 移除手寫 `<table>`、`<thead>`、`<tbody>`、`<tr>`、`<td>`、`<th>` 結構
- [ ] 3.3 用 `<DataTable>` 替換，傳入 `columns`、`data={filteredTasks}`、`onRowClick` 導航至任務詳情頁
- [ ] 3.4 `filteredTasks` 的前端 `Array.filter()`（依專案、依狀態下拉）保留不動，在傳入 DataTable 前過濾

## 4. 改寫 ProjectsView

- [ ] 4.1 在 `ProjectsView.tsx` 定義 `columns: ColumnDef<Project>[]`，欄位包含：專案名稱、描述、群組數、案例數、最後執行時間、建立時間
- [ ] 4.2 移除 `sortField`、`sortDir` state 與 `handleSort()` 函數，移除 `sortedProjects` 衍生邏輯
- [ ] 4.3 移除 `searchQuery` state 與手寫 `Array.filter()` 過濾邏輯
- [ ] 4.4 搜尋框改為受控輸入，值綁定 `globalFilter` state，傳入 `<DataTable globalFilter={globalFilter} onGlobalFilterChange={setGlobalFilter}>`
- [ ] 4.5 移除手寫 `<table>` 結構，用 `<DataTable>` 替換，`onRowClick` 導航至專案詳情頁
- [ ] 4.6 專案名稱欄位的「進入專案」按鈕 / Arrow icon 可移除或保留為 column 內的 cell render（視覺整齊即可）

## 5. 改寫 TestCaseDetailView（History Tab）

- [ ] 5.1 在 `TestCaseDetailView.tsx` 定義 `columns: ColumnDef<TestRun>[]`，欄位包含：執行編號、狀態 Badge、啟動時間、執行耗時、最終審查報告摘要
- [ ] 5.2 移除 History tab 內的手寫 `<table>` 結構
- [ ] 5.3 用 `<DataTable>` 替換，`onRowClick` 導航至 `/project/:projectId/run/:runId`

## 6. 驗收

- [ ] 6.1 確認三個頁面的 Table 皆正常顯示，使用 shadcn 預設主題樣式
- [ ] 6.2 確認 ProjectsView 欄位排序（名稱、群組數、案例數、最後執行時間、建立時間）正常運作
- [ ] 6.3 確認 ProjectsView 搜尋框過濾正常運作（TanStack globalFilter）
- [ ] 6.4 確認 HistoryView 下拉過濾（專案、狀態）正常運作
- [ ] 6.5 確認三個頁面的 Row click 能正確 navigate
- [ ] 6.6 確認空資料時各 Table 皆顯示「找不到符合條件的紀錄。」提示
