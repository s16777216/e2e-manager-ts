## Context

前端目前採用命令式麵包屑推送模式：`RootLayout` 持有 `useState<BreadcrumbItem[]>`，透過 `Outlet context` 將 `setBreadcrumbs` 傳遞給各子 View，每個 View 在 `useEffect` 中手動推送麵包屑並在卸載時清空。這套模式運作正常，但隨著 View 數量增加，造成了型別碎片化（11 處重複定義）、大量樣板程式碼，以及麵包屑設定與路由結構的完全分離。

React Router 7（已安裝，`^7.17.0`）原生支援 `handle`、`useMatches()`、`loader` 機制，可以將麵包屑設定宣告在路由定義中，由 Layout 自動派生，徹底消除 View 的感知。

## Goals / Non-Goals

**Goals:**
- 統一 `Crumb` 與 `RouteHandle` 型別到單一檔案。
- 以 `useMatches()` 取代 `useState + Outlet context` 的推送模式。
- 靜態路由麵包屑直接宣告於 `handle.crumb`；動態名稱（project name、testcase name 等）透過 `loader` 預取。
- `satisfies RouteHandle` 確保型別安全，取代 `as` 轉型。
- 保留各 View 的內部 skeleton（View 自行管理操作性資料的 loading 狀態）。

**Non-Goals:**
- 不引入 React Query / SWR / 任何新依賴。
- 不重構各 View 的操作性資料 fetch（僅移除麵包屑相關的資料 fetch）。
- 不修改後端 API。
- SSEConsoleView 的 testcase 名稱不在 loader 中預取（採用 β-2：loader 只取 project，麵包屑省略 testcase 段）。

## Decisions

### 1. 以 `useMatches()` 替代 `Outlet context`（宣告式 vs 命令式）

- **決策**：`RootLayout` 改用 `useMatches()` 讀取所有匹配路由的 `handle.crumb(m.data)` 並 flatMap 成麵包屑陣列，不再使用 `useState` 或 `Outlet context`。
- **理由**：資料由路由宣告派生，而非由 View 推送，符合單向資料流原則。當 URL 改變時麵包屑自動更新，不存在「卸載時忘記清空」的 bug 隱患。
- **備選方案**：React Context + custom hook（`useBreadcrumb`）——能消除型別重複，但不能消除 `useEffect` 樣板，且麵包屑仍與路由分離。

### 2. `satisfies RouteHandle` 取代 `as` 轉型

- **決策**：每個路由的 `handle` 物件使用 `satisfies RouteHandle` 確保靜態型別正確；`RootLayout` 以 `isRouteHandle()` type guard 過濾，不用 `as`。
- **理由**：`satisfies` 在編譯期驗證，不會在執行時靜默失敗；`isRouteHandle` 讓過濾邏輯有明確的型別收窄。
- **備選方案**：全用 `as RouteHandle`——簡單但不安全，容易在新增路由時漏掉 `crumb`。

### 3. `Crumb.icon` 設計為可選（漸進增強）

- **決策**：`Crumb` 新增 `icon?: LucideIcon` 欄位，`Topbar` 在 `icon` 存在時渲染小圖示。初始重構不強制要求各路由填寫 icon，未來新增路由時可自由補充。
- **理由**：不破壞現有麵包屑渲染，同時為未來的豐富視覺提供擴充點。

### 4. SSEConsoleView loader 只取 project（β-2）

- **決策**：`/project/:projectId/run/:runId` 的 loader 只 fetch project，麵包屑格式為 `[專案管理] > [project.name] > [執行 #runId前8碼]`，省略 testcase 段。
- **理由**：SSEConsoleView 是監控頁，用戶由 projectDetail 點擊進入，上下文清楚；避免串接兩次 fetch（run → testcaseId → testcase）增加跳轉延遲。
- **備選方案**：β-1（串接 fetch）——麵包屑更完整，但 loader 複雜度增加且 testcaseId 來自 SSE 狀態，loader 時期不一定能取得。

### 5. loader 集中至 `src/lib/loaders.ts`

- **決策**：所有 loader 函數統一放在 `loaders.ts`，`routes.tsx` 只 import 使用，不在路由定義中 inline 撰寫 fetch 邏輯。
- **理由**：關注點分離，loader 函數可獨立測試；避免 `routes.tsx` 膨脹。

## Risks / Trade-offs

- **[風險]** loader 中的 fetch 失敗（API 離線）會讓路由導航失敗，使用者停在前一頁。
  - **[對策]** 在 loader 中 try-catch，失敗時回傳 `null` 而非 throw，讓麵包屑顯示佔位符（"載入中..."），頁面仍能正常渲染。
- **[風險]** 各 View 移除 `useProjectData` 中麵包屑專用的 project fetch 後，View 自身的操作性 fetch（群組、測試案例等）若也依賴同一 hook，需要確認未被誤刪。
  - **[對策]** 各 View 重構時逐一確認：只移除 `setBreadcrumbs` 相關程式碼，`useProjectData`/`useGroupData` 等操作性 hook 保留。
- **[取捨]** loader 會在頁面跳轉前執行 fetch，對於網路較慢的環境，navigating 狀態會稍長。可用 `useNavigation()` 在 Topbar 顯示進度指示，但本次重構暫不實作。

## Migration Plan

1. 建立 `types/breadcrumb.ts` 與 `lib/loaders.ts`（無破壞性，純新增）。
2. 重構 `routes.tsx`：加入 `handle` + `loader`（路由物件異動，不影響 URL 結構）。
3. 重構 `RootLayout.tsx` + `Topbar.tsx`（Layout 層，一次到位）。
4. 逐一重構各 View，移除樣板程式碼（可逐 View 提交，不互相依賴）。
5. 全部完成後，刪除各 View 中已無人使用的 `interface BreadcrumbItemType` / `OutletContextType`。
