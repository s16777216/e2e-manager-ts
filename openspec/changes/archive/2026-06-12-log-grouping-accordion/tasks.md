## 1. 歷史日誌步驟分群邏輯與元件設計

- [x] 1.1 建立實用函式 `groupLogsByStep`，將扁平的 `TestLog[]` 轉換為依 `stepIdx` 歸群的 `GroupedStep[]` 巢狀資料結構，並挑選出附帶截圖的日誌。
- [x] 1.2 建立 `frontend/src/components/custom/StepAccordion.tsx` 元件，設計 Bento 風格的步驟卡片、CSS 折疊過渡動畫以及左側時序時間軸（Timeline）。

## 2. 歷史紀錄詳細視圖重構

- [x] 2.1 修改 `frontend/src/views/TestCaseDetailView.tsx` 中載入歷史執行紀錄時的渲染邏輯，改為使用 `groupLogsByStep` 重塑日誌資料。
- [x] 2.2 在檢視執行詳情時，使用 `StepAccordion` 渲染，並在包含截圖的步驟下方加載並渲染網頁截圖。

## 3. 即時監控 Console (SSEConsoleView) 重構

- [x] 3.1 修改 `frontend/src/views/SSEConsoleView.tsx` 接收 SSE 日誌的邏輯，在收到新的 `log` 事件時，依據其 `stepIdx` 動態更新或新建對應的步驟資料區塊。
- [x] 3.2 修改 `SSEConsoleView.tsx` 的畫面渲染，將瀑布流日誌改為使用 `StepAccordion`，並確保即時更新動作與最後加載截圖時，UI 具有平滑的動態效果。

## 4. 編譯與端到端驗證

- [x] 4.1 執行 `npx tsc --noEmit --project tsconfig.app.json` 與 `npm run lint`，確保無編譯與 Lint 錯誤。
- [x] 4.2 啟動測試任務，在瀏覽器中驗證即時日誌流與歷史紀錄中 Accordion 的摺疊、時間軸動作軌跡及最終截圖對照是否完全正常。
