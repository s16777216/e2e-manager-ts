# route-breadcrumb Specification

## Purpose
TBD - created by archiving change react-router-breadcrumb. Update Purpose after archive.
## Requirements
### Requirement: Route-declared breadcrumbs
系統 SHALL 透過路由定義中的 `handle.crumb` 函數自動產生全局麵包屑，無需各 View 手動推送。每個路由的 `handle` 物件 SHALL 使用 `satisfies RouteHandle` 確保靜態型別正確。

#### Scenario: Static route breadcrumb renders
- **WHEN** 用戶導航至靜態路由（如 `/project`、`/tasks`、`/settings`）
- **THEN** Topbar SHALL 自動顯示對應的麵包屑，無需 View 呼叫任何推送函數

#### Scenario: Dynamic route breadcrumb with loader data
- **WHEN** 用戶導航至動態路由（如 `/project/:projectId`），loader 成功取得資料
- **THEN** 麵包屑 SHALL 顯示專案的實際名稱（而非佔位符）

#### Scenario: Loader fetch failure fallback
- **WHEN** 用戶導航至動態路由，loader 中的 API fetch 失敗
- **THEN** loader SHALL 回傳 `null`（而非 throw），頁面 SHALL 正常渲染，麵包屑 SHALL 顯示預設佔位文字

### Requirement: Unified breadcrumb type system
系統 SHALL 在 `src/types/breadcrumb.ts` 中統一定義 `Crumb` 與 `RouteHandle` 介面，所有路由與元件 SHALL 從此單一來源 import。各 View 中重複定義的 `interface BreadcrumbItemType` / `OutletContextType` SHALL 被移除。

#### Scenario: Single type source
- **WHEN** 開發者新增路由的 `handle.crumb`
- **THEN** 僅需從 `types/breadcrumb.ts` import `RouteHandle` 與 `Crumb`，無需自行定義型別

### Requirement: Icon-enriched breadcrumb items
系統 SHALL 支援麵包屑項目攜帶可選的 Lucide 圖示（`icon?: LucideIcon`）。`Topbar` SHALL 在 icon 存在時將其渲染於 label 前方。

#### Scenario: Breadcrumb with icon
- **WHEN** 路由 `handle.crumb` 回傳含有 `icon` 屬性的 `Crumb` 物件
- **THEN** Topbar SHALL 在麵包屑 label 左側顯示對應圖示

#### Scenario: Breadcrumb without icon
- **WHEN** 路由 `handle.crumb` 回傳不含 `icon` 屬性的 `Crumb` 物件
- **THEN** Topbar SHALL 僅顯示 label 文字，不渲染任何圖示佔位

### Requirement: View breadcrumb boilerplate elimination
各 View SHALL 不包含任何麵包屑相關的程式碼（`useOutletContext`、`setBreadcrumbs`、麵包屑專用的 `useEffect`）。`RootLayout` SHALL 不再透過 `Outlet context` 傳遞 `setBreadcrumbs`。

#### Scenario: View has no breadcrumb code
- **WHEN** 開發者檢視任意 View 元件的原始碼
- **THEN** 不 SHALL 存在 `setBreadcrumbs`、`useOutletContext<OutletContextType>` 或麵包屑專用的 `useEffect`

#### Scenario: New view requires no breadcrumb setup
- **WHEN** 開發者新增一個新的 View 並在 `routes.tsx` 宣告其路由與 `handle.crumb`
- **THEN** 麵包屑 SHALL 自動出現，View 無需任何額外設定

### Requirement: SSEConsoleView breadcrumb with project context
`/project/:projectId/run/:runId` 路由的麵包屑 SHALL 包含：`[專案管理] > [project.name] > [執行 #runId 前 8 碼]`。loader SHALL 僅 fetch project 資料（β-2 策略），不串接 run 與 testcase 的 fetch。

#### Scenario: SSE console breadcrumb shows project name
- **WHEN** 用戶導航至執行監控頁面
- **THEN** 麵包屑 SHALL 顯示「專案管理 > {project.name} > 執行 #{runId 前 8 碼}」

#### Scenario: SSE console breadcrumb omits testcase segment
- **WHEN** 用戶導航至執行監控頁面
- **THEN** 麵包屑 SHALL 不包含 testcase 名稱段（由 loader 無法預取決定，符合 β-2 設計）

