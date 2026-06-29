## 1. 路由架構調整 (routes.tsx)

- [ ] 1.1 重構 `routes.tsx`，將專案與案例路由宣告為巢狀（Nested）層級，並以 `<Outlet />` 作為專案父路由的中介 element。
- [ ] 1.2 在專案父路由 `:projectId` 配置中，指派 `id: "project-root"`，並綁定專案資料的 `projectLoader`。
- [ ] 1.3 調整各個子路由的 `handle.crumb` 方法，移除重複的父級（例如 `[專案管理]` 等）麵包屑宣告，僅保留當前節點自身的 crumb 宣告。

## 2. 麵包屑拼裝器優化 (Topbar.tsx)

- [ ] 2.1 修改 `Topbar.tsx`，使用 `useMatches()` 取得匹配的路徑鏈，藉由 `flatMap` 自動合併各級節點的 `handle.crumb` 片段，實現自動路徑拼接。

## 3. View 元件重構 (useRouteLoaderData)

- [ ] 3.1 重構 `TestCaseDetailView.tsx`，移除 local 的 project 資料查詢，改為呼叫 `useRouteLoaderData("project-root")` 來安全提取預取完畢的專案物件；簡化其專屬 loader 僅抓取案例資料。
- [ ] 3.2 重構 `ProjectDetailView.tsx` 與 `ProjectEditView.tsx`，將專案資料取得方式對齊為 `useRouteLoaderData("project-root")`。
- [ ] 3.3 重構 `SSEConsoleView.tsx` 與 `TaskDetailView.tsx`，將專案資料取得方式對齊為 `useRouteLoaderData("project-root")`。

## 4. 編譯驗證與部署測試

- [ ] 4.1 執行 `npm run build -w frontend`，確保重構後的巢狀路由與型別共享機制沒有引發 any / type / loader 相關的編譯錯誤。
- [ ] 4.2 手動導航各個動態頁面，驗證麵包屑拼接與 DynamicIcon 渲染，確保頁面佈局正常且無滾動條衝突。
