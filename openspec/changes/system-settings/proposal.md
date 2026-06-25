## Why

目前系統在執行 E2E 測試時，Playwright 瀏覽器的啟動參數（例如 headed/headless 模式、Viewport 視窗尺寸、動作 SlowMo 延遲等）皆是寫死在程式碼中，開發者無法在不變更程式碼的情況下彈出真實瀏覽器進行調試或微調運行效能。此外，系統也缺乏便捷的介面讓開發者快速清除 PostgreSQL 中的歷史測試執行紀錄來重設資料庫。本案將這些設定改為持久化儲存於 PostgreSQL 資料庫中，以實現安全、集中且高併發安全的管理。

## What Changes

- **後端設定持久化 (PostgreSQL DB)**：
  - 於 PostgreSQL 資料庫中建立 `system_setting` 資料表，以 Singleton 模式（僅一筆識別碼為 `default` 的資料）進行全域設定的持久化儲存。
  - 後端系統啟動時若發現資料表為空，會自動以預設值初始化。
  - 新增設定讀寫 API（`GET /api/settings` 與 `POST /api/settings`）。
  - 支援動態配置以下調試與瀏覽器參數：
    - **是否 Headless**：背景默默執行或彈出實體 Chrome 視窗。
    - **Viewport 解析度**：預設視窗寬度與高度。
    - **慢速執行 (SlowMo)**：每個操作動作之間的強制等待毫秒數。
    - **預設超時 Timeout**：操作超時等待時間。
- **後端資料庫維護 API**：
  - 新增 `DELETE /api/settings/history` API，提供一鍵清除資料庫中所有 `TestRun` 及關聯 `TestLog` 的歷史紀錄。
- **Playwright 動態參數套用**：
  - 修改 `BrowserManager` 啟動 Chromium 與建立 Context 邏輯，在 `initBrowser` 時從資料庫讀取並套用 `headless`、`slowMo`、`viewport` 與 `defaultTimeout` 等設定。
- **前端導航與 Settings 面板**：
  - 修改 `RootLayout` 與 `SidebarFooter`，使側邊欄底部正確渲染全域設定按鈕，點擊後跳轉導向 `/settings` 路由。
  - 新增 Bento 排版風格的 `SettingsView` 控制面板，對接設定 API，並提供具備二次確認 Dialog 的「清除歷史紀錄」按鈕。

## Capabilities

### New Capabilities
- `system-settings`: 系統全域設定管理能力。包含後端資料庫 settings 持久化、設定讀寫與 DB 清理 API，以及前端對應的設定控制面板，以動態配置 Playwright 瀏覽器運作行為與維護資料庫。

### Modified Capabilities
- `e2e-web-dashboard`: 調整 `RootLayout` 左側側邊欄底部之設定功能鍵，使其點擊後可正確導向全域設定頁面。

## Impact

- **後端模組與執行核心**：
  - [entities/SystemSetting.ts](file:///c:/works/e2e-manager-ts/backend/src/entities/SystemSetting.ts) `[NEW]` (系統設定資料庫實體)
  - [services/settingsService.ts](file:///c:/works/e2e-manager-ts/backend/src/services/settingsService.ts) `[NEW]` (讀寫 DB 配置)
  - [routes/settings.ts](file:///c:/works/e2e-manager-ts/backend/src/routes/settings.ts) `[NEW]` (設定與資料清理 API)
  - [db.ts](file:///c:/works/e2e-manager-ts/backend/src/db.ts) (註冊實體與啟動時 Seeding 預設值)
  - [server.ts](file:///c:/works/e2e-manager-ts/backend/src/server.ts) (註冊 settings 路由)
  - [browser.ts](file:///c:/works/e2e-manager-ts/backend/src/browser.ts) (非同步初始化 settings)
- **前端導航與 UI 元件**：
  - [types/api.ts](file:///c:/works/e2e-manager-ts/frontend/src/types/api.ts) (擴充 SystemSettings 介面定義)
  - [routes.tsx](file:///c:/works/e2e-manager-ts/frontend/src/routes.tsx) (註冊 `/settings` 路由)
  - [layouts/SidebarFooter.tsx](file:///c:/works/e2e-manager-ts/frontend/src/layouts/SidebarFooter.tsx) (使用 React Router Link)
  - [layouts/RootLayout.tsx](file:///c:/works/e2e-manager-ts/frontend/src/layouts/RootLayout.tsx) (傳入 footer 元件至 SidebarContainer)
  - [views/SettingsView.tsx](file:///c:/works/e2e-manager-ts/frontend/src/views/SettingsView.tsx) `[NEW]` (設定控制面板)
