## Why

目前系統在執行 E2E 測試時，Playwright 瀏覽器的啟動參數（例如 headed/headless 模式、Viewport 視窗尺寸、動作 SlowMo 延遲等）皆是寫死在程式碼中，開發者無法在不變更程式碼的情況下彈出真實瀏覽器進行調試或微調運行效能。此外，系統也缺乏便捷的介面讓開發者快速清除 PostgreSQL 中的歷史測試執行紀錄來重設資料庫。

## What Changes

- **後端設定持久化 (JSON Config)**：
  - 新增設定讀寫 API（`GET /api/settings` 與 `POST /api/settings`），全域設定以 JSON 格式儲存於後端專案目錄下的 `settings.json` 檔案中。若檔案不存在，系統會以預設值自動初始化。
  - 支援動態配置以下調試與瀏覽器參數：
    - **是否 Headless**：背景默默執行或彈出實體 Chrome 視窗。
    - **Viewport 解析度**：預設視窗寬度與高度。
    - **慢速執行 (SlowMo)**：每個操作動作之間的強制等待毫秒數。
    - **預設超時 Timeout**：操作超時等待時間。
- **後端資料庫維護 API**：
  - 新增 `DELETE /api/settings/history` API，提供一鍵清除資料庫中所有 `TestRun` 及關聯 `TestLog` 的歷史紀錄。
- **Playwright 動態參數套用**：
  - 修改 `BrowserManager` 啟動 Chromium 與建立 Context 邏輯，在 `initBrowser` 時讀取並套用 `settings.json` 中的 headless、slowMo、viewport 等設定。
- **前端導航與 Settings 面板**：
  - 修改側邊欄底部之設定圖示，點擊後跳轉導向 `/settings` 路由。
  - 新增 Bento 排版風格的 `SettingsView` 控制面板，提供 Playwright 參數調整表單，對接設定 API，並提供具備二次確認 Dialog 的「清除歷史紀錄」按鈕。

## Capabilities

### New Capabilities
- `system-settings`: 系統全域設定管理能力。包含後端 settings.json 持久化、設定讀寫與 DB 清理 API，以及前端對應的設定控制面板，以動態配置 Playwright 瀏覽器運作行為與維護資料庫。

### Modified Capabilities
- `e2e-web-dashboard`: 調整 `RootLayout` 左側側邊欄底部之設定功能鍵，使其點擊後可正確導向全域設定頁面。

## Impact

- **後端模組與執行核心**：
  - [browser.ts](file:///c:/works/e2e-manager-ts/backend/src/browser.ts) (動態初始化 settings)
  - [services/settingsService.ts](file:///c:/works/e2e-manager-ts/backend/src/services/settingsService.ts) `[NEW]` (讀寫 JSON 配置)
  - [routes/settings.ts](file:///c:/works/e2e-manager-ts/backend/src/routes/settings.ts) `[NEW]` (設定與資料清理 API)
  - [server.ts](file:///c:/works/e2e-manager-ts/backend/src/server.ts) (註冊 settings 路由)
- **前端導航與 UI 元件**：
  - [routes.tsx](file:///c:/works/e2e-manager-ts/frontend/src/routes.tsx) (註冊 `/settings` 路由)
  - [layouts/SidebarFooter.tsx](file:///c:/works/e2e-manager-ts/frontend/src/layouts/SidebarFooter.tsx) (包裹 Link 導向)
  - [views/SettingsView.tsx](file:///c:/works/e2e-manager-ts/frontend/src/views/SettingsView.tsx) `[NEW]` (設定控制面板)
