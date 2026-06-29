## ADDED Requirements

### Requirement: Nest-declared routing breadcrumbs
系統 SHALL 透過路由層級的嵌套定義與 `useMatches()` 動態衍生全域麵包屑。各路由節點的 `handle.crumb` SHALL 僅宣告該節點自身的麵包屑 Segments，由 Layout 元件之 `flatMap` 進行路徑鏈的自動拼裝與渲染。

#### Scenario: Dynamic segment nesting and rendering
- **WHEN** 用戶導航至 `/project/:projectId/testCase/:testCaseId` 且 loader 成功取得資料
- **THEN** Topbar SHALL 自動顯示由 `matches.flatMap` 拼接後的 `[專案管理] > [專案名稱] > [案例名稱]`，且點擊「專案名稱」能跳轉至對應專案主頁

### Requirement: Route loader data sharing
系統在巢狀路由架構下，SHALL 支援子路由 View 直接讀取並共享父級路由 loader 的預取資料，以避免向後端重複 Fetch 相同的專案資訊。

#### Scenario: Access father route loader data inTestCaseView
- **WHEN** 用戶訪問 `/project/:projectId/testCase/:testCaseId`
- **THEN** 案例詳情元件 SHALL 透過 `useRouteLoaderData("project-root")` 共享取得父級專案名稱，自身僅需 Fetch 測試案例本身的資料
