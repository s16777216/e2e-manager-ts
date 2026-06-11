## Why

當前專案詳細頁面與測試案例詳情、執行 Console 使用的是「平鋪的」兄弟路由（Sibling Routes）。這導致在切換測試案例或進入 Console 時，整個專案詳細頁（包括左側的劇本樹狀導航）都會被完全解除安裝（unmount）並重新載入，造成畫面閃爍以及樹狀節點展開狀態遺失。
此外，現有的操作按鈕（如「建立群組」、「建立測試案例」）置於頂部導航列（Topbar），排版較為零散且不符合「在特定脈絡下操作」的直覺。

巢狀路由（Nested Router）的佈局重構能將左側樹狀導航常駐保留於父路由中，使狀態得以維持，並透過將按鈕移入主內容區域（如將「建立群組」放入樹狀 Header，將「建立測試案例」放入引導頁面），提供更為平滑且流暢認知的 IDE 式操作體驗。

## What Changes

- **Nest Router Layout 改造**：將 `/project/:projectId/testCase/:testCaseId` 和 `/project/:projectId/run/:runId` 調整為 `/project/:projectId` 的子路由（Nested Children）。
- **Project Detail View 改造**：修改 `ProjectDetailView.tsx`，移除右側佔用 2/3 寬度的預設主控台面板，改為渲染 `<Outlet />`。左側的樹狀導航與專案基本資訊在此父路由中常駐，避免路由切換時 unmount。
- **`shadcn/ui` Sidebar 側邊欄重構**：引進 `shadcn/ui` 的 `Sidebar` 元件（含 `SidebarProvider`、`Sidebar`、`SidebarContent`、`SidebarRail`），做為左側劇本樹狀導航的載體。支援以 `SidebarTrigger` 按鈕或 `Ctrl+B` 快捷鍵一鍵完全折疊/展開側邊欄，折疊時右側主內容區平滑延展至 100% 寬度，並支援以 `SidebarRail` 進行滑鼠拖曳調整寬度。
- **動態 Breadcrumb 導航**：在常駐的 Topbar 中引進 `shadcn/ui` 的 Breadcrumb 元件，依據目前的子路由狀態（專案、劇本、或執行記錄）動態顯示層級麵包屑路徑，並提供點擊返回的連結。
- **預設引導頁**：當訪問 `/project/:projectId`（未選取任何測試案例）時，右側 `<Outlet />` 預設渲染一個提示頁面（`SelectGroupPrompt.tsx`），引導使用者選取劇本。
- **按鈕位置重置**：
  - 「建立群組」：從頂部 Topbar 移入左側「劇本樹狀導航」面板的 Header 右側。
  - 「建立測試案例」：從頂部 Topbar 移入選定群組後的右側引導頁面（未選取測試案例時的引導區）。
  - 「編輯劇本」與「執行測試」：從 `TestCaseDetailView` 的 Topbar 移入其右側主內容面板內。

## Capabilities

### New Capabilities
- 無

### Modified Capabilities
- `e2e-web-dashboard`: 調整專案詳細頁面中的群組與測試案例導航佈局，將路由重構為巢狀結構並重新安置相關操作按鈕。

## Impact

- **前端路由與元件**：`frontend/src/routes.tsx`、新增 `frontend/src/components/ui/breadcrumb.tsx`、新增 `frontend/src/components/ui/sidebar.tsx` 及其依賴元件（如 `sheet.tsx`, `tooltip.tsx` 等）
- **前端視圖與版面**：`frontend/src/views/ProjectDetailView.tsx`、`frontend/src/views/TestCaseDetailView.tsx`、`frontend/src/views/SSEConsoleView.tsx`
- **前端導航與元件**：`frontend/src/components/custom/GroupTreeNode.tsx`
