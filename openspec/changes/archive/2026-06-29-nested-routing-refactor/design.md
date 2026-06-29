## Context

目前前端各頁面在 `routes.tsx` 中均宣告為同級的平鋪（Flat）子路由。這迫使所有深層葉子路由（如 `TestCaseDetailView`）的 `handle.crumb` 必須知曉整條麵包屑鏈，並手動在代碼中拼接 `[專案管理] > [專案名]` 等父級路徑。

React Router 7 支持樹狀嵌套路由。透過將路徑嵌套並使用 `<Outlet />` 進行層級渲染，我們可以將麵包屑解析職責下放到各層級路由節點，並利用 `useRouteLoaderData` 共享父路由已經 pre-fetch 的資料，進而減少重複的網路請求與資料加載邏輯。

## Goals / Non-Goals

**Goals:**
* 在 `routes.tsx` 中將 `/project` 下的所有子路由（建立、詳情、編輯、測試案例、批次執行）改造為巢狀（Nested）路由。
* 重構 `Topbar.tsx`，使用 `flatMap` 合併各級 matches 的 `handle.crumb`。
* 在子路由元件中，透過 `useRouteLoaderData` 直接獲取父路由載入好的 `project`，免去重複的單筆 Fetch。
* 消除 `TestCaseDetailView`、`ProjectEditView`、`SSEConsoleView`、`TaskDetailView` 內對專案名稱查詢的重複資料獲取邏輯。

**Non-Goals:**
* 不改變後端 API 與傳回值格式。
* 不影響側邊選單配置檔 `menu.ts` 與 `RootLayout` 側邊選單動態渲染機制。
* 不為中介嵌套節點建立冗餘的 Layout 元件，儘量直接以 React Router 的 `<Outlet />` 作為中介 element。

## Decisions

### 1. 以 React Router `<Outlet />` 作為中介 nested 節點元件
* **決策**：在 `routes.tsx` 中，`/project` 和 `/project/:projectId` 被宣告為父級節點，其 `element` 直接配置為 `<Outlet />`，而不需要單獨建立 `ProjectLayout.tsx` 檔案。
* **理由**：我們只需要這些節點作為資料載入（loader）與麵包屑聲明的容器，無須額外的 layout HTML 包裹。直接使用 `<Outlet />` 可使代碼庫最為精簡。

### 2. 父路由 ID 約束
* **決策**：為 `/project/:projectId` 的路由節點分配 `id: "project-root"`。
* **理由**：子路由（如編輯專案、測試案例詳情、執行詳情）需要透過 `useRouteLoaderData("project-root")` 來共享載入完畢的 `Project` 實例，React Router 規定必須在此父節點指定唯一的 `id`。

### 3. 單一麵包屑 Segments 化
* **決策**：重構 `handle.crumb`，使其僅傳回「該節點本身」代表的麵包屑陣列，例如 `:projectId` 僅回傳 `[{ label: data.name, to: ... }]`，不再包含 `[專案管理]`。由 `Topbar.tsx` 透過 `matches.flatMap` 來實現路徑鏈的自動組合。
* **理由**：這能徹底消除所有子頁面中對 `[專案管理]` 等靜態父級路徑的重複聲明。

## Risks / Trade-offs

* **[風險]** 嵌套路由可能引起高度配置或滾動條衝突。
  * **[對策]** 保持 `RootLayout.tsx` 作為主要的滾動容器（`ScrollArea`），各子 View（View 元件內部）僅負責呈現自身內容，且避免在中介 `<Outlet />` 節點上套用帶有 `overflow-auto` 的 wrapper。
* **[風險]** 如果父路由加載失敗（`projectLoader` 返回 `null`），子路由可能在取用 `useRouteLoaderData("project-root")` 時報錯。
  * **[對策]** 子路由中在使用專案資料時，對從 `useRouteLoaderData` 取得的對象進行 `null` 檢查防護，若為 `null` 則降級顯示為找不到專案。
