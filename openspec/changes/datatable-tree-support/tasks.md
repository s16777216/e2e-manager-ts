## 1. 擴充 DataTable 元件 (DataTable Component Refactor)

- [ ] 1.1 修改 `frontend/src/components/custom/table/DataTable.tsx`，在 `DataTableProps` 中新增 `getSubRows`、`getRowCanExpand`、`getRowId`、`expanded` 與 `onExpandedChange`。
- [ ] 1.2 在 `useReactTable` 中載入 `getExpandedRowModel`，設定 `paginateExpandedRows: false` 與 `filterFromLeafRows: true`，並支援受控與非受控的 `expanded` 狀態。

## 2. 重構專案詳細視圖 (ProjectDetailView Refactor)

- [ ] 2.1 修改 `frontend/src/features/projects/pages/ProjectDetailView.tsx`，定義 `ProjectTreeRow` 樹狀節點型別。
- [ ] 2.2 於該 View 定義 Columns 對照表，在「名稱」欄位中整合 `row.depth` 縮排、資料夾與案例 icon、展開/摺疊按鈕，並點擊呼叫 `row.getToggleExpandedHandler()`。
- [ ] 2.3 實作 `buildNestedTree` 函數，將原先 Group 樹資料與懶加載 TestCase 快取整合為巢狀樹狀結構。
- [ ] 2.4 實作 `handleExpandedChange` 攔截器狀態更新，在群組展開且資料未加載時觸發 API 懶加載，並更新 TestCase 快取。
- [ ] 2.5 在 `ProjectDetailView` 的目錄樹渲染處，將原本的 `<GroupTreeTable>` 替換為新版 `<DataTable>`，並對接受控的 `expanded` 狀態與欄位定義。
- [ ] 2.6 清理並刪除不再使用的舊檔案：
  - [NEW] [DELETE] `frontend/src/features/projects/components/GroupTreeTable.tsx`
  - [NEW] [DELETE] `frontend/src/features/projects/components/GroupTreeNode.tsx`

## 3. 打包與整合測試 (Build & Validation)

- [ ] 3.1 執行 `npm run build -w frontend`，確保打包編譯成功，無 TypeScript 與 ESLint 報錯。
- [ ] 3.2 啟動本地開發伺服器，前往「專案詳細內容」頁面，手動驗證「樹狀群組層級顯示與縮排」、「點擊群組展開並懶加載測試案例」、「過濾搜尋是否能正確保留父群組階層」、以及「新增/刪除群組與案例後 Table 即時更新」等功能是否正常運作。
