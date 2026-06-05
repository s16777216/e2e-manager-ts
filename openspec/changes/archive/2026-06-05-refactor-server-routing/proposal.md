## Why

目前專案的主伺服器程式碼 [src/server.ts](file:///c:/works/e2e-manager-ts/src/server.ts) 已經膨脹至 500 行。該檔案同時承載了專案引導啟動、Hono 路由宣告、多個實體（Project, Group, Testcase, TestRun）的 CRUD 業務邏輯、資料庫 TypeORM 連線存取、以及底層的 SSE 心跳與 pg.Client 監聽。這導致代碼高度耦合、違背單一職責原則，且使 API 端點的業務邏輯極難進行單元測試與長期維護。因此，急需透過路由模組化（Sub-Routing）將其解耦拆分。

## What Changes

- **路由模組化拆分**：將 Project、Group、Testcase 與 TestRun（包含 SSE 與二進位圖片處理）的 Route Handler 從 `server.ts` 抽離至 `src/routes/` 目錄下的獨立子路由器中。
- **主伺服器瘦身**：重構 [src/server.ts](file:///c:/works/e2e-manager-ts/src/server.ts)，僅保留基本 Hono App 的初始化、全域中間件配置、各模組子路由的掛載，以及原有的伺服器與 Worker 佇列啟動引導。
- **保證 API 相容性**：重構過程中不變動任何既有 API 的 URL 路徑與請求/響應 JSON 格式，維持外部行為 100% 相同。

## Capabilities

### New Capabilities
<!-- 沒有引入新的系統需求或能力，此變更為純代碼重構。 -->

### Modified Capabilities
- `api-server-and-scenario-store`: 路由拆分與模組化解耦，保持原介面外部行為與相容性不變。

## Impact

- **主要受影響程式碼**：
  - [src/server.ts](file:///c:/works/e2e-manager-ts/src/server.ts)：業務 Callback 邏輯被移出，檔案規模由 500 行簡化至 50 行左右。
- **新增程式碼檔案**：
  - `src/routes/project.ts` [NEW]：Project 相關的 API 路由。
  - `src/routes/group.ts` [NEW]：Group 相關的 API 路由。
  - `src/routes/testcase.ts` [NEW]：Testcase 相關的 API 路由。
  - `src/routes/run.ts` [NEW]：TestRun 相關的 API、二進位圖片輸出與 SSE Stream 路由。
