## Why

目前專案正在將左側側邊欄重構為 Shadcn Sidebar。在初步嘗試中，發現側邊欄內容（選單）呈現空白，且由於缺乏合適的 Tailwind 佈局樣式與 class 編譯，導致主畫面區塊與側邊欄發生重疊，且 `SidebarTrigger` 按鈕被側邊欄頂部 Header 遮擋無法點擊，需要將其完整修正並與頂部麵包屑 Header (Topbar) 進行完美整合。

## What Changes

- **導航選單實作**：在 Shadcn Sidebar 中使用 `SidebarMenu`、`SidebarMenuItem` 與 `SidebarMenuButton` 重建「首頁」、「專案列表」與「執行紀錄」的導航按鈕，並配合 `react-router-dom` 的 `<Link>` 元件。
- **主工作區布局修正**：為 `<main>` 元素還原 `flex-1 flex flex-col min-w-0 bg-background relative` 類別，確保其與 `<Sidebar>` 能利用 Flex 佈局橫向對齊且不發生重疊。
- **側邊欄收合按鈕整合**：將 `SidebarTrigger` 置於主工作區頂部的 Header 中，與 `Topbar` (麵包屑) 水平排列，解決遮擋問題，提供極致的操作體驗。

## Capabilities

### New Capabilities
<!-- 無新增系統大規格功能 -->

### Modified Capabilities
- `e2e-web-dashboard`: 調整 Layout 佈局以正確渲染 Shadcn Sidebar，提供無遮擋的收合按鈕與麵包屑導航。

## Impact

- **前端**：`RootLayout.tsx` (佈局修正與選單內容整合)。
