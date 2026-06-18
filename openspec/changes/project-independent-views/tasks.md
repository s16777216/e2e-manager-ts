## 1. 抽取共用表單元件

- [ ] 1.1 新增 `frontend/src/components/custom/ProjectForm.tsx`，將專案基本資訊、`JsonEditorAccordion` 設定與相關驗證邏輯集中。
- [ ] 1.2 於 `ProjectForm.tsx` 整合「危險刪除區域」，僅在傳入 `onDelete` 時顯示，並提供輸入專案名稱的安全確認邏輯。

## 2. 建立新頁面視圖

- [ ] 2.1 新增 `frontend/src/views/ProjectCreateView.tsx`，使用 `ProjectForm` 來處理專案的建立，並於成功後跳轉。
- [ ] 2.2 新增 `frontend/src/views/ProjectEditView.tsx`，使用 `ProjectForm` 處理專案更新與刪除，並正確載入現有資料。

## 3. 路由配置與舊元件清理

- [ ] 3.1 修改 `frontend/src/routes.tsx`，在合適位置新增 `/project/new` 與 `/project/:projectId/edit` 的路由宣告。
- [ ] 3.2 刪除舊有的 `NewProjectDialog.tsx` 與 `EditProjectDialog.tsx` 彈窗元件。

## 4. 現有視圖跳轉調整與建置驗證

- [ ] 4.1 修改 `frontend/src/views/ProjectsView.tsx`，將「建立新專案」按鈕事件改為導航至 `/project/new`。
- [ ] 4.2 修改 `frontend/src/views/ProjectDetailView.tsx`，將編輯按鈕事件改為導航至 `/project/:projectId/edit`。
- [ ] 4.3 執行前端建置，確保 100% 通過型別檢查與編譯。
