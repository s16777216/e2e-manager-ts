## ADDED Requirements

### Requirement: Unified Same-Origin Docker Deployment
系統 MUST 提供 Docker 部署配置，將後端 API 服務與前端靜態資源打包至同一個應用程式容器中，且該容器對外 MUST 僅暴露單一通訊埠，以確保所有前端請求皆為同源請求。

#### Scenario: Running services under a single port
- **WHEN** 使用者部署專案並造訪 `http://<host>:3001`
- **THEN** 系統將前端網頁與所有 `/api` 請求維持在同一個 IP 與 3001 連接埠下進行，不觸發瀏覽器的 CORS 限制

### Requirement: Persistent Storage and Database Readiness Check
系統 MUST 使用 Docker Volume 提供 PostgreSQL 資料庫持久化機制，且後端容器在啟動時 MUST 透過健康檢查機制確保資料庫已就緒。

#### Scenario: Verify database healthcheck and data retention
- **WHEN** 執行 `docker compose up -d` 且資料庫啟動完成
- **THEN** 後端服務在偵測到資料庫健康狀態為 healthy 時啟動連線，且資料庫在容器重啟後仍保留歷史專案與測試紀錄
