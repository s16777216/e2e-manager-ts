## Context

目前 AI E2E 測試管理器專案是一個 TypeScript Monorepo。使用者要求將前端託管與後端服務拆分為獨立的容器，並透過 Nginx 作為統一入口以貫徹同源（Same-Origin）部署。

因此，我們需要將架構調整為「三容器架構」：
1. **`frontend` 容器**：以 `nginx:alpine` 託管前端 Vite 打包後的靜態資源，並作為對外唯一的進入點。
2. **`backend` 容器**：基於 Playwright 官方映像檔，僅執行 Hono API 與 E2E Worker，不包含前端靜態資源。
3. **`db` 容器**：運行 PostgreSQL 15-alpine。

為了解決同源問題，Nginx 需要將 `/api` 開頭的請求轉發到後端，特別是 Server-Sent Events (SSE) 串流（例如 `/api/runs/:id/stream`）。Nginx 預設會啟用回應快取（buffering），這會導致 SSE 串流被卡住而無法即時傳輸，必須為其關閉快取。

## Goals / Non-Goals

**Goals:**
- 將前端與後端完全解耦為獨立的容器與 Dockerfile，可獨立建置。
- 使用 Nginx 容器作為唯一的對外反向代理進入點，僅暴露 Nginx 的 3001 埠口，在外部維持完全同源。
- 配置 Nginx 正確轉發 `/api` 請求，特別是針對 SSE 串流關閉 buffering 確保即時步驟日誌不延遲。
- 在 `backend` 容器中安裝 Google Chrome 以符合現有 `channel: "chrome"` 的設定。

**Non-Goals:**
- 不在此變更中配置外部的負載平衡器（Load Balancer）或 HTTPS 憑證，維持由 Nginx 處理 HTTP 流量。

## Decisions

### 1. Nginx 代理同源與關閉 SSE 緩衝
- **決策內容**：在 `frontend/nginx.conf` 中設定以下代理規則：
  ```nginx
  location /api/ {
      proxy_pass http://backend:3001/api/;
      proxy_http_version 1.1;
      proxy_set_header Connection "";
      proxy_set_header Host $host;
      
      # 針對 SSE (Server-Sent Events) 的特殊優化，關閉快取快遞
      proxy_buffering off;
      proxy_cache off;
      chunked_transfer_encoding on;
  }
  ```
- **決策理由**：Hono 後端的進度串流是依賴 SSE。如果沒有關閉 `proxy_buffering`，Nginx 會等到緩衝區滿了才一次送出資料，造成前端畫面「卡死」直到測試結束。關閉 buffering 能實現即時步驟與截圖更新。

### 2. 獨立的雙 Dockerfile 建置
- **前端 Dockerfile** (`frontend/Dockerfile`)：
  使用多階段構建，第一階段以 `node:20-slim` 建置前端程式碼，第二階段將編譯出的 `dist` 複製到 `nginx:alpine`，並套用自訂的 `nginx.conf`。
- **後端 Dockerfile** (`backend/Dockerfile`)：
  使用 `mcr.microsoft.com/playwright:v1.44.0-jammy` 做為 Runner。安裝僅生產環境所需的 node 依賴，並顯式執行 `npx playwright install chrome` 以支援硬編碼的 Chrome 瀏覽器。

### 3. 三容器 Compose 網絡串接
- `frontend` 容器對外暴露 `3001`（對應 Nginx 的 `80` 埠口），對使用者提供網頁與代理。
- `backend` 與 `db` 容器不對外暴露埠口（僅 `db` 可以選擇性暴露 5432 便於調試），全部在 Docker 的內部虛擬網路中進行通訊，安全性更高。

## Risks / Trade-offs

- **Nginx 設定複雜度**：SSE 轉發需要正確的 HTTP/1.1 與 Header 設定，若配置錯誤會導致進度條無法即時更新。需要在任務中進行嚴格的 SSE 即時性驗證。
