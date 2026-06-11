## 1. 移除 Sidebar 元件與重構 Layout

- [x] 1.1 修改 `frontend/src/views/ProjectDetailView.tsx`，移除所有 `@/components/ui/sidebar` 相關 imports 及組件。
- [x] 1.2 重構 `ProjectDetailView.tsx` 的 return UI 結構，使左側「劇本樹狀導航」改回普通的 `w-80` 或 `w-96` 寬度之 Bento 風格 `div` 容器，並與右側 Outlet 在同一 Flex 容器中並排呈現，修復遮擋問題。
- [x] 1.3 調整右側工作區的頂部極簡 Header，移除 `SidebarTrigger` 與垂直的 `Separator`，僅保留 `Breadcrumb` 麵包屑路徑。

## 2. 編譯、Lint 與 E2E 驗證

- [x] 2.1 執行 `npx tsc --noEmit --project tsconfig.app.json` 與 `npm run lint`，確保無任何編譯與 Lint 錯誤。
- [x] 2.2 於瀏覽器執行 manual E2E 測試，驗證全域側邊欄與劇本導航樹能並排完美呈現、無任何遮擋，且切換路由與麵包屑跳轉正常。
