## Context

專案目前架構為單一後端服務。為了加入 React + TS + shadcn/ui 的 Web 儀表板，並隔離前後端依賴與 TypeScript 配置，我們規劃將其重構為基於 npm Workspaces 的 Monorepo 架構，包含一個 `backend/` 目錄與一個 `frontend/` 目錄。

## Goals / Non-Goals

**Goals:**
- **Monorepo 重構**：在根目錄配置 npm Workspaces，將後端完整代碼（`src/`, `tests/`, `tsconfig*`）移入 `backend/`。
- **全域啟動腳本**：根目錄配置 `concurrently` 提供 `npm run dev` 一鍵啟動前後端。
- **前端基礎架構**：於 `frontend/` 下初始化 React + Vite + TS，配置 Tailwind CSS 與 shadcn/ui。
- **核心 UI 畫面**：
  - **側邊欄 (Sidebar)**：專案切換與 Group 樹狀導航（支援折疊、展開與編輯）。
  - **劇本編輯區**：自然語言 Steps 與預期結果編輯（動態增減 Input）。
  - **實時監控面板**：點選執行後訂閱 SSE 串流，滾動顯示日誌，當前步驟完成時預覽截圖，測試結束時展示最終視覺斷言 PASS/FAIL。
- **部署優化**：後端 `backend/src/server.ts` 提供靜態檔案託管，支援單一 node process 部署。

**Non-Goals:**
- 不變更資料庫 Table Schema 或實體（Entities）關聯。
- 不修改既有的後端 API 規格。

## Decisions

### 1. 採用 npm Workspaces 作為 Monorepo 管理器
- **決定**：根目錄 `package.json` 配置 `workspaces: ["backend", "frontend"]`。
- **理由**：原生支援，無須安裝額外的 monorepo 工具（如 lerna），能自動在全域 `node_modules` 建立子專案軟連結，開發體驗最平滑。

### 2. 前端開發代理 (Proxy)
- **決定**：在 `frontend/vite.config.ts` 的 `server.proxy` 配置將 `/api` 代理至 `http://localhost:3001`，且確保 SSE 連線不受 buffer 影響。
- **理由**：解決開發環境的跨域問題，且讓前端代碼可以直接請求相對路徑 `/api`。

### 3. 生產環境 Hono 靜態託管
- **決定**：在後端 `backend/src/server.ts` 的路由註冊最後，添加：
  ```typescript
  import { serveStatic } from "@hono/node-server/serve-static";
  app.use("/*", serveStatic({ root: "../frontend/dist" }));
  ```
- **理由**：使前端打包產物在部署時能直接由 Hono 伺服器託管，免去獨立部署 Web 伺服器的成本。

### 4. 前後端型別共用 (Type Sharing)
- **決定**：前端直接以相依套件路徑 `import type { TestRun } from "backend/src/entities/TestRun.js";` 引用後端的類型。
- **理由**：利用 Workspaces 優勢，達成前端與後端型別的 100% 同步，避免 API 修改時介面打架。

## Risks / Trade-offs

- **[Risk] 後端目錄搬遷後，CLI 執行路徑與 tests 損壞** → **[Mitigation]**：搬遷後，需對 `backend/package.json` 中的路徑（如 `tsx src/main.ts`）和測試路徑進行相應微調，並第一時間執行 `npm run build` 和 `npm run test` 以保證後端依然 100% 通過。
- **[Risk] 靜態服務 fallback 攔截了 `/api` 的 404 請求** → **[Mitigation]**：在掛載 `serveStatic` 前明確聲明 API 路由器，讓 `/api/*` 路由未匹配時能正確回傳 API 404 JSON，而非靜態的 `index.html`。
