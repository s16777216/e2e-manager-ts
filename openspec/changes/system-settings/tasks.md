## 1. 後端設定管理與 API 實作

- [ ] 1.1 建立 `backend/src/services/settingsService.ts`，負責讀寫 `settings.json`（提供預設值且在檔案不存在時自動初始化）。
- [ ] 1.2 建立 `backend/src/routes/settings.ts`，實作 `GET /api/settings`（讀取）與 `POST /api/settings`（更新）API 路由；同時實作 `DELETE /api/settings/history` 用以清除資料庫中所有的 TestRun 執行紀錄與步驟日誌。
- [ ] 1.3 修改 `backend/src/server.ts`，引入並註冊上述 settings 路由。

## 2. 後端瀏覽器管理重構

- [ ] 2.1 修改 `backend/src/browser.ts` 的 `initBrowser` 邏輯，在啟動 Chromium 時動態載入並套用設定中的 `headless`、`slowMo`、`defaultTimeout`、`viewportWidth` 與 `viewportHeight` 參數。
- [ ] 2.2 在 `BrowserManager` 的 headless 判定中，加入環境變數檢查，若為 CI/CD 環境（如 `process.env.CI`），強制覆寫為 `headless: true` 以防崩潰。

## 3. 前端導航與 Bento 設定面板開發

- [ ] 3.1 修改 `frontend/src/layouts/SidebarFooter.tsx`，使用 React Router 的 `<Link to="/settings">` 包裹設定按鈕，並於 `frontend/src/routes.tsx` 中引入並註冊 `/settings` 路由。
- [ ] 3.2 建立 `frontend/src/views/SettingsView.tsx` 頁面，採用 Bento 風格網格卡片排版。
- [ ] 3.3 於 `SettingsView.tsx` 對接後端的設定 `GET` 與 `POST` API，儲存成功時調用 `toast.success` 顯示提示。
- [ ] 3.4 於 `SettingsView.tsx` 實作「清除歷史紀錄」功能，對接後端清除 API，並綁定二次確認 Dialog 以防誤點。

## 4. 編譯與 E2E 整合測試

- [ ] 4.1 執行 `npm run build`，確保前端與後端專案皆能正常通過 TypeScript 編譯，且 Vite 能無誤打包。
- [ ] 4.2 啟動服務，開啟瀏覽器，切換至設定頁面並將 Headless 設為 false，Viewport 與 SlowMo 設為自訂值，儲存後執行測試，驗證 Playwright 瀏覽器是否會彈出並慢速執行，Viewport 大小正確。
- [ ] 4.3 點擊設定面板的「清除歷史紀錄」按鈕，確認二次彈窗確認後，歷史紀錄表格已清空，且資料庫空間已被釋放。
