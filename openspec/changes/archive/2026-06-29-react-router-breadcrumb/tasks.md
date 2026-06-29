## 1. 地基建設（型別與 Loader 模組）

- [x] 1.1 建立 `frontend/src/types/breadcrumb.ts`，定義 `Crumb`（含 `label`、`to?`、`icon?: LucideIcon`）、`RouteHandle`（含 `crumb: (data: unknown) => Crumb[]`）與 `isRouteHandle(handle: unknown): handle is RouteHandle` type guard。
- [x] 1.2 建立 `frontend/src/lib/loaders.ts`，實作以下 loader 函數（均 try-catch，失敗回傳 `null`）：
  - `projectLoader({ params })` → 呼叫 `api.getProject(params.projectId)`（若 api 無單筆 endpoint，改用 `api.getProjects()` 並 find）
  - `projectAndTestcaseLoader({ params })` → 平行 fetch project + `api.getTestcaseDetail(params.testcaseId)`，回傳 `{ project, testcase }`
  - `projectAndTaskLoader({ params })` → 平行 fetch project + `api.getTask(params.taskId)`，回傳 `{ project, task }`

## 2. 路由層重構（routes.tsx）

- [x] 2.1 import `RouteHandle`、`Crumb` 與所有 loader 函數；為每個路由加入 `handle` 物件，使用 `satisfies RouteHandle` 型別驗證。靜態路由清單：`/project`、`/project/new`、`/tasks`、`/settings`。
- [x] 2.2 為動態路由加入 `loader` 與 `handle.crumb(data)`，涵蓋：
  - `/project/:projectId` — `loader: projectLoader`，crumb: `[專案管理] > [p?.name ?? "..."]`
  - `/project/:projectId/edit` — `loader: projectLoader`，crumb: `[專案管理] > [p?.name] > [編輯]`
  - `/project/:projectId/testCase/:testCaseId` — `loader: projectAndTestcaseLoader`，crumb: `[專案管理] > [p?.name] > [tc?.name]`
  - `/project/:projectId/run/:runId` — `loader: projectLoader`，crumb: `[專案管理] > [p?.name] > [執行 #runId前8碼]`（β-2）
  - `/project/:projectId/tasks/:taskId` — `loader: projectAndTaskLoader`，crumb: `[專案管理] > [p?.name] > [批次 #taskId前8碼]`

## 3. Layout 層重構

- [x] 3.1 重構 `RootLayout.tsx`：移除 `useState<BreadcrumbItem[]>`；改以 `useMatches()` + `isRouteHandle()` 派生 `breadcrumbs`；`<Outlet>` 移除 `context` prop；移除 `BreadcrumbItem` export。
- [x] 3.2 重構 `Topbar.tsx`：移除 `breadcrumbs` prop；改在元件內部呼叫 `useMatches()` + `isRouteHandle()` 自行計算麵包屑；支援渲染 `Crumb.icon`（若存在）。

## 4. View 清理（逐一移除樣板）

- [x] 4.1 清理 `ProjectsView.tsx`：移除 `interface BreadcrumbItemType`、`OutletContextType`、`useOutletContext`、`setBreadcrumbs` 的 `useEffect`。
- [x] 4.2 清理 `ProjectCreateView.tsx`（同上）。
- [x] 4.3 清理 `ProjectEditView.tsx`；確認 loader 已提供 project 資料後，移除麵包屑專用的 `useProjectData()` 呼叫（保留操作性邏輯）。
- [x] 4.4 清理 `ProjectDetailView.tsx`；以 `useLoaderData() as Project | null` 取代麵包屑用的 `useProjectData()` project 查找（保留 `useGroupData()` 等操作性 hook）。
- [x] 4.5 清理 `TestCaseDetailView.tsx`；以 `useLoaderData() as { project, testcase } | null` 取代麵包屑用的 project 查找與 testcase fetch。
- [x] 4.6 清理 `SSEConsoleView.tsx`：移除麵包屑樣板與 `useProjectData()` 的麵包屑用呼叫；以 `useLoaderData() as Project | null` 取得 project name。
- [x] 4.7 清理 `TaskDetailView.tsx`；以 `useLoaderData() as { project, task } | null` 取代麵包屑用的 project 查找與 task fetch。
- [x] 4.8 清理 `HistoryView.tsx`（移除樣板）。
- [x] 4.9 清理 `SettingsView.tsx`（移除樣板）。

## 5. 驗證與收尾

- [x] 5.1 執行 `npm run build`（frontend），確認 TypeScript 編譯通過，無型別錯誤。
- [x] 5.2 手動導航各路由，確認麵包屑正確顯示（靜態 label 正確、動態 label 顯示真實名稱）。
- [x] 5.3 確認各 View 的操作性功能（建立、編輯、執行、刪除）正常運作，未被重構影響。
- [x] 5.4 確認 `frontend/src/types/breadcrumb.ts` 為唯一 `Crumb` 型別定義來源；grep 確認舊的 `interface BreadcrumbItemType`、`interface BreadcrumbItem`（View 中）已全部移除。

