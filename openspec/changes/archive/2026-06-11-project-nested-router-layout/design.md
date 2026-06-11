## Context

當前 `/project/:projectId`、`/project/:projectId/testCase/:testCaseId` 與 `/project/:projectId/run/:runId` 路由在前端 `routes.tsx` 中為平鋪的兄弟關係。切換測試案例時，整個 `ProjectDetailView` 會被重新載入，導致左側樹狀目錄的展開狀態遺失、重複請求 API，並造成頁面閃爍。
本設計將藉由 React Router 的巢狀路由（Nested Routing）機制，使 `ProjectDetailView` 作為常駐的父容器，並使用 `<Outlet />` 來渲染右側的子視圖，以達成狀態維持與流暢的 IDE 介面體驗。

## Goals / Non-Goals

**Goals:**
- **巢狀路由結構**：重構 `routes.tsx`，使測試案例詳情及 Console 即時日誌頁面作為專案詳細頁面的子路由。
- **狀態維持與摺疊拉伸**：使用 `shadcn/ui` Sidebar 常駐顯示左側劇本導航樹。支援鍵盤快捷鍵 `Ctrl+B` 或按鈕點擊一鍵摺疊/展開，並支援滑鼠拖曳拉伸調整寬度。
- **UI 按鈕重整**：
  - 「建立群組」：移至左側導航樹面板的 Header 右側（以 icon 按鈕呈現）。
  - 「建立測試案例」：移至右側引導頁面（未選取測試案例時展示）。
  - 「編輯劇本」與「執行測試」：從 topbar 移入 `TestCaseDetailView.tsx` 右側面板頂端。
- **預設引導頁**：新增 `SelectGroupPrompt.tsx` 元件，做為專案的首頁（index 路由），提供操作導引與新增測試案例的入口。
- **動態麵包屑 (Breadcrumb)**：引進 `shadcn/ui` 的 Breadcrumb 元件，在 Topbar 依據目前的 `projectId`、`testCaseId` 及 `runId` 進行動態路徑與連結組裝。

**Non-Goals:**
- 不在此變更中實作步驟日誌的 Accordion 分群展示（此優化留待方案 A 的第二階段 Change 中處理）。

## Decisions

### 1. 巢狀路由與 Outlet 配置
在 `frontend/src/routes.tsx` 中進行重組，使得 `/project/:projectId` 成為父路由，並在 `ProjectDetailView.tsx` 中使用 `react-router-dom` 的 `<Outlet />` 代替原本寫死的「專案主控台面板」。
其路由配置如下：
```typescript
{
  path: "project/:projectId",
  element: <ProjectDetailView />,
  children: [
    {
      index: true,
      element: <SelectGroupPrompt />
    },
    {
      path: "testCase/:testCaseId",
      element: <TestCaseDetailView />
    },
    {
      path: "run/:runId",
      element: <SSEConsoleView />
    }
  ]
}
```

### 2. 預設引導元件 `SelectGroupPrompt.tsx` 的引入
當用戶造訪 `/project/:projectId` 而尚未選取測試案例時，右側 Outlet 將預設渲染 `SelectGroupPrompt` 元件：
- 介面展示：簡約明瞭的 Bento 卡片導引。
- 按鈕整合：「建立測試案例」按鈕置於此頁面。
- 連動行為：
  - 若左側樹中已選取群組（`selectedGroupId` 有值），則「建立測試案例」按鈕為可用狀態，且預選該群組。
  - 若未選取群組，則提示使用者「請先在左側選取一個群組，再建立測試案例」。

### 3. 按鈕搬移與父子組件狀態連動
- **「建立群組」按鈕**：
  - 放置於左側「劇本樹狀導航」面板的 Header 右側，改為一組 `Plus` Icon 按鈕。
  - 點擊時，若 `selectedGroupId` 存在，則該群組將作為 `NewSubgroupDialog` 中預設的 parentId（建立子群組）；若無選取，則預設為 `null`（建立根群組）。
- **「編輯劇本」與「執行測試」按鈕**：
  - 原本專案的 Layout 頂部大 Topbar 將只保留返回首頁或切換專案的極簡內容。
  - 具體動作按鈕移入 `TestCaseDetailView.tsx` 自身的 header（此 header 位於右側 Outlet 內部的頂端），使其操作僅局限於該劇本的上下文中。

### 4. `shadcn/ui` Sidebar 與麵包屑整合 (Sidebar & Breadcrumb Layout)
- **側邊欄配置**：
  - 引進 `SidebarProvider` 與 `Sidebar` 元件包裹整個 `ProjectDetailView` 的版面。
  - 將「劇本樹狀導航」放置於 `SidebarContent` 中。
  - 配置 `collapsible="icon"` 模式，當側邊欄摺疊時縮小為窄列，或配合 `collapsible="offcanvas"` 完全隱藏。
  - 在側邊欄末尾加入 `<SidebarRail />` 以直接支援滑鼠拖曳調整目錄樹寬度。
- **麵包屑與 Trigger 整合**：
  - Topbar 最左側放置 `<SidebarTrigger />` 按鈕，使用戶可一鍵開合側邊欄（並支援 `Ctrl+B` 快捷鍵）。
  - Topbar 緊接著渲染 `<Breadcrumb />`，動態顯示 `專案 / 專案名稱 / 劇本名稱 / 執行紀錄` 的層級關係與連結。
  - 劇本與執行紀錄名稱透過 `useParams()` 與讀取後的扁平群組資料進行前端查找。
