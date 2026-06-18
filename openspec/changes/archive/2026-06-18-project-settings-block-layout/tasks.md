## 1. 重構 ProjectForm 元件以支援平鋪佈局與內置刪除 Dialog

- [x] 1.1 修改 `ProjectForm.tsx`，廢除 `JsonEditorAccordion` 摺疊面板，將 Cookies 與 LocalStorage 編輯區塊直接在表單內平鋪展開。
- [x] 1.2 於 `ProjectForm.tsx` 中整合即時的 JSON 格式語意驗證，若格式錯誤則禁用表單統一提交按鈕。
- [x] 1.3 於 `ProjectForm.tsx` 底部加入危險區域（當提供 `onDelete` 與 `initialData` 時展示），並整合基於 `BaseDialog` 的刪除確認彈窗（需要輸入專案名稱比對確認）。

## 2. 調整專案編輯頁面與資料提交

- [x] 2.1 修改 `ProjectEditView.tsx`，確保呼叫 `ProjectForm` 元件並傳入正確的統一 `onSubmit` 儲存邏輯，儲存成功後跳轉回專案詳情頁面。

## 3. 驗證與測試

- [x] 3.1 執行前端建置 `npm run build`，確保 100% 通過 TypeScript 與編譯檢查。
- [x] 3.2 驗證編輯頁面的儲存、取消與刪除確認 Dialog 功能正常運作。新建頁面的表單平鋪顯示、JSON 校驗阻擋功能、儲存提交與刪除確認 Dialog 功能正常運作。
