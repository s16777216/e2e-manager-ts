## Why

為了解決本地開發與生產部署環境不一致的問題，本變更旨在引入 Docker 容器化部署方案。
使用者明確要求將前端託管與後端服務拆分為獨立的容器。為了在獨立容器的架構下依然貫徹「同源（Same-Origin）」的網路配置、避免跨域（CORS）的複雜設定，我們將使用 Nginx 容器作為系統的單一對外進入點，將 API 請求與網頁靜態資源請求在 Nginx 層面進行同源反向代理與分流。

## What Changes

- 新增 [frontend/Dockerfile](file:///c:/works/e2e-manager-ts/frontend/Dockerfile)：使用多階段構建，第一階段以 Node.js 編譯 Vite 專案，第二階段使用 `nginx:alpine` 託管靜態資源並進行反向代理。
- 新增 `nginx.conf`：配置 Nginx 反向代理規則，將網頁資源與 `/api` 請求、SSE `/api/runs/*/stream` 串流轉發到後端 Hono 容器。
- 新增 [backend/Dockerfile](file:///c:/works/e2e-manager-ts/backend/Dockerfile)：使用 Playwright Jammy 官方映像檔，僅安裝後端依賴、編譯後端代碼，並安裝 Google Chrome 瀏覽器。
- 新增 [docker-compose.yml](file:///c:/works/e2e-manager-ts/docker-compose.yml)：配置 `frontend` (Nginx)、`backend` (Hono/Playwright) 與 `db` (PostgreSQL 15) 三容器架構，並使用 Volumes 持久化資料庫。
- 新增 [.dockerignore](file:///c:/works/e2e-manager-ts/.dockerignore)：排除開發依賴，優化建置。

## Capabilities

### New Capabilities
- `docker-deployment`: 提供基於 Docker 與 Docker Compose 的三容器（前端、後端、資料庫）一鍵式部署能力，使用 Nginx 代理實現前端與後端 API 的完全同源。

### Modified Capabilities
None.

## Impact

- 後端 Hono 伺服器不再需要強依賴前端靜態檔案目錄，`frontend` 與 `backend` 可以獨立建置與升級。
- 部署後需在環境變數或 `.env` 檔案中提供 `GEMINI_API_KEY` 以供後端 AI 代理調用。
