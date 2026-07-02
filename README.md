# Auto Step-by-Step E2E Test Manager

這是一個基於大語言模型多模態代理的端到端動化驗收測試管理器。使用者只需提供自然語言描述的測試劇本與預期結果，AI 代理便會自主調度瀏覽器、解析簡化 DOM、模擬點擊與輸入操作，並在執行結束後進行多模態視覺斷言，最終生成完整的執行日誌與步驟完成截圖。

---

## 核心技術棧

- **AI 流程協調：** `@langchain/langgraph` (TypeScript 版) — 構建具備條件路由與重試機制的非同步狀態機。
- **大語言模型：** 支援 Gemini 系列模型 與 OpenAI API。
- **瀏覽器自動化：** Playwright。
- **Web API 服務端：** Hono。
- **資料庫與 ORM：** PostgreSQL + TypeORM。
- **前端：** React + Vite + Tailwind CSS，由 Nginx 託管並代理 API 請求。
- **單元測試框架：** Vitest。

---

## 系統設計

系統結合了 **生產者-消費者** 與 **發佈者-訂閱者** 兩種經典架構模式，所有非同步排隊與即時廣播皆高度整合在 PostgreSQL 中：

```
                ┌──────────────────────────────────────────────┐
                │     前端網頁儀表板 (Nginx + React SPA)        │
                │     - 編輯劇本、即時觀看 AI 測試畫面           │
                └──────────────────────────────────────────────┘
                     │ :3001 (所有流量統一入口)     ▲
                     ├── 靜態頁面 (Nginx 直接回應)  │
                     └── /api/* (反向代理至後端) ───┘
                                   │           ▲
                      RESTful APIs │           │ Server-Sent Events (SSE)
                      Trigger Run  ▼           │ (即時串流步驟日誌與截圖)
                ┌──────────────────────────────────────────────┐
                │             Hono Web API Server              │
                │               - 訂閱 LISTEN                  │
                └──────────────────────────────────────────────┘
                     │                                  │
         1. 建立 Run  │                                  │ 2. 寫入 Pending 佇列
            (pending) ▼                                  ▼
      ┌─────────────────────────────┐         ┌─────────────────────────────┐
      │        PostgreSQL           │         │     事務性背景佇列 (DB)     │
      │    (Scenarios / Logs)       │         │   (FOR UPDATE SKIP LOCKED)  │
      └─────────────────────────────┘         └─────────────────────────────┘
                     ▲                                         │
                     │                                         │ 3. 領取任務並執行
                     │                                         ▼
                     │                                ┌─────────────────────┐
                     │ 4. 寫入日誌並觸發 NOTIFY        │  E2E Test Worker    │
                     └────────────────────────────────│    (LangGraph)      │
                                                      └─────────────────────┘
                                                                 │
                                                    5. 控制與擷取 │
                                                                 ▼
                                                      ┌─────────────────────┐
                                                      │ Playwright Browser  │
                                                      └─────────────────────┘
```

### 1. 專案階層組織 (Project > Group > Testcase)

- **Project (專案)：** 最上層的容器，劃分不同系統專案。
- **Group (群組)：** 資料夾結構，支援**無限層級遞迴嵌套**。
- **Testcase (測試案例)：** 具體的自然語言步驟描述與預期結果。

### 2. 事務性背景佇列 (DB Queue)

Worker 藉由執行 `SELECT ... FOR UPDATE SKIP LOCKED` 查詢，安全地在資料庫中搶占 `pending` 狀態的任務並將其標記為 `running`。這能防止多個 Worker 重複領取同一個任務，且能保證伺服器重啟時任務不遺失。

### 3. 即時步驟串流 (LISTEN / NOTIFY)

當 Worker 在背景寫入新的步驟日誌（`TestLog`）時，資料庫會發佈 `NOTIFY` 事件。Hono 伺服器維持一個 `LISTEN` 連線訂閱此事件，並透過 Server-Sent Events (SSE) 機制即時將日誌與截圖路徑串流給瀏覽器。

---

## 專案目錄結構

```
e2e-manager-ts/
├── backend/                # 後端子專案 (Hono API + LangGraph)
│   ├── src/
│   │   ├── entities/       # TypeORM 實體定義
│   │   ├── routes/         # Hono 子路由模組
│   │   ├── services/       # 業務服務模組 (群組防環等)
│   │   ├── browser/        # 瀏覽器定位核心演算法
│   │   ├── graph/          # LangGraph 狀態機節點與條件路由
│   │   ├── queue/          # 任務佇列狀態轉移 FSM
│   │   └── server.ts       # Hono API 伺服器入口
│   ├── tests/              # 後端單元測試
│   ├── Dockerfile
│   └── package.json
├── frontend/               # 前端子專案 (React + Vite SPA)
│   ├── src/
│   ├── nginx.conf          # Nginx 設定 (SPA 路由 + API 反向代理)
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml      # 三服務編排：db / backend / frontend
├── .env                    # 環境變數
└── package.json            # Monorepo 根目錄套件設定
```

---

## Docker 部署

### 前置需求

- [Docker](https://docs.docker.com/get-docker/) 與 Docker Compose

### 部署步驟

**1. 啟動所有服務**

```bash
docker-compose up -d --build
```

首次執行會自動 build 映像檔，後續啟動不需 `--build`。

**2. 開啟瀏覽器**

```
http://<your-server-ip>:3001
```

**3. 設定大語言模型 API 金鑰**

首次進入後，至**設定頁面**輸入 LLM API 金鑰（支援 Gemini / OpenAI）。金鑰儲存於資料庫。

### 埠口說明

| 埠口   | 服務             | 說明                                                          |
| ------ | ---------------- | ------------------------------------------------------------- |
| `3001` | Frontend (Nginx) | 所有流量統一入口；靜態頁面直接回應，`/api/*` 反向代理至後端   |
| `5433` | PostgreSQL       | 僅供本地 GUI 工具（如 DBeaver）連線偵錯使用，非必要不對外暴露 |

> **注意：** 後端服務（port 3001）僅在 Docker 內部網路中暴露，不直接對外。所有 API 請求皆透過 Nginx 代理進入。

---

## 本地開發

### 前置需求

- Node.js 18+
- PostgreSQL（本地或 Docker）

### 安裝與啟動

```bash
# 安裝 Monorepo 所有依賴
npm install

# 安裝 Playwright 瀏覽器核心 (Chromium)
npx playwright install chromium

# 啟動後端開發伺服器
npm run dev
```

### 環境變數

於 `backend/` 目錄建立 `.env`（參考 `backend/.env.example`）：

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/e2e_manager
PORT=3001
QUEUE_PORT=3002
```
