## Why

目前 `HistoryView`、`ProjectsView`、`TestCaseDetailView` 三個頁面使用手寫 HTML `<table>` 搭配 React state 自行實作排序與過濾邏輯，風格與 shadcn 主題不一致，且維護成本高。統一改用 shadcn Data Table（基於 TanStack Table v8）可讓排序、過濾邏輯集中管理，並與專案設計系統保持一致。

## What Changes

- **新增** `@tanstack/react-table` 套件依賴
- **新增** shadcn `table` 組件（`components/ui/table.tsx`）
- **新增** 共用泛型組件 `components/custom/DataTable.tsx`，封裝 TanStack Table 核心邏輯（排序、全域過濾、row click 導航）
- **修改** `HistoryView.tsx`：將手寫 `<table>` 替換為 `<DataTable>` + `ColumnDef<Task>[]`
- **修改** `ProjectsView.tsx`：將手寫 `<table>` 及所有手寫排序（`handleSort`、`sortField`、`sortDir`）、文字過濾（`searchQuery`）邏輯替換為 TanStack Table 內建 sorting 與 globalFilter
- **修改** `TestCaseDetailView.tsx`：將 History tab 內的手寫 `<table>` 替換為 `<DataTable>` + `ColumnDef<TestRun>[]`
- `ProjectDetailView.tsx` 的樹狀 table **不在本次範圍內**

## Capabilities

### New Capabilities

- `data-table-component`: 共用 DataTable 泛型組件，支援 shadcn 主題、TanStack 排序與全域過濾、row click 回調

### Modified Capabilities

- `global-execution-history`: HistoryView 的列表改為 shadcn Data Table，過濾行為由前端 state 改為 TanStack globalFilter
- `e2e-web-dashboard`: ProjectsView 的專案列表改為 shadcn Data Table，排序與搜尋改由 TanStack 管理

## Impact

- **前端依賴**：新增 `@tanstack/react-table`
- **新增組件**：`frontend/src/components/custom/DataTable.tsx`
- **新增 UI 組件**：`frontend/src/components/ui/table.tsx`（shadcn 安裝）
- **修改 View 檔案**：`HistoryView.tsx`、`ProjectsView.tsx`、`TestCaseDetailView.tsx`
- **不影響後端 API**，不影響路由結構，不影響 `ProjectDetailView.tsx`
