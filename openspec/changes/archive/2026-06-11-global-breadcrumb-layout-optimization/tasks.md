## 1. 全域 Layout 與 Breadcrumb 整合

- [x] 1.1 修改 `frontend/src/layouts/RootLayout.tsx`，在左側 aside 中，將系統 LOGO 獨立成一個帶有 `border-b` 的 `h-16` 區塊；在右側工作區頂部，新增一個固定 `h-16` 高度、且帶有 `border-b` 的 Header 區塊，用以渲染統一的 `Breadcrumb`。
- [x] 1.2 在 `RootLayout.tsx` 內宣告 `breadcrumbs` 狀態與 Setter，並透過 `<Outlet context={{ setBreadcrumbs }} />` 將狀態更新函數向下傳遞給所有子視圖。

## 2. 子頁面 Breadcrumb 更新與 Header 簡化

- [x] 2.1 修改 `frontend/src/views/ProjectsView.tsx`，在加載後透過 `setBreadcrumbs` 向全域設定 `[{ label: "專案列表" }]`，並在卸載時清空。
- [x] 2.2 修改 `frontend/src/views/ProjectDetailView.tsx`，徹底移除內部渲染 Breadcrumb 的舊 Header，改為透過 Context 呼叫 `setBreadcrumbs` 動態回傳專案層級之麵包屑資訊。
- [x] 2.3 修改 `frontend/src/views/TestCaseDetailView.tsx`，徹底移除內部渲染 Breadcrumb 的舊 Header，改為透過 Context 呼叫 `setBreadcrumbs` 動態回傳劇本層級之麵包屑資訊。
- [x] 2.4 修改 `frontend/src/views/SSEConsoleView.tsx`，徹底移除內部渲染 Breadcrumb 的舊 Header，改為透過 Context 呼叫 `setBreadcrumbs` 動態回傳任務監控層級之麵包屑資訊。

## 3. 編譯與端到端驗證

- [x] 3.1 執行 `npx tsc --noEmit --project tsconfig.app.json` 與 `npm run lint`，確保無任何編譯與 Lint 錯誤。
- [x] 3.2 啟動瀏覽器代理人，驗證左右兩側頂部 Header 的高度是否完美切齊，且在切換頁面時麵包屑與 Header 版面無任何抖動與殘留，返回跳轉行為正常。
