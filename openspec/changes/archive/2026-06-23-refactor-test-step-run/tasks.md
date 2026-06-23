## 1. 資料庫實體與綱要調整

- [x] 1.1 建立 `backend/src/entities/TestRunStep.ts` 實體。
- [x] 1.2 修改 `backend/src/entities/TestLog.ts` 實體，移除 `stepIdx`、`stepDescription`，並建立與 `TestRunStep` 的 ManyToOne 關聯。
- [x] 1.3 修改 `backend/src/entities/TestRun.ts` 實體，建立與 `TestRunStep` 的 OneToMany 關聯。
- [x] 1.4 在 `backend/src/db.ts` 中註冊 `TestRunStep` 實體。

## 2. 後端圖執行邏輯重構 (graph.ts)

- [x] 2.1 修改 `executorNode` 邏輯，在步驟開始時建立或載入 `TestRunStep`，狀態設為 `running`。
- [x] 2.2 重構 `stepTrackerNode` 邏輯，將步驟狀態更新為 `passed`，儲存截圖至步驟實體，並將 logs 關聯寫入。
- [x] 2.3 重構 `reporterNode` 邏輯，將當前未完成步驟狀態更新為 `failed`，儲存失敗截圖至步驟實體，並將暫存 logs 關聯寫入。

## 3. API 與 SSE 串流重構 (backend)

- [x] 3.1 重構 `/api/runs/:runId` 路由，以 nested 的步驟列表結構取代原先扁平的 logs 結構回傳。
- [x] 3.2 於 `runRouter` 中新增 `/api/steps/:stepId/screenshot` 路由，用以讀取步驟截圖。
- [x] 3.3 重構 SSE 串流推播廣播格式，支援發送 `step_status`、`log` 與 `completed` 事件。

## 4. 前端 UI 與狀態管理重構 (frontend)

- [x] 4.1 調整前端類型定義 `frontend/src/types/api.ts` 與 API 調用介面。
- [x] 4.2 重構 `useSSEStream.ts` Hook，以支援新的巢狀步驟與日誌 SSE 更新接收。
- [x] 4.3 修改 `StepAccordion.tsx` 的 `StepCard` 元件，直接使用 `step.status` 作為判定成功與失敗卡片的依據。
- [x] 4.4 移除 `frontend/src/lib/logUtils.ts` 中的 `groupLogsByStep` 函數。

## 5. 編譯與測試驗證

- [x] 5.1 執行專案整體建置 `npm run build`，確保前端與後端型別與邏輯無任何編譯錯誤。
- [x] 5.2 執行測試案例，手動驗證成功與失敗時，前端時間軸是否能正確顯示與展開對應的步驟卡片。
