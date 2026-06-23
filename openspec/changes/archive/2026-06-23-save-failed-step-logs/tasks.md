## 1. 後端 `reporterNode` 日誌補存邏輯實作

- [x] 1.1 於 `backend/src/graph.ts` 的 `reporterNode` 頂部新增對未完成步驟的日誌保存與廣播邏輯。
- [x] 1.2 當 `currentStepIdx < steps.length` 且結果為失敗時，篩選並提取當前步驟的記憶體日誌。若無日誌則自動補充一筆說明為「步驟超限未完成」的虛擬日誌。
- [x] 1.3 將擷取到的最終失敗截圖二進位資料（`screenshotFailBuffer`）關聯至該失敗步驟的最後一筆日誌的 `screenshotData` 中。
- [x] 1.4 對篩選出來的每筆失敗步驟日誌，執行 `TestLog` 的寫入，並調用 `pg_notify` 以 `"log"` 事件型態廣播給 SSE 訂閱端。
- [x] 1.5 將失敗步驟中所有日誌累加的 Token 統計數據合併寫入 `TestRun`。

## 2. 前端失敗步驟 UI 渲染與展開優化

- [x] 2.1 調整 `frontend/src/components/custom/StepAccordion.tsx` 中的 `StepCard` 元件，使其能動態感知當前步驟是否為失敗步驟（例如檢查日誌中是否有出錯操作，或步驟序號與 `runStatus` 失敗時的當前步驟吻合）。
- [x] 2.2 為失敗的步驟卡片套用醒目的紅色警示邊框與視覺提示。
- [x] 2.3 確保失敗的步驟折疊卡片預設為展開狀態（`defaultOpen`），方便使用者直接查閱錯誤原因。

## 3. 建置與手動驗證

- [x] 3.1 執行專案整體建置 `npm run build`，確保無編譯與 TypeScript 型別錯誤。
- [x] 3.2 於本地執行測試案例，故意觸發重試超限失敗，手動驗證前端時間軸是否能即時呈現紅色標記並自動展開的失敗步驟卡片，且能看見具體的 AI 工具呼叫、錯誤文字及最終失敗截圖。
