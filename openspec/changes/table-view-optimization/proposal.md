## Why

目前專案列表使用 Bento Grid 卡片、群組目錄樹使用單純 Tree View、執行歷史使用垂直日誌卡片。這些展現方式在資料量大時會顯得雜亂、缺乏橫向屬性對照（如：各專案的群組數與最後執行時間，或是群組的類型、子項目數與最後執行狀態）。

改用表格（Table）與樹狀表格（Tree Table）呈現，能大幅提升資訊的橫向對比能力，且支援篩選、搜尋與排序，讓整個系統更具專業 IDE 及自動化測試平台的管理質感。

## What Changes

- **專案列表表格化**：將 `ProjectsView.tsx` 中的專案卡片改為 Table 顯示，欄位包含專案名稱（含圖示）、專案描述、群組數量、劇本數量、最後執行時間及操作（進入專案）。
- **目錄導航樹狀表格化 (Tree Table)**：將 `ProjectDetailView.tsx` 左側的單純 Tree View 升級為 Tree Table 顯示，欄位包含名稱（含折疊/展開與縮排線）、項目類型（群組/劇本）、項目/步驟數、及最後執行狀態。
- **執行歷史紀錄表格化**：將 `TestCaseDetailView.tsx` 中 History Tab 的執行歷史紀錄卡片改為 Table 顯示，欄位包含執行編號（連結至運行 Console）、狀態、啟動時間、執行耗時與最終審查報告。

## Capabilities

### New Capabilities
- 無

### Modified Capabilities
- `e2e-web-dashboard`: 調整專案列表、群組/劇本目錄導航及劇本執行歷史之數據呈現規格，將其優化為表格與樹狀表格形式，並支援欄位對齊與屬性對照。

## Impact

- **前端視圖**：`frontend/src/views/ProjectsView.tsx`、`frontend/src/views/ProjectDetailView.tsx`、`frontend/src/views/TestCaseDetailView.tsx` (History 分頁)
- **前端元件**：`frontend/src/components/custom/GroupTreeNode.tsx`（重構或新建為 Tree Table Row 元件）
