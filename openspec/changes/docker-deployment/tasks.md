## 1. 建立 Docker 部署設定檔

- [ ] 1.1 於專案根目錄建立 [.dockerignore](file:///c:/works/e2e-manager-ts/.dockerignore)，排除 `node_modules`、編譯目錄與開發工具暫存檔案。
- [ ] 1.2 於專案根目錄建立 [Dockerfile](file:///c:/works/e2e-manager-ts/Dockerfile)，設計多階段構建：第一階段安裝 Node.js 依賴並編譯前、後端；第二階段使用 Playwright Jammy 官方映像檔，並運行 `npx playwright install chrome` 安裝 Google Chrome 以相容 `channel: "chrome"` 設定。
- [ ] 1.3 於專案根目錄建立 [docker-compose.yml](file:///c:/works/e2e-manager-ts/docker-compose.yml)，定義 `db`（PostgreSQL 15-alpine，啟用健康檢查與 Volume 持久化）與 `app`（同源 3001 埠口）服務，並關聯彼此啟動順序。

## 2. 本地部署測試與驗證

- [ ] 2.1 執行 `docker compose build`，確認 Monorepo 的前端與後端編譯均能於 Docker 環境中順利通過。
- [ ] 2.2 於本機環境設定包含 `GEMINI_API_KEY` 的環境變數，執行 `docker compose up -d` 啟動容器，驗證 `app` 容器是否確實等待 `db` 健康檢查通過後才啟動。
- [ ] 2.3 瀏覽 `http://localhost:3001`，驗證前端網頁是否載入正常，且相對路徑 API 請求是否回傳成功。
- [ ] 2.4 觸發一個簡單的測試劇本（Scenario），驗證背景 Worker 是否能成功排程任務，且 Playwright 的 Google Chrome 能夠在 headless 模式下順利執行並生成視覺斷言截圖。
