## 1. 重構 useGroupData Hook 處理資料結構

- [ ] 1.1 於 `useGroupData.ts` 中移除原有錯誤的 `buildGroupTree` 樹狀重建函式。
- [ ] 1.2 新增 `processGroupTree` 遞迴處理函式，確保所有節點的 `parentId` 屬性正確（優先提取 `parent.id`），並將樹狀節點遞迴扁平化收集至一個陣列中。
- [ ] 1.3 修改 `useGroupData` Hook 內部的 `loadGroups` 與狀態定義，將後端 API 直接回傳的原始樹狀資料經補全後存入 `groupTree`，並將扁平化後的群組陣列存入 `groups`。
- [ ] 1.4 修改 `useEffect` 以便在 `projectId` 清空或改變時，同步初始化重設 `groups` 與 `groupTree`。

## 2. 優化 ProjectDetailView 的群組建立與展開交互

- [ ] 2.1 修改 `ProjectDetailView.tsx` 中傳遞給 `NewSubgroupDialog` 的 `onCreateGroup` 函式，在建立子群組成功後，自動將父群組的 `parentId` 寫入 `expandedGroups` 狀態以執行自動展開。

## 3. 驗證與測試

- [ ] 3.1 執行前端建置 `npm run build`，驗證無型別或編譯錯誤。
- [ ] 3.2 於網頁中進行手動測試，驗證建立新子群組後會自動展開父群組並正確即時顯示出來，且可正常點擊「編輯群組」進行設定儲存。
