## 1. 側邊欄與 Layout 佈局調整

- [x] 1.1 修改 `frontend/src/layouts/RootLayout.tsx`，引入 `useLocation` 與 `Link`，並在 `<main>` 元素上還原 `flex-1 flex flex-col min-w-0 bg-background relative` 類別，防止畫面與 Sidebar 重疊。
- [x] 1.2 在 `RootLayout.tsx` 的 `<main>` 最頂端，建立一個帶有 border-b 的 Flex Row 容器，將 `<SidebarTrigger />` 與 `<Topbar />` 排在同一行，解決觸發器按鈕遮擋問題。

## 2. 導航選單項目實作

- [x] 2.1 在 `RootLayout.tsx` 中的 `<SidebarContent>` 底下，使用 `<SidebarMenu>`、`<SidebarMenuItem>`、`<SidebarMenuButton>` 以及 `<Link>` 實作「首頁 (/)」、「專案列表 (/project)」、「執行紀錄 (/tasks)」的導航選項。
- [x] 2.2 為各導航按鈕綁定 `isActive` 啟動點亮狀態判定，在使用者所在路由匹配時點亮該選項。

## 3. 編譯與驗證

- [x] 3.1 執行 `npm run build`，確保專案無 TypeScript 或 Vite 編譯錯誤。
- [x] 3.2 於瀏覽器中點擊 `SidebarTrigger` 確認側邊欄可以流暢收合，且主要工作區會自適應縮展而不發生任何遮擋。
