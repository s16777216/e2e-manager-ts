## Why

系統目前僅提供後端 API 與 CLI 運作模式，缺乏直覺的圖形化介面供使用者編輯測試劇本、管理專案群組，以及在測試執行時實時觀看 AI 的 Tool Call 日誌、截圖與最終的視覺斷言判定。為了在同一個儲存庫中實作前端，我們需要避免前後端編譯設定與套件依賴發生衝突，因此需要將整個系統重構成雙 Workspace 的 Monorepo 結構，並建立基於 React + TS + shadcn/ui 的 Web 儀表板。

## What Changes

- **Monorepo Workspace 重構 [BREAKING]**：將專案原有根目錄的後端原始碼（`src/`, `tests/`）及 TypeScript 設定移入獨立的 `backend/` 目錄下。根目錄改為僅聲明 `workspaces: ["backend", "frontend"]` 的 Workspace Root。
- **React 網頁儀表板實作**：於 `frontend/` 初始化 React + TS + Tailwind + shadcn/ui 前端專案。
- **RESTful APIs 串接與 Tree View 導航**：在前端實作專案切換、樹狀群組管理（CRUD）與劇本編輯介面。
- **SSE 實時測試日誌與畫面監控**：前端透過訂閱後端 SSE 連線（`/api/runs/:runId/stream`），即時以時間軸（Timeline）渲染 AI 執行的 Tool 歷程日誌，並即時渲染每個步驟完成時的網頁截圖與最終結果。
- **後端靜態文件託管**：調整後端服務，在生產環境下將前端打包輸出（`frontend/dist/`）以靜態目錄提供網頁存取，實現單一 process 部署。

## Capabilities

### New Capabilities
- `e2e-web-dashboard`: 實作基於網頁的 E2E 測試管理儀表板，支援專案與樹狀群組編輯、自然語言劇本配置，以及 SSE 實時測試狀態/截圖與視覺斷言結果監控。

### Modified Capabilities
<!-- 本變更為新增前端功能，未修改既有後端規格。 -->

## Impact

- **專案結構影響**：
  - 原根目錄的後端程式碼移入 `backend/`。
  - 新增 `frontend/` 前端目錄。
  - 根目錄 `package.json` 重寫為 workspaces 控制，並引入 `concurrently` 用於開發時一鍵啟動雙端服務。
- **後端啟動影響**：
  - `backend/src/server.ts` 引入 `serveStatic` 託管前端編譯資源。
