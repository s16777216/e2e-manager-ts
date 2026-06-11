## Why

目前系統中各個頁面（專案詳情、劇本詳情、監控控制台）都是在子視圖內自行渲染各自的麵包屑（Breadcrumb）與頂部 Header。這導致了兩大問題：第一，在跳轉不同子路由時，頂部 Header 會因為各自排版結構的些微差異而產生抖動感；第二，全域側邊欄的系統 LOGO Header 未能與右側工作區的頂部 Header 保持水平切齊。

本變更將將 Breadcrumb 提到全域 `RootLayout` 的頂部 Header 中，並以固定的 Header 高度（如 64px）與左側 Logo Header 保持水平線切齊，建立嚴謹、統一對齊的 Bento IDE 版面格網。

## What Changes

- **全域麵包屑 Header 統一化**：在 `RootLayout.tsx` 中建立一個常駐右側頂部的 Header，與左側 Logo Header 垂直對齊、高度一致，並統一在此渲染 `Breadcrumb`。
- **動態狀態傳遞**：在 `RootLayout` 中以 Context 機制向 `<Outlet />` 傳遞麵包屑更新的 setter。子視圖載入資料後，動態更新麵包屑內容。
- **子視圖 Header 簡化**：移除 `ProjectDetailView`、`TestCaseDetailView` 與 `SSEConsoleView` 中各自重複撰寫的 `Breadcrumb` Header 部分，降低組件重疊度並避免切換路由時的抖動。

## Capabilities

### New Capabilities
- 無

### Modified Capabilities
- `e2e-web-dashboard`: 將麵包屑導航從子頁面視圖上移至全域 `RootLayout` 中，並固定於右側主要工作區頂部 Header 區塊。

## Impact

- **佈局與路由**：`frontend/src/layouts/RootLayout.tsx`、`frontend/src/routes.tsx`
- **頁面視圖**：`frontend/src/views/ProjectDetailView.tsx`、`frontend/src/views/TestCaseDetailView.tsx`、`frontend/src/views/SSEConsoleView.tsx`
