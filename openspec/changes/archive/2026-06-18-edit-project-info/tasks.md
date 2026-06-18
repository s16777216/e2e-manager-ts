## 1. 前端 API 與 Hook 擴充

- [x] 1.1 於 `frontend/src/lib/api.ts` 新增更新專案 (`updateProject`) 與刪除專案 (`deleteProject`) 的 API 封裝。
- [x] 1.2 於 `frontend/src/hooks/useProjectData.ts` 新增 `handleUpdateProject` 與 `handleDeleteProject` 處理函數，並回傳提供 UI 調用。

## 2. 建立編輯與刪除 Dialog 元件

- [x] 2.1 建立 `frontend/src/components/custom/EditProjectDialog.tsx` 元件，整合名稱與描述編輯表單。
- [x] 2.2 於 `EditProjectDialog` 中加入「刪除專案」的邏輯，設計比對專案名稱文字一致後解鎖「確定刪除」按鈕的二次驗證確認框。

## 3. 專案詳情頁整合

- [x] 3.1 修改 `frontend/src/views/ProjectDetailView.tsx`，在專案名稱標題右側掛載 `Edit2` 編輯按鈕與 `EditProjectDialog` 彈窗。
- [x] 3.2 於 `ProjectDetailView` 中處理更新後的即時反應，並在專案成功刪除後透過 `navigate("/project")` 導向至專案列表首頁。
