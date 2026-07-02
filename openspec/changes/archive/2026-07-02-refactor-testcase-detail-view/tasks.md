## 1. 搬移檔案與路由設定

- [x] 1.1 將 TestCaseDetailView.tsx 搬移至 frontend/src/features/projects/pages/ 目錄下
- [x] 1.2 刪除 frontend/src/views/ 下未使用的 GroupDashboardView.tsx 檔案
- [x] 1.3 更新 frontend/src/routes.tsx 中對 TestCaseDetailView 的導入路徑

## 2. 建立獨立編輯元件

- [x] 2.1 在 frontend/src/features/projects/components/ 建立 TestCaseEditBlock.tsx 元件，移入編輯表單的邏輯與狀態

## 3. 重構主視圖頁面與驗證

- [x] 3.1 在 TestCaseDetailView.tsx 中引進並渲染 TestCaseEditBlock 與複用 TestCaseDeleteDialog
- [x] 3.2 移除 TestCaseDetailView.tsx 中所有舊的行內編輯 DOM 結構與刪除 Dialog 標記
- [x] 3.3 執行編譯測試 npm run build -w frontend，確保無任何型別或編譯錯誤
