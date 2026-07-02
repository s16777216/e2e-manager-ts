## ADDED Requirements

### Requirement: Same-Origin Nginx Reverse Proxy
系統 MUST 提供 Nginx 代理伺服器作為唯一的對外網路進入點，對外僅暴露單一連接埠（3001）。Nginx MUST 將所有的 API 請求與 SSE (Server-Sent Events) 進度監聽串流請求（`/api/runs/*/stream`）無縫轉發給後端服務容器。

#### Scenario: Running frontend and backend under Nginx
- **WHEN** 使用者造訪 `http://<host>:3001`，且前端向相對路徑 `/api/...` 發送請求
- **THEN** Nginx 正確處理分流：普通資源載入由 Nginx 託管的靜態網頁直接響應，API 請求則隱密地反向代理給後端容器，且不觸發任何 CORS 跨域安全限制

### Requirement: Real-time SSE Streaming without Buffering
Nginx 代理伺服器在轉發 SSE 串流服務時，MUST 關閉回應快取緩衝機制（Buffering），以確保後端 Worker 發送的步驟日誌與截圖能以「即時流式（Streaming）」傳輸至前端。

#### Scenario: SSE progress updates immediately
- **WHEN** 測試正在執行，後端 Worker 透過 SSE 連線寫入步驟日誌
- **THEN** 前端儀表板 MUST 即時（延遲 < 500ms）收到並渲染出步驟與截圖進度，不受 Nginx 緩衝快取延遲影響

### Requirement: Database Persistence and Wait-for-Ready
系統 MUST 提供 PostgreSQL 15 容器持久化機制，且後端 API 容器在啟動時 MUST 與資料庫進行連線就緒檢查。

#### Scenario: Database restart does not lose data
- **WHEN** 資料庫容器重啟或重建
- **THEN** 系統歷史數據與截圖資料完整保留，且後端服務啟動時會等待資料庫就緒後才正式開啟 API 服務
