## Context

目前 E2E 管理器前端是一個單頁應用 (SPA)，所有功能模組全部擠在單一檔案 `App.tsx` 中。在先前的重構中，我們引入了 `shadcn/ui` 控制項並將全域 HSL 主題設定為 Zinc 灰黑風格。然而，由於元件沒有拆分、邏輯與渲染高度耦合，程式碼難以維護，且在記憶體狀態控制下，使用者無法透過 URL 直接連結到特定的專案、群組或測試執行 (SSE Console)，降低了協作效率。

本設計旨在將這個巨型元件重構成具有良好結構的頁面 (Views)、佈局 (Layouts) 與自訂 Hooks，並引入 `react-router-dom` 進行 URL 與狀態的同步。

## Goals / Non-Goals

**Goals:**
- 將巨型 `App.tsx` 瘦身，使主檔案僅保留路由配置與 Provider，提升可讀性與維護性。
- 將全域狀態、API 調用與 SSE 日誌訂閱邏輯抽取為獨立、可重複使用的自訂 Hooks (`hooks/`）。
- 引入前端路由系統，實現特定專案 `/projects/:projectId`、群組 `/projects/:projectId/groups/:groupId` 與測試執行 `/runs/:runId` 的網址定位。
- 支援瀏覽器上一頁/下一頁歷史紀錄。
- 確保拆分與路由重構後，專案能無錯誤編譯與打包，且 SSE 日誌與截圖渲染功能完全正常。

**Non-Goals:**
- 本次重構不修改後端 API 與資料庫 schema。
- 不引入額外的狀態管理庫（如 Redux 或 Zustand），僅依靠 React Context 與 URL Params 共享狀態。
- 不更改既有的 HSL Zinc 主題視覺風格。

## Decisions

### 1. 路由系統規劃 (Routing Architecture)
我們選擇使用 `react-router-dom` 的 `createBrowserRouter` 和 `<RouterProvider>` 作為路由核心，宣告如下路由樹：
* `/` (`RootLayout`): 渲染共用的左側側邊欄 (`Sidebar`)，並包含全域伺服器連線狀態與 `Toaster`。右側主要區域為 `<Outlet />`。
  * `index` (`WelcomeView`): 顯示引導卡片，提示使用者選擇專案。
  * `/projects/:projectId` (`ProjectLayout`): 專案級佈局。此佈局負責加載該專案下的群組資料，並以 Context 分發。
    * `index` (`SelectGroupPrompt`): 提示選取群組。
    * `groups/:groupId` (`GroupDashboardView`): 顯示該群組下的測試劇本清單、劇本編輯/建立表單。
  * `/runs/:runId` (`SSEConsoleView`): SSE 即時日誌 Console 畫面。此頁面覆蓋右側主要工作區。

*選擇理由*：
RootLayout 保持全域 Sidebar，避免在切換專案或群組時 Sidebar 重複加載，保持側邊欄樹狀目錄的折疊狀態。當進入 `/runs/:runId` 時，Sidebar 仍保持呈現，方便使用者在執行測試時隨時瀏覽其他群組。

### 2. 狀態共享機制 (State Sharing via Router Context)
由於 `Sidebar` 與右側主要工作區的 `GroupDashboardView` 均需要訪問群組列表資料與當前選取的狀態，我們決定在 `ProjectLayout` 中使用 `useOutletContext`（React Router 內建的 Context 傳遞機制）將專案與群組樹資料傳遞給子路由：
```tsx
// ProjectLayout.tsx 示意
export default function ProjectLayout() {
  const { projectId } = useParams();
  const { groups, loadGroups } = useGroupData(projectId);
  return <Outlet context={{ groups, loadGroups }} />;
}
```
*選擇理由*：
避免了傳統的 Prop-Drilling 或是引入重量級 Redux/Zustand 狀態管理，以最原生、最輕量且與路由深度整合的方式共享狀態。

### 3. 邏輯抽取 (Custom Hooks)
我們將原先散落在 `App.tsx` 中的 API 調用與狀態維護抽取為自訂 Hooks：
* `useProjectData`：管理 `projects` 陣列、載入邏輯與專案建立。
* `useGroupData`：管理選取專案下的 `groups` 陣列、載入邏輯、新增子群組與刪除群組。
* `useTestcaseData`：管理特定群組下的 `testcases` 載入、儲存與刪除。
* `useSSEStream`：管理 EventSource 的生命週期、日誌隊列 `runLogs` 的即時寫入、圖片加載狀態與 SSE 清理。

## Risks / Trade-offs

- **[Risk] SPA 重新整理 404 錯誤** → [Mitigation] 在 Vite 開發環境下，Vite 會自動將路徑 Fallback 到 `index.html`。在後續部署時，需要確保生產環境的 Web 伺服器（如 Nginx 或 Node.js Express 伺服器）配置了 Fallback 支援，將非 API 的所有頁面請求重導向至 `index.html`。
- **[Risk] 重構期間代碼衝突與 syntax 破壞** → [Mitigation] 我們會先安裝 `react-router-dom` 庫，隨後逐步抽取 Hooks。在每個 Views 與 Layouts 模組拆分完畢前，保持 `App.tsx` 的編譯健全性，並利用 `npm run build` 做持續整合測試。
