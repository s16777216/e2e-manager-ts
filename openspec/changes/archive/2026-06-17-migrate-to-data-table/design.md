## Context

目前 `HistoryView`、`ProjectsView`、`TestCaseDetailView` 三個頁面使用手寫 HTML `<table>` 搭配 React state 手動實作排序與過濾邏輯。專案已採用 shadcn/ui（Tailwind CSS v4），但尚未安裝 `table` 組件與 `@tanstack/react-table`。`ProjectsView` 的排序使用 `sortField`/`sortDir` state 搭配 `handleSort()` 函數；文字過濾使用 `searchQuery` state 搭配 `Array.filter()`，這些邏輯分散且重複。

## Goals / Non-Goals

**Goals:**
- 安裝 `@tanstack/react-table` 與 shadcn `table` 組件
- 建立共用泛型 `DataTable<TData>` 組件，封裝 TanStack 的 sorting 與 globalFilter，支援 row click 回調
- 將 `HistoryView`、`ProjectsView`、`TestCaseDetailView` 的手寫 table 改為使用 `DataTable`
- `ProjectsView` 的手寫排序與過濾邏輯全部移除，改由 TanStack 管理
- 最終視覺風格使用 shadcn 預設主題，不額外自訂

**Non-Goals:**
- `ProjectDetailView` 的樹狀結構 table 不在本次範圍
- 不實作分頁（pagination）
- 不實作 row 選取（row selection）
- 不修改後端 API

## Decisions

### D1：使用 TanStack Table（`useReactTable`）而非直接用 shadcn `<Table>` 組件

**決定**：使用 `@tanstack/react-table` 的 `useReactTable` hook 搭配 shadcn `<Table>` 組件渲染。

**理由**：shadcn Data Table 的官方模式即是此組合。單獨使用 shadcn `<Table>` 只是 UI 層，無排序/過濾能力；手寫排序邏輯難以維護。TanStack 提供 headless 邏輯，shadcn 提供 UI，兩者搭配是最符合專案現有設計系統的方式。

**替代方案考慮**：
- 只裝 `table.tsx` 不裝 TanStack：仍需手寫排序邏輯，解決的問題有限
- 使用 AG Grid / react-table v7：生態不符合 shadcn 設計系統

---

### D2：建立共用 `DataTable<TData>` 泛型組件

**決定**：在 `components/custom/DataTable.tsx` 建立一個泛型組件，由各 View 傳入 `columns` 與 `data`。

**理由**：三個 View 的 table 結構雷同（排序、過濾、row click），集中在一個組件可避免重複的 `useReactTable` 設定程式碼。各 View 只需定義自己的 `ColumnDef[]`，維護點明確。

**介面設計**：
```ts
interface DataTableProps<TData> {
  columns: ColumnDef<TData>[]
  data: TData[]
  onRowClick?: (row: TData) => void
  globalFilter?: string
  onGlobalFilterChange?: (value: string) => void
}
```

`globalFilter` 與 `onGlobalFilterChange` 由父層 View 控制（controlled），讓 View 可以繼續在 UI 上放搜尋框並控制其值，DataTable 內部僅消費這個值。

---

### D3：ProjectsView 的排序改為 TanStack column sorting

**決定**：移除 `sortField`、`sortDir`、`handleSort` 所有手寫邏輯，改為在 `ColumnDef` 中設定 `enableSorting: true`，由 `useReactTable` 的 `getSortedRowModel()` 處理。Column header 使用 TanStack 的 `column.getToggleSortingHandler()` 觸發排序切換，`column.getIsSorted()` 顯示目前排序方向。

---

### D4：ProjectsView 的文字過濾改為 TanStack globalFilter

**決定**：移除手寫 `searchQuery` + `Array.filter()` 邏輯，改為搜尋框的值透過 `globalFilter` prop 傳入 DataTable，由 `getFilteredRowModel()` 處理跨欄位模糊比對。`HistoryView` 的下拉選單過濾（狀態/專案）維持前端 `Array.filter()` 在傳入 DataTable 前過濾，因為這些是結構化過濾而非文字搜尋。

## Risks / Trade-offs

- **[風險] TanStack globalFilter 的比對行為**：預設會比對所有欄位的字串值，若欄位包含物件（如 badge 組件）可能需要自訂 `filterFn`。→ **緩解**：`ColumnDef` 中可設定 `filterFn: 'includesString'` 並只對有意義的文字欄位啟用過濾。
- **[Trade-off] `HistoryView` 的下拉過濾保持手寫**：與 ProjectsView 行為不一致，但 HistoryView 的過濾邏輯（狀態 enum + 專案 ID）結構化，不適合 globalFilter。後續若需要統一可再重構。
