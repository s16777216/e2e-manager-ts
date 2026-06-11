## Why

目前 E2E 管理器的前端 [App.tsx](file:///c:/works/e2e-manager-ts/frontend/src/App.tsx) 程式碼已增長至 1100 多行，且將全域狀態、API 調用、輔助函數與多個主要視圖（如側邊欄、劇本編輯區、SSE 即時 Console、彈窗對話框）硬編碼於單一巨型元件中。這導致程式碼維護成本極高。此外，專案目前採用記憶體狀態控制視圖切換，使網頁 URL 永遠固定為根路徑，使用者無法分享特定測試執行（Runs）或專案的 URL 連結給團隊成員，且不支援瀏覽器的「上一頁/下一頁」歷史紀錄導航。

## What Changes

- **引入 React Router**：在前端安裝 `react-router-dom` 庫，建置以網址路徑（URL Path）為導航核心的單頁應用（SPA）路由系統。
- **元件化拆分**：
  - 將側邊欄（Sidebar/Logo/專案 Select/群組樹）、劇本清單/表單（Dashboard）與日誌 SSE 即時監控/報告（Console）拆分為獨立的 Layouts 與 Views 元件。
  - 將樹狀節點遞迴渲染與新增/刪除專案的彈窗獨立成 custom 元件。
- **狀態解耦與 Hooks 抽取**：將 API 請求、群組樹建構及 SSE EventSource 訂閱的業務邏輯，從 UI 渲染層抽離並封裝為自訂 Hooks (`useProjectData`、`useGroupData`、`useTestcaseData`、`useSSEStream`）。
- **URL 狀態同步**：
  - 專案（`:projectId`）與選取的群組（`:groupId`）改由路由參數控制。
  - 測試執行監控改由 `/runs/:runId` 路由渲染，支援直接複製網址分享即時日誌與截圖報告，並支援瀏覽器上一頁/下一頁導航。

## Capabilities

### New Capabilities

- 無

### Modified Capabilities

- `e2e-web-dashboard`: 修改儀表板導航、頁面切換與專案/群組載入機制，以 React Router 作為底層路由導航機制，支援 URL 狀態同步與分享。

## Impact

- **前端依賴**：新增 `react-router-dom` 庫。
- **前端原始碼**：將重新組織 [App.tsx](file:///c:/works/e2e-manager-ts/frontend/src/App.tsx) 的代碼，分散至 `frontend/src/layouts`、`frontend/src/views`、`frontend/src/components/custom` 與 `frontend/src/hooks` 目錄下。
- **後端與打包**：需要確保 Vite 與部署伺服器支援 SPA 路由回退（SPA routing fallback），防止重新整理時出現 404。
