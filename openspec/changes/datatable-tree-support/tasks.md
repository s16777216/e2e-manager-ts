## 1. 擴充 DataTable 元件 (DataTable Component Refactor)

- [ ] 1.1 修改 `frontend/src/components/custom/table/DataTable.tsx`，在 `DataTableProps` 中新增選配的 `getSubRows` 參數。
- [ ] 1.2 在 `useReactTable` 中設定並載入 `getExpandedRowModel`，並用 `useState` 保存與管理 `expanded` 狀態。

## 2. 重構專案詳細視圖 (ProjectDetailView Refactor)

- [ ] 2.1 修改 `frontend/src/views/ProjectDetailView.tsx`，為測試案例目錄樹定義 Columns 對照表，首欄「名稱」中整合 `row.depth` 縮排、資料夾與案例 icon、以及展開收合按鈕與事件。
- [ ] 2.2 在 `ProjectDetailView` 的目錄樹渲染處，將原本手動拼接的 `<table>` 與 `flatRows.map(<GroupTreeNode>)` 替換為新版 `<DataTable>`。
- [ ] 2.3 整合 `DataTable` 數據，將原先 Group 樹資料與懶加載 TestCase 快取合併至統一型別的 `subRows` 樹中，並串接懶加載載入 API 觸發表格更新。
- [ ] 2.4 清理並廢棄現有不再使用的舊檔案或冗餘元件（若適用，如 `GroupTreeNode.tsx`）。

## 3. 打包與整合測試 (Build & Validation)

- [ ] 3.1 執行 `npm run build -w frontend`，確保打包編譯成功，無 TypeScript 與 ESLint 報錯。
- [ ] 3.2 啟動本地開發伺服器，前往「專案詳細內容」頁面，手動驗證「樹狀群組層級顯示與縮排」、「點擊群組展開並懶加載測試案例」、以及「新增/刪除群組與案例後 Table 即時更新」等功能是否正常運作。
