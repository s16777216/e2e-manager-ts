## 1. 後端資料表與設定 API 實作

- [x] 1.1 建立 `backend/src/entities/SystemSetting.ts` 實體，設定 Singleton 模式與欄位預設值。
- [x] 1.2 修改 `backend/src/db.ts`，將 `SystemSetting` 實體註冊至 DataSource，並於 `initDB` 連線初始化完畢後，實作 Seeding 邏輯（若設定表 count 為 0，則寫入一筆預設資料）。
- [x] 1.3 建立 `backend/src/services/settingsService.ts`，實作 `getSettings()` 與 `saveSettings(settings)` 的異步資料庫讀寫服務。
- [x] 1.4 建立 `backend/src/routes/settings.ts`，實作 `GET /api/settings` 與 `POST /api/settings` API 路由；同時實作 `DELETE /api/settings/history` 呼叫 `delete({})` 級聯清空 `TestRun` 所有歷史紀錄與關聯步驟日誌。
- [x] 1.5 修改 `backend/src/server.ts`，引入並註冊設定路由器。

## 2. 後端瀏覽器管理與執行重構

- [x] 2.1 修改 `backend/src/browser.ts` 的 `initBrowser` 邏輯，從資料庫非同步載入並套用 `headless`、`slowMo`、`defaultTimeout`、`viewportWidth` 與 `viewportHeight` 參數。
- [x] 2.2 在 `BrowserManager` 的 headless 判定中，加入環境變數檢查，若為 CI/CD 環境（如 `process.env.CI`），強制覆寫為 `headless: true` 以防崩潰。
- [x] 2.3 修改 `backend/src/queue.ts` 中 `initBrowser` 的呼叫，移除寫死的 `true` 參數，改為調用無參數的 `initBrowser()` 以讀取全域資料庫設定。
- [x] 2.4 修改 `backend/src/main.ts` 中的 `initBrowser` 呼叫點，改為非同步呼叫，僅在 CLI 帶入 `--headed` 參數時覆寫為 `false`，否則調用無參數的 `initBrowser()`。

## 3. 前端導航、排版與 Bento 設定面板開發

- [x] 3.1 修改 `frontend/src/types/api.ts` 新增 `SystemSettings` 介面型別定義。
- [x] 3.2 修改 `frontend/src/layouts/RootLayout.tsx`，導入並傳入 `footer={<SidebarFooter />}` 至 `<SidebarContainer>` 中。
- [x] 3.3 修改 `frontend/src/layouts/SidebarFooter.tsx`，使用 React Router 的 `<Link to="/settings">` 包裹設定按鈕，並於 `frontend/src/routes.tsx` 中引入並註冊 `/settings` 路由。
- [x] 3.4 建立 `frontend/src/views/SettingsView.tsx` 頁面，採用 Bento 風格網格卡片排版。
- [x] 3.5 於 `SettingsView.tsx` 對接後端的設定 `GET` 與 `POST` API，儲存成功時調用 `toast.success` 顯示提示。
- [x] 3.6 於 `SettingsView.tsx` 實作「清除歷史紀錄」功能，對接後端清除 API，並綁定二次確認 Dialog 以防誤點。

## 4. 編譯與 E2E 整合測試

- [x] 4.1 執行 `npm run build`，確保前端與後端專案皆能正常通過 TypeScript 編譯，且 Vite 能無誤打包。
- [x] 4.2 啟動服務，開啟瀏覽器，切換至設定頁面並將 Headless 設為 false，Viewport 與 SlowMo 設為自訂值，儲存後執行測試，驗證 Playwright 瀏覽器是否會彈出並慢速執行，Viewport 大小正確。
- [x] 4.3 點擊設定面板的「清除歷史紀錄」按鈕，確認二次確認彈窗後，歷史紀錄表格已清空，且資料庫空間已被釋放。
