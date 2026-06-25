## 1. 後端資料表與設定欄位擴充

- [ ] 1.1 修改 `backend/src/entities/SystemSetting.ts`，新增 `screenshotRetentionDays` 欄位（`integer`，預設為 0）。
- [ ] 1.2 修改 `backend/src/entities/TestRunStep.ts`，新增 `screenshotStatus` 欄位（`varchar`，預設為 `none`）。
- [ ] 1.3 修改 `backend/src/entities/TestRun.ts`，新增 `screenshotFailStatus` 欄位（`varchar`，預設為 `none`）。

## 2. 後端清理服務與執行狀態標記實作

- [ ] 2.1 建立 `backend/src/services/cleanerService.ts`，實作 `cleanExpiredScreenshots()` 非同步清理服務，批次將超過天數的 `screenshotData` 與 `screenshotFailData` 設為 NULL，並將狀態標記設為 `expired`。
- [ ] 2.2 修改 `backend/src/queue.ts`，在背景輪詢間隔中，每次領取下一任務前呼叫 `cleanExpiredScreenshots()`。
- [ ] 2.3 修改 `backend/src/graph.ts` 中成功寫入截圖的節點，於寫入時同步將 `screenshotStatus` (步驟) 或 `screenshotFailStatus` (任務失敗) 的狀態標記更替為 `available`。
- [ ] 2.4 修改 `backend/src/routes/run.ts`，在 GET /api/runs/:id 詳情接口中映射並回傳 `screenshotFailStatus` 與各步驟的 `screenshotStatus`。

## 3. 前端 Bento 設定面板與步驟截圖狀態渲染

- [ ] 3.1 修改 `frontend/src/types/api.ts`，在 `SystemSettings` 中新增 `screenshotRetentionDays` 屬性；在 `TestRun` 中新增 `screenshotFailStatus`；在 `TestRunStep` 中新增 `screenshotStatus`。
- [ ] 3.2 修改 `frontend/src/views/SettingsView.tsx`，在「儲存空間與清理」卡片中，新增「截圖保留天數」輸入欄位與狀態綁定，對接 `POST /api/settings`。
- [ ] 3.3 修改 `frontend/src/components/custom/StepAccordion.tsx`，根據 `step.screenshotStatus` 渲染：若為 `expired`，顯示時鐘圖示與「此步驟之截圖已過期清理」提示，且不呼叫截圖下載網址。
- [ ] 3.4 修改 `frontend/src/views/SSEConsoleView.tsx`，根據 `runStatus.screenshotFailStatus` 進行相同過期占位渲染。

## 4. 編譯與 E2E 整合測試

- [ ] 4.1 執行 `npm run build`，確保前端與後端專案皆能正常通過 TypeScript 編譯，且 Vite 能無誤打包。
- [ ] 4.2 啟動服務並切換至設定頁面，將「截圖保留天數」設為 1 天，執行一筆測試，驗證剛跑完時截圖能正常顯示。
- [ ] 4.3 於資料庫中將剛才產出的 TestRun 及 TestRunStep 的 `createdAt` 手動前調 2 天，等待背景輪詢，驗證該筆截圖已成功被清空（設為 NULL），且前端步驟與 Console 畫面均正確顯示「此步驟之截圖已過期清理」，未發生破圖。
