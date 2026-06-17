## Why

目前系統執行 E2E 測試時，瀏覽器每次都會以乾淨的無痕模式啟動。如果測試案例需要驗證「登入後」或「帶有特定 Session/Token」的頁面，AI Agent 必須在每次執行時都重新跑一次繁雜的登入互動，這不僅大幅增加了測試耗時，也因重複調用 LLM 而產生額外的 Token 消耗。

## What Changes

- **資料庫 Schema 擴充**：於 `Testcase` Entity 新增 `initCookies` (jsonb) 與 `initLocalStorage` (jsonb) 欄位，以支援對個別測試案例進行狀態預置。
- **後端 API 傳輸支援**：修改建立與更新測試案例的 API，使後端能正確儲存並回傳這兩個預置欄位的值。
- **背景執行器狀態注入**：於 `TaskQueue` 的任務執行邏輯中，在 Playwright 瀏覽器 Context 初始化後，自動透過 `addCookies` 與 `addInitScript` 注入該測試案例的 Cookie 和 LocalStorage。
- **前端預置表單介面**：在前端「建立測試案例」與「編輯測試案例」的 Dialog 中整合可摺疊的「進階環境設定」，提供 JSON 編輯輸入框與格式驗證。

## Capabilities

### New Capabilities

### Modified Capabilities
- `testcase-management`: 擴充測試案例之資料結構，使其原生支援初始化 Cookie 與 LocalStorage 的資料欄位。
- `e2e-web-dashboard`: 修改測試案例建立與編輯 Dialog，新增進階環境設定表單以對接 API 的 Cookie 與 LocalStorage 設定。

## Impact

- **後端模組**：
  - [entities/Testcase.ts](file:///c:/works/e2e-manager-ts/backend/src/entities/Testcase.ts) (Schema 變更)
  - [routes/testcase.ts](file:///c:/works/e2e-manager-ts/backend/src/routes/testcase.ts) (API 讀寫處理)
  - [queue.ts](file:///c:/works/e2e-manager-ts/backend/src/queue.ts) (Playwright 環境注入)
- **前端模組**：
  - [types/api.ts](file:///c:/works/e2e-manager-ts/frontend/src/types/api.ts) (API 類型定義同步)
  - [views/ProjectDetailView.tsx](file:///c:/works/e2e-manager-ts/frontend/src/views/ProjectDetailView.tsx) (新增測試案例表單整合)
  - [views/TestCaseDetailView.tsx](file:///c:/works/e2e-manager-ts/frontend/src/views/TestCaseDetailView.tsx) (編輯測試案例表單與詳情顯示)
