## ADDED Requirements

### Requirement: System Global Settings Persistence
後端系統 MUST 提供全域設定的持久化儲存，在 PostgreSQL 資料庫中以 `system_setting` 資料表進行 Singleton 設定值保存。後端 MUST 提供 API 路由 `GET /api/settings` 與 `POST /api/settings` 以供讀取與覆寫設定。設定內容 MUST 包含：是否 Headless（headless）、Viewport 寬高（viewportWidth/viewportHeight）、SlowMo 操作延遲（slowMo）與預設超時 Timeout（defaultTimeout）。後端系統 MUST 提供 `DELETE /api/settings/history` 路由，一鍵清除資料庫中的所有 `TestRun` 執行紀錄與關聯日誌。

#### Scenario: Read global configurations
- **WHEN** 前端發送 `GET /api/settings` 請求時
- **THEN** 後端 MUST 返回包含所有設定參數的 JSON 物件，狀態碼為 200

#### Scenario: Update global configurations
- **WHEN** 前端發送 `POST /api/settings` 請求並提供新的參數值時
- **THEN** 後端 MUST 將新設定寫入資料庫中，並返回儲存成功訊息

#### Scenario: Clear database execution history
- **WHEN** 前端發送 `DELETE /api/settings/history` 請求時
- **THEN** 後端系統清除資料庫中所有 `TestRun` 及 `TestLog` 資料表數據，並返回清除成功狀態碼

### Requirement: Dynamic Playwright Parameters
後端 `BrowserManager` 初始化 Playwright 瀏覽器時，MUST 載入並套用設定中配置的參數，包括是否開啟無頭模式、Viewport 視窗尺寸、慢速 SlowMo 動作延遲與等待 Timeout 等設定，以動態改變測試執行時的瀏覽器表現。

#### Scenario: Launch Playwright with custom settings
- **WHEN** 後端啟動 E2E 測試任務並調用 `initBrowser` 時
- **THEN** 後端 `BrowserManager` 自動讀取並套用資料庫中的全域設定參數，開啟符合該設定的 Chromium 瀏覽器實例
