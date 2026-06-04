# AI Agent Step-by-Step E2E Test Manager (TypeScript 版)

這是一個基於大語言模型（LLM）多模態代理的 Web E2E（端到端）自動化驗收測試管理器。使用者只需提供自然語言描述的測試劇本與預期結果，AI 代理便會自主調度瀏覽器、解析簡化 DOM、模擬點擊與輸入操作，並在執行結束後進行多模態視覺斷言，最終生成完整的執行日誌與步驟完成截圖。

---

## 🚀 核心技術棧

- **AI 流程協調：** `@langchain/langgraph` (TypeScript 版) — 構建具備條件路由與重試機制的非同步狀態機。
- **大語言模型 (LLM)：** Gemini 3.1 / 1.5 系列模型 — 負責逐步 Action 決策與最終的結構化視覺斷言（以 Zod 強制約束輸出）。
- **瀏覽器自動化：** Playwright — 原生控制 Chromium 瀏覽器，進行頁面元素操縱與即時截圖。
- **Web API 服務端：** Hono — 現代、極速且原生支援 TypeScript 的 Web 框架。
- **資料庫與 ORM：** PostgreSQL + TypeORM — 支援實體關聯、自動 schema 同步，並利用 **Tree Entities** (樹狀裝飾子) 處理遞迴嵌套的資料結構。

---

## 🎨 系統架構設計

系統結合了 **生產者-消費者 (Producer-Consumer)** 與 **發佈者-訂閱者 (Pub-Sub)** 兩種經典架構模式，所有非同步排隊與即時廣播皆高度整合在 PostgreSQL 中：

```
                ┌──────────────────────────────────────────────┐
                │          前端網頁儀表板 (Web Dashboard)      │
                │        - 編輯劇本、即時觀看 AI 測試畫面      │
                └──────────────────────────────────────────────┘
                                  │           ▲
                   RESTful APIs / │           │ Server-Sent Events (SSE)
                   Trigger Run    ▼           │ (即時串流步驟日誌與截圖)
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
                     │ 4. 寫入日誌並觸發 NOTIFY                 ▼
                     └────────────────────────────────┌─────────────────────┐
                                                      │  E2E Test Worker    │
                                                      │    (LangGraph)      │
                                                      └─────────────────────┘
                                                                 │
                                                    5. 控制與擷取 │
                                                                 ▼
                                                      ┌─────────────────────┐
                                                      │ Playwright Browser  │
                                                      └─────────────────────┘
```

### 1. 專案階層組織 (Project > Group > Testcase)
- **Project (專案)：** 最上層的容器，劃分不同系統專區。
- **Group (群組)：** 資料夾結構，支援**無限層級遞迴嵌套**（利用 TypeORM `@Tree("adjacency-list")` 實作）。
- **Testcase (測試案例)：** 具體的自然語言步驟劇本與預期結果。

### 2. 事務性背景佇列 (DB Queue)
- Worker 藉由執行 `SELECT ... FOR UPDATE SKIP LOCKED` 查詢，安全地在資料庫中搶占 `pending` 狀態的任務並將其標記為 `running`。這能防止多個 Worker 重複領取同一個任務，且能保證伺服器重啟時任務不遺失。

### 3. 即時步驟串流 (LISTEN / NOTIFY)
- 當 Worker 在背景寫入新的步驟日誌（`TestLog`）時，資料庫會發佈 `NOTIFY` 事件。Hono 伺服器維持一個 `LISTEN` 連線訂閱此事件，並透過 Server-Sent Events (SSE) 機制即時將日誌與截圖路徑串流給瀏覽器。

---

## 📁 專案目錄結構

```
c:\works\e2e-manager-ts\
├── docs/                   # 專案文件 (包含 POC 計畫書及工作流草稿)
├── openspec/               # OpenSpec 設計與規格定義 (Spec-driven development)
│   ├── specs/              # 主系統規格能力定義
│   └── changes/            # 歷史變更提案與任務紀錄 (含封存目錄)
├── reports/                # 測試報告與步驟截圖輸出目錄 (可作為靜態目錄存取)
├── src/                    # 原始碼目錄
│   ├── entities/           # TypeORM 實體定義 (Project, TestGroup, Testcase, 等)
│   ├── main.ts             # CLI 測試進入點
│   ├── server.ts           # Hono API 伺服器進入點
│   ├── db.ts               # TypeORM DataSource 初始化與啟動修復邏輯
│   ├── queue.ts            # PostgreSQL 事務佇列管理類別
│   ├── browser.ts          # Playwright 控制與 HTML DOM 元素過濾簡化器
│   ├── graph.ts            # LangGraph.js 狀態圖節點與條件路由定義
│   ├── tools.ts            # 提供給 AI 代理呼叫的瀏覽器互動工具箱
│   ├── parser.ts           # 本地 JSON 劇本驗證解析器 (Zod)
│   └── reporter.ts         # Markdown 報告組裝生成器
├── tests/                  # 本地 JSON 測試劇本範例
├── package.json            # 專案套件依賴與腳本定義
└── tsconfig.json           # TypeScript 編譯設定
```

---

## 🚀 快速開始

### 1. 安裝環境與依賴
確保已安裝 Node.js 18+ 與 PostgreSQL 服務。

```bash
# 安裝 npm 依賴套件
npm install

# 安裝 Playwright 瀏覽器核心 (Chromium)
npx playwright install chromium
```

### 2. 配置環境變數
於專案根目錄建立 `.env` 檔案（可參考 `.env.example`）：

```env
# Gemini API 憑證 (必須設定)
GEMINI_API_KEY=your_gemini_api_key_here

# PostgreSQL 資料庫連線字串 (伺服器模式需要)
DATABASE_URL=postgresql://username:password@localhost:5432/e2e_manager
```

### 3. 以 CLI 模式執行本地測試
可以直接傳入 JSON 劇本，在終端機中同步執行測試並生成 Markdown 報告：

```bash
# 執行維基百科搜尋 TypeScript 的測試範例
npx tsx src/main.ts tests/search_test.json
```

執行完畢後，可在控制台看見結果，並於 `reports/run_wiki_search_ts_<timestamp>/` 內找到完整的 `report.md` 及逐步截圖。

### 4. 啟動 Web API 伺服器
將伺服器啟動於本地，提供 REST API 與即時串流：

```bash
npm run server
```

---

## 🛠️ OpenSpec 開發規範

本專案採用 **規約驅動開發 (Spec-driven development)**。所有系統規格、設計架構與實作任務，均經由 OpenSpec CLI 工具統一規範與追蹤：

- **驗證現有規格與變更：**
  ```bash
  openspec validate
  ```
- **查看歷史已封存的變更提案：**
  可參閱 [openspec/changes/archive/](file:///c:/works/e2e-manager-ts/openspec/changes/archive/) 下的設計與記錄。
