## Why

專案中現有的通用 `DataTable` 元件僅支援一維平鋪數據的展示，缺乏樹狀分層（Tree Grid）展開與摺疊的渲染能力。這導致「專案詳細內容」等高度依賴測試群組、子群組、測試案例樹狀階層結構的視圖無法復用 `DataTable`，因而無法享受到統一的排序、篩選、分頁與視覺一致性。

## What Changes

* **DataTable 樹狀解析擴充**：於 `DataTable.tsx` 引入 TanStack Table (React Table v8) 的 Row Expanding 核心引擎，支援選配的 `getSubRows` 屬性，且與全站現有一維平鋪表格完全向下相容。
* **專案詳細視圖重構**：將 `ProjectDetailView.tsx` 中原本手動拼接 HTML `<table>` 與使用 `<GroupTreeNode>` 逐層遞迴繪製的邏輯，重構為統一使用 `<DataTable>` 組件，提升視覺整合度與維護性。

## Capabilities

### New Capabilities

- `datatable-tree-support`: 提供通用 DataTable 對樹狀數據、子行展開/摺疊與階層縮排的支援。

### Modified Capabilities

無

## Impact

* **通用元件變更**：
  * `frontend/src/components/custom/table/DataTable.tsx` (擴充 props 與 row model 支援樹狀展開)
* **視圖重構**：
  * `frontend/src/views/ProjectDetailView.tsx` (重構導入新 DataTable 並在第一欄配置 Depth 縮排與展開按鈕)
