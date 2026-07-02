## 1. 建立 Docker 部署與 Nginx 設定檔

- [x] 1.1 於前端專案建立 [frontend/nginx.conf](file:///c:/works/e2e-manager-ts/frontend/nginx.conf)，配置靜態檔案服務與 `/api/` 反向代理規則，並為 SSE 串流顯式設定 `proxy_buffering off` 關閉快取。
- [x] 1.2 於前端專案建立 [frontend/Dockerfile](file:///c:/works/e2e-manager-ts/frontend/Dockerfile)，設計多階段建置：第一階段以 Node.js 編譯 Vite 生產包；第二階段拷貝 `dist` 至 `nginx:alpine` 並套用 `nginx.conf`。
- [x] 1.3 於後端專案建立 [backend/Dockerfile](file:///c:/works/e2e-manager-ts/backend/Dockerfile)，基於 Playwright Jammy，安裝後端依賴、編譯代碼，並執行 `npx playwright install chrome` 安裝 Google Chrome。
- [x] 1.4 於專案根目錄建立 [docker-compose.yml](file:///c:/works/e2e-manager-ts/docker-compose.yml)，定義 `db`（PostgreSQL 15-alpine，啟用健康檢查與 Volume 持久化）、`backend`（Hono，僅內部網路通訊）與 `frontend`（Nginx，映射 3001 埠口）三容器。
- [x] 1.5 於根目錄、前端與後端分別建立或更新 `.dockerignore` 檔案，排除開發依賴。

## 2. 本地部署測試與驗證

- [x] 2.1 執行 `docker compose build`，確認 `frontend` 與 `backend` 的 Docker Image 皆能建置成功。
- [x] 2.2 設定環境變數並啟動 `docker compose up -d`，確認三個容器都成功啟動且 `backend` 能正確等待 `db` 健康檢查通過後完成連線。
- [x] 2.3 瀏覽 `http://localhost:3001`，驗證前端網頁能順利載入，且首頁的專案列表與 API 請求皆能透過 Nginx 順利同源轉發。
- [ ] 2.4 執行一個測試案例，特別驗證背景 SSE 即時進度串流是否正常（進度條與截圖有即時滾動，非一口氣跑完），以確認 Nginx 的 `proxy_buffering off` 起到作用。
- [ ] 2.5 執行一個簡單測試，確認 Playwright Chrome 能夠在後端 `backend` 容器內正常 headless 執行並存回截圖。
