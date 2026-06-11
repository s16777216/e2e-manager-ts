## 1. 路由配置與佈局容器重構

- [ ] 1.1 修改 `frontend/src/routes.tsx`，將 `testCase/:testCaseId` 和 `run/:runId` 調整為 `project/:projectId` 的子路由，並配置 `SelectGroupPrompt` 作為 index 預設路由。
- [ ] 1.2 修改 `frontend/src/views/ProjectDetailView.tsx`，移除右側原有的專案主控台區塊，改為渲染 `<Outlet />` 容器。
- [ ] 1.3 引入 `shadcn/ui` 的 `sidebar.tsx` 元件及相關依賴組件（如 `sheet.tsx`、`tooltip.tsx`、`breadcrumb.tsx`）。

## 2. 建立引導頁面與按鈕搬移

- [ ] 2.1 建立全新的 `frontend/src/views/SelectGroupPrompt.tsx`，採用 Bento 風格排版，顯示引導說明與「建立測試案例」按鈕。
- [ ] 2.2 在 `SelectGroupPrompt` 中訂閱來自 Outlet context 的 `selectedGroupId`，並在未選取群組時進行提示，選取後才啟用建立測試案例功能。
- [ ] 2.3 將「建立測試案例」的 Dialog 彈窗及對應的 API 建立、刷新狀態邏輯，從 `ProjectDetailView.tsx` 搬移至 `SelectGroupPrompt.tsx` 內部。

## 3. Sidebar、Breadcrumb 整合與按鈕搬移

- [ ] 3.1 修改 `ProjectDetailView.tsx`，將「建立群組」按鈕從頂端列移除，整合至左側樹狀導航 Header 的右側（以 `Plus` icon 呈現），並在點擊時以 `selectedGroupId` 作為預設 parentId 啟動 Dialog。
- [ ] 3.2 修改 `TestCaseDetailView.tsx`，將「編輯劇本」和「執行測試」按鈕從全域的頂部列（Topbar）移除，移動至測試案例面板右側內部的獨立 Header 中。
- [ ] 3.3 修改 `ProjectDetailView.tsx`，引入 `SidebarProvider`、`Sidebar` 等元件封裝版面，並使用 `SidebarRail` 支援滑鼠拖曳拉伸側邊欄。
- [ ] 3.4 於 `ProjectDetailView.tsx` 的 Header 中整合 `SidebarTrigger`（一鍵收合側邊欄）與 `Breadcrumb`（動態路徑導航），並移除原先寫死的操作按鈕。

## 4. 編譯、Lint 與 E2E 驗證

- [ ] 4.1 執行 `npx tsc --noEmit --project tsconfig.app.json` 與 `npm run lint`，確保無編譯與 Lint 錯誤。
- [ ] 4.2 於瀏覽器執行 manual E2E 測試，驗證切換測試案例與 Console 時，左側目錄樹狀態完整保持，側邊欄拉伸與快捷鍵折疊功能正常，且頂端麵包屑路徑導航運作順暢。
