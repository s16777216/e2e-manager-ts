## Why

目前前端路由採用平鋪（Flatten）結構配置，導致所有深層頁面（如編輯專案、測試案例詳情、執行紀錄詳情）在 `routes.tsx` 的 `handle.crumb` 中必須自行手動拼接完整的父級麵包屑路徑，這帶來了嚴重的程式碼重複。此外，平鋪結構無法充分發揮 React Router 7 的 Layout 嵌套能力，使得各個子 View 需要重載或平行 Fetch 專案等父級資料，造成額外的 API 請求與狀態管理負擔。

## What Changes

* **巢狀路由化**：在 `routes.tsx` 中將具有邏輯與物理層級的路由（如專案下的編輯、測試案例、批次與執行監控）改為樹狀嵌套，引入中介 Layout（`<Outlet />`）。
* **麵包屑動態拼接**：重構 `Topbar.tsx`，利用 `useMatches()` 取得整個匹配鏈，將各個路由節點「僅負責自身 Segment」的 `handle.crumb` 自動進行 `flatMap` 拼接。
* **資料加載共享化**：設定父路由 ID（如 `project-root`），讓子路由 View 可透過 `useRouteLoaderData("project-root")` 直接獲取父級已預取好的 `project` 資料，避免在子路由的 loader 中重複發送 API 請求。
* **型別安全增強**：統一優化 `RouteHandle` 的泛型約束，使用 `Awaited<ReturnType<T>>` 自動推導 data 的實際型別，消除 any。

## Capabilities

### New Capabilities

無

### Modified Capabilities

- `route-breadcrumb`: 聲明式麵包屑系統由原來的全路徑葉子節點推送，升級為利用路由層級嵌套由 Layout 自動 `flatMap` 派生與合併。

## Impact

* **路由與 Layout**：
  * `frontend/src/routes.tsx`（重構為 Nest 樹狀路由與 loaders 分級）
  * `frontend/src/layouts/RootLayout.tsx`（清空 Outlet 傳參與 context）
  * `frontend/src/layouts/Topbar.tsx`（以 `flatMap` 動態串接麵包屑）
* **深層 Views 重構**：
  * `ProjectEditView.tsx`、`TestCaseDetailView.tsx`、`SSEConsoleView.tsx`、`TaskDetailView.tsx`（改用 `useRouteLoaderData` 取代 local Fetch / 重複 data 獲取）
