## Why

目前前端各 View 的全域麵包屑（Breadcrumb）透過 `useOutletContext` 手動推送，導致同一個 `BreadcrumbItem` interface 在 11 個地方重複定義（名稱不統一），並且每個 View 都要撰寫相同的 `useEffect` + cleanup 樣板程式碼。動態麵包屑（含專案名稱）需要各 View 自行 fetch 資料後才能更新，與路由結構完全分離。本次重構旨在以 React Router 7 原生能力（`handle` + `useMatches` + `loader`）取代現有的命令式推送模式，將麵包屑設定回歸至路由宣告，徹底消除各 View 的相關樣板程式碼。

## What Changes

- **新增統一型別定義**：`src/types/breadcrumb.ts` 成為 `Crumb`、`RouteHandle` 的唯一來源，刪除各 View 中的重複 interface 宣告。
- **新增 loader 集中模組**：`src/lib/loaders.ts` 統一定義各路由的 loader 函數，直接呼叫現有 `api` 物件。
- **重構 `routes.tsx`**：各路由加入 `handle.crumb` 靜態/動態麵包屑定義（使用 `satisfies RouteHandle` 嚴格型別），需要動態名稱的路由（project detail、testcase、task、SSEConsole）同時加入對應 `loader`。
- **重構 `RootLayout.tsx`**：移除 `useState<BreadcrumbItem[]>` 與 `Outlet context`，改以 `useMatches()` 自動派生 `breadcrumbs`；`<Outlet>` 不再傳遞 context。
- **重構 `Topbar.tsx`**：移除 `breadcrumbs` prop，改為在元件內部直接讀取路由 matches 並渲染麵包屑。
- **重構各 View**（9 個）：移除 `interface BreadcrumbItemType`、`interface OutletContextType`、`useOutletContext`、`setBreadcrumbs` 的 `useEffect`；有 loader 的 View 以 `useLoaderData()` 取得預取資料，其餘的資料 fetch 邏輯保持不變（保留 View 內 skeleton）。
- **提升麵包屑豐富性**：`Crumb` 型別新增 `icon?: LucideIcon` 欄位，`Topbar` 渲染時可選擇性顯示圖示。

## Capabilities

### New Capabilities
- `route-breadcrumb`: 宣告式麵包屑系統——透過路由 `handle.crumb` 函數與 loader 資料自動產生全局麵包屑，無需各 View 手動推送。

### Modified Capabilities
<!-- 無 spec-level 行為變更 -->

## Impact

- **前端路由與佈局**：
  - [routes.tsx](file:///c:/works/e2e-manager-ts/frontend/src/routes.tsx)（重構）
  - [RootLayout.tsx](file:///c:/works/e2e-manager-ts/frontend/src/layouts/RootLayout.tsx)（重構）
  - [Topbar.tsx](file:///c:/works/e2e-manager-ts/frontend/src/layouts/Topbar.tsx)（重構）
- **新增檔案**：
  - `frontend/src/types/breadcrumb.ts`
  - `frontend/src/lib/loaders.ts`
- **View 清理**（移除樣板，部分加入 useLoaderData）：
  - `ProjectsView.tsx`, `ProjectCreateView.tsx`, `ProjectEditView.tsx`
  - `ProjectDetailView.tsx`, `TestCaseDetailView.tsx`
  - `SSEConsoleView.tsx`, `TaskDetailView.tsx`
  - `HistoryView.tsx`, `SettingsView.tsx`
- **無後端異動**、**無新依賴**（React Router 7 已安裝）
