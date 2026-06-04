## Why

目前 E2E 測試管理器為 CLI 單次執行模式，測試結果與截圖僅儲存於本地檔案系統中。為了支援團隊協作、多個測試案例的統一儲存、CI/CD 自動化排程觸發，以及歷史執行歷程與成功率的追蹤分析，我們需要將 E2E 測試管理器「伺服器化」並「導入資料庫」進行歷程與劇本的管理，以實現非同步任務佇列執行。

## What Changes

- **新增 API 服務端：** 建立 Hono API 伺服器，提供測試劇本、專案與群組的樹狀管理（CRUD）與非同步啟動測試的接口。
- **導入 PostgreSQL 與 TypeORM：** 使用 PostgreSQL 資料庫儲存資料，並透過 TypeORM 進行物件關聯對照（ORM）管理，簡化樹狀群組的遞迴查詢與維護。
- **重構執行模式為非同步任務佇列：** 當收到測試請求時，改為非同步派發任務，由背景任務佇列（Queue/Worker）按順序執行，並實施併發限制以保護伺服器硬體資源。
- **持久化 LangGraph 執行紀錄：** 重構原有的報告生成器，將每次執行的日誌、截圖路徑與視覺斷言結果，在執行過程中即時寫入資料庫，不再依賴本地 Markdown 檔案生成。

## Capabilities

### New Capabilities
- `api-server-and-scenario-store`: 提供 Hono API 伺服器與 PostgreSQL/TypeORM 資料庫整合，支援專案、群組（樹狀）與測試案例管理。
- `background-task-runner`: 實作非同步任務佇列（Queue/Worker）機制，負責排隊執行 Playwright/LangGraph 測試，控制最大併發量，並將執行結果與截圖路徑即時寫入資料庫。

### Modified Capabilities
- (無變更現有 spec)

## Impact

- **新增依賴：** 在 `package.json` 中新增 `hono`、`@hono/node-server`、`typeorm`、`reflect-metadata`、`pg` 等 API 與資料庫套件。
- **進入點變更：** 保留 CLI 進入點的同時，新增伺服器進入點 `src/server.ts`，並在啟動時初始化 TypeORM `DataSource` 連線與自動同步 schema。
- **執行生命週期：** LangGraph 的執行流程改為由 Worker 啟動，並將狀態變更即時透過 TypeORM 寫入 `TestRuns` 與 `TestLogs` 資料表中。
