## Context

目前 AI E2E 測試管理器專案是一個 TypeScript Monorepo，包含 `frontend`（React / Vite）與 `backend`（Hono / TypeORM / Playwright / LangGraph）。後端的 [server.ts](file:///c:/works/e2e-manager-ts/backend/src/server.ts) 已經內建了對前端 `frontend/dist` 靜態資源的託管（透過 `serveStatic` 支援 SPA 路由重寫），並且在同一個進程內運行任務佇列 Worker。

為了將此專案容器化部署，我們需要克服以下幾個挑戰：
1. **瀏覽器環境**：Playwright 在 Docker 內執行時，需要完整的瀏覽器二進位檔與對應的系統依賴共享庫。
2. **同源部署需求**：為避免跨域（CORS）問題，前端發起的 API 與 SSE 串流請求必須是同源的。
3. **Playwright Channel 問題**：後端 [browser.ts](file:///c:/works/e2e-manager-ts/backend/src/browser.ts) 目前寫死了 `channel: "chrome"`。

## Goals / Non-Goals

**Goals:**
- 提供開箱即用、一鍵啟動的 Docker 部署配置（利用 Docker Compose）。
- 實作前端與 API 的完全同源部署，僅對外暴露單一連接埠（3001）。
- 使用微軟官方 Playwright 執行環境映像檔，保證 E2E 測試瀏覽器在容器內正常啟動。
- 保證 PostgreSQL 資料庫數據的持久化，在容器重啟或重建時數據不遺失。

**Non-Goals:**
- 不將前端靜態檔案託管、API 服務與 E2E Worker 拆分成三個獨立容器（因現有代碼結構以 Hono 做為整合入口，拆分會顯著增加網路與環境配置複雜度）。
- 不在此變更中配置雲端 CI/CD 發佈流程。

## Decisions

### 1. 使用「app + db」雙容器架構
- **決策內容**：使用單一的 `app` 容器運行 Hono 伺服器（同時提供 API、Worker 與前端託管），並配對一個 `db` 容器運行 PostgreSQL。
- **決策理由**：因為 Hono 在生產環境下可以直接讀取並 serve 編譯後的前端靜態檔案，所以整個應用程式僅需一個入口 Port (3001) 即可運作。這天生就是同源的，無須額外在 Web 伺服器（如 Nginx）中設定反向代理與跨域 headers。
- **替代方案**：將前端部署在 Nginx 容器，後端 API 部署在 Node 容器。此方案會增加 CORS 的複雜度，且增加了維護三個容器的負擔。

### 2. 在 Dockerfile 中顯式執行 `npx playwright install chrome`
- **決策內容**：在以 `mcr.microsoft.com/playwright:v1.44.0-jammy` 為基礎的 Runner 映像檔中，執行 `RUN npx playwright install chrome` 安裝 Google Chrome 瀏覽器本體。
- **決策理由**：因為後端 [browser.ts](file:///c:/works/e2e-manager-ts/backend/src/browser.ts) 寫死了啟動 `channel: "chrome"`，如果不安裝 Chrome，容器在執行 Playwright 測試時會報錯。
- **替代方案**：修改 `browser.ts` 的代碼，使其在 Container 模式下自動切換回預設的 `chromium`。但這會侵入現有業務邏輯，且為防範未來的版本衝突，直接在容器中安裝 Google Chrome 是最低侵入且最穩健的做法。

### 3. PostgreSQL 健康檢查與 Volume 掛載
- **決策內容**：在 `docker-compose.yml` 中為 `db` 服務添加 `healthcheck`，並使用掛載 `postgres_data` volume。
- **決策理由**：PostgreSQL 啟動比 Node 慢，使用健康檢查能防止 `app` 連線失敗而崩潰。掛載 Volume 能確保所有專案與 E2E 測試數據在重啟時不丟失。

## Risks / Trade-offs

- **映像檔體積較大**：由於安裝了完整的 Google Chrome 瀏覽器以及 Node 依賴，最終的 `app` 映像檔大小可能會超過 1GB。但這在 Playwright 部署中是普遍現象，且能保證執行期 100% 的穩定性。
- **API 安全性**：由於前端與後端同源部署於 3001 埠口，且 API 是公開暴露的，後續需要考慮是否加上身份驗證（本變更中暫不處理）。
