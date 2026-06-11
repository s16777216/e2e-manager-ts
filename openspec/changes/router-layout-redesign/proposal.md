## Why

當前 `e2e-manager-ts` 系統將「專案切換」與「群組樹狀圖」常駐於左側側邊欄，導致側邊欄承載的 UI 與資料狀態過於繁重，不利於後續擴展群組嵌套與測試案例的顯示。此外，系統缺乏獨立的測試案例（Testcase）管理與編輯介面，且執行監控頁面（SSE Console）為獨立的頂層路由 `/runs/:runId`，與專案的層級關係脫鉤，無法滿足精細的劇本管理與流暢的導航體驗。

## What Changes

- **側邊欄簡化**：左側 Sidebar 簡化為僅提供「首頁 (Home)」與「專案列表 (Projects)」的入口連結。移除原有的專案切換選單與群組導航樹。
- **引入專案列表頁面 `/project`**：新增獨立的專案卡片列表，支援 Bento Grid 樣式，並提供新增專案入口。
- **引入專案詳情頁面 `/project/:projectId`**：將原先 Sidebar 的群組導航樹移入此頁面的主要區域，並將測試案例（Testcase）節點直接呈現在樹狀結構中，點選群組名稱改為「僅展開/收合」，點選測試案例跳轉至詳情頁。
- **新增全域新增按鈕**：專案詳情頁頂部提供全域 `+ <new test case>`（須選擇所屬群組）與 `+ <new group>`（可選擇父群組）按鈕。
- **引入測試案例詳情頁面 `/project/:projectId/testCase/:testCaseId`**：新增此頁面，採用分頁（Tabs）管理：
  - **Step Tab**：管理自然語言步驟列表與編輯，可動態新增步驟，並提供執行測試按鈕。
  - **History Tab**：顯示該測試案例歷史執行紀錄，點擊特定紀錄可檢視該次執行日誌。
- **重構執行監控頁路由**：將 SSE 即時監控頁面從頂層 `/runs/:runId` 移至專案子路由 `/project/:projectId/run/:runId`，點擊返回按鈕將導航回對應的測試案例詳情頁面而非瀏覽器歷史前一頁。

## Capabilities

### New Capabilities
- `testcase-management`: 提供獨立的測試案例檢視與編輯介面，以 Step Tab 編輯自然語言步驟，並在 History Tab 顯示、追蹤該測試案例的歷史執行紀錄，提供即時執行測試的入口。

### Modified Capabilities
- `e2e-web-dashboard`: 重構系統的側邊欄版面與導航拓撲。將群組與測試案例樹移出 Sidebar 並整合成專案詳細視圖；點選群組改為僅展開/收合。重新定義專案、群組、測試案例與執行日誌的層級與路由路徑。

## Impact

- **前端路由 (`frontend/src/routes.tsx`)**：路由定義將被重新設計，廢除舊路由 `/projects/:projectId` 與 `/runs/:runId`。
- **前端視圖與 Layout**：`RootLayout` 將被重構；廢棄 `GroupDashboardView` 與 `SelectGroupPrompt`；新增 `ProjectsView`、`ProjectDetailView` 與 `TestCaseDetailView`。
- **前端元件 (`GroupTreeNode.tsx`)**：樹狀元件需要支援渲染測試案例子節點，並調整點擊行為。
- **後端 API 服務**：
  - `GET /testcases/:id` 需載入 `runs` 關係。
  - `GET /runs/:runId` 需在回傳的 JSON 中加入 `testcaseId`。
