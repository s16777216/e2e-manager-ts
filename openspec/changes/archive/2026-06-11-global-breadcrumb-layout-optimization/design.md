## Context

當前應用程式的麵包屑導航 (Breadcrumb) 散落在各個 View 元件內自己渲染。這造成了跳轉頁面時的排版高度抖動。同時，全域側邊欄 `RootLayout` 的 Logo Header 與工作區頂部 Header 缺少水平切齊與 border-b 邊界線對齊，破壞了 Bento/IDE 的雙欄格網視覺美感。

本設計將麵包屑提升為全域 `RootLayout` 管理，並進行 Header 水平高度對齊設計。

## Goals / Non-Goals

**Goals:**
- **全域對齊**：將 `RootLayout` 的左上角 Logo 區與右上角 Breadcrumb 區高度皆設定為固定的 `h-16` (64px)，並皆加上 `border-b` 邊界線對齊。
- **狀態共用**：在 `RootLayout` 宣告 `breadcrumbs` 狀態，並利用 React Router 的 Outlet Context 將 `setBreadcrumbs` setter 傳遞給子頁面。
- **解耦子視圖**：從 `ProjectsView`、`ProjectDetailView`、`TestCaseDetailView` 與 `SSEConsoleView` 中移除各自重複寫死的 Breadcrumb Header，簡化子視圖結構。

**Non-Goals:**
- 不引入外部全域狀態管理庫（如 Zustand），完全使用 React 的內建狀態傳遞。
- 不改變子頁面內部原有的 API 請求與資料載入邏輯。

## Decisions

### 1. 麵包屑狀態管理：React Outlet Context
- **決策**：在 `RootLayout.tsx` 中使用 `useState` 宣告 `breadcrumbs` 狀態，並藉由 `<Outlet context={{ setBreadcrumbs }} />` 共享給子頁面。
- **原因**：由於資料（如專案名稱、劇本名稱）依然是由各子頁面透過 `useParams` 與 API 加載，子頁面在獲取資料後「向上推送」給父 Layout 最為直覺。Outlet Context 是 React Router 官方提供且原生支援的輕量共享方案，不需引入額外的狀態庫。
- **替代方案**：使用 React Router 的 `useMatches()` 搭配 `handle` 屬性。但這需要將非同步的 API 名稱加載邏輯移至路由的 loader 階層，這會打亂現有的 stateful loading 與 API 快取設計，侵入性過高。

### 2. Header 高度與邊框對齊設計
- **決策**：
  * 左側側邊欄頂部 Logo Header：`h-16 flex items-center border-b px-5 flex-shrink-0`
  * 右側工作區頂部 Breadcrumb Header：`h-16 flex items-center border-b px-6 flex-shrink-0 bg-zinc-950/20 backdrop-blur-md`
- **原因**：高度皆為 `h-16`，兩側底邊皆有 `border-b`，配合原本側欄與工作區交界的垂直 `border-r`，完美在雙欄頂部形成一個十字交錯的對齊格網，完全符合 [MODIFY LAYOUT 2.md](file:///c:/works/e2e-manager-ts/docs/MODIFY%20LAYOUT%202.md) 設計。

## Risks / Trade-offs

- **[Risk]** 在子頁面 API 資料尚未加載完成前，麵包屑無法顯示名稱。
  - **[Mitigation]** 子頁面在載入中狀態時，可先透過 `setBreadcrumbs` 顯示 `載入中...` 或是僅顯示專案與劇本的短 ID 作為預設佔位符，等到資料載入完後再更新為正式名稱。
- **[Risk]** 路由切換時，如果新頁面尚未觸發 `setBreadcrumbs`，可能短暫殘留上一個頁面的麵包屑。
  - **[Mitigation]** 每個子頁面的 `useEffect` 中，在 cleanup 函數（返回函數）中呼叫 `setBreadcrumbs([])` 清空麵包屑，確保路由切換時舊狀態被立即清除。
