## 1. 後端實體與資料庫遷移

- [x] 1.1 修改 `backend/src/entities/Task.ts`，將 `status` 列舉值改為 `pending`、`running`、`passed`、`failed`、`error`，並移除 `finalResult` 欄位
- [x] 1.2 建立或更新資料庫遷移（Migration）或資料庫初始化邏輯（如 `backend/src/db.ts` 中的資料初始化），將既有 database 的 Task 舊資料進行升級：`done` + `PASS` 轉為 `passed`；`done` + `FAIL` 轉為 `failed`

## 2. 佇列與狀態機邏輯修改

- [x] 2.1 修改 `backend/src/queue.ts`，在全部 Runs 完成時，根據通過狀況將 Task 的 `status` 更新為 `passed` 或 `failed`，並移除對 `finalResult` 的寫入
- [x] 2.2 修改 `backend/src/queue/taskFSM.ts`，移除對 `finalResult` 的引用，將狀態機轉移結果直接映射至 Task 的 `status`（如 `passed` / `failed` / `error`）

## 3. API 路由與型別調整

- [x] 3.1 修改 `backend/src/routes/task.ts`，在回傳 Task 資料時，移除 `finalResult` 欄位並傳送更新後的 `status`
- [x] 3.2 修改 `backend/src/routes/run.ts`，確保測試案例執行狀態與批次任務狀態的銜接邏輯一致
- [x] 3.3 修改前端 API 型別定義 `frontend/src/types/api.ts` 中的 `Task` 介面，移除 `finalResult`，將 `status` 修改為 `pending` | `running` | `passed` | `failed` | `error`

## 4. 前端共用 UI 元件與視圖重構

- [x] 4.1 在 `frontend/src/components/custom/` 目錄建立共用的 `StatusBadge.tsx` 元件，負責處理這五種狀態裝的 Icon、背景色彩與文字渲染
- [x] 4.2 重構 `frontend/src/table-columns/History.tsx`，移除 `finalResult` 欄位關聯，使用 `StatusBadge` 元件來渲染結果
- [x] 4.3 重構 `frontend/src/views/HistoryView.tsx`，將篩選器的 `selectedStatus` 的過濾值與邏輯修改為 `passed`、`failed`、`error` 等全新狀態
- [x] 4.4 重構 `frontend/src/views/TaskDetailView.tsx`，移除 `renderTaskStatusBadge` 與 `renderRunStatusBadge`，替換為共用的 `StatusBadge` 元件
- [x] 4.5 重構 `frontend/src/views/TestCaseDetailView.tsx`，移除 `renderStatusBadge`，替換為共用的 `StatusBadge` 元件
- [x] 4.6 重構 `frontend/src/components/custom/GroupTreeNode.tsx`，移除 `renderStatusBadge`，替換為共用的 `StatusBadge` 元件
- [x] 4.7 重構 `frontend/src/views/SSEConsoleView.tsx`，將依賴於 `runStatus.finalResult` 的渲染邏輯，改為依據 `status`（是否為結束狀態且對應 passed/failed/error）來呈現視覺斷言 Bento 卡片

## 5. 驗收與整合測試

- [ ] 5.1 啟動前後端，確認資料庫遷移無誤且既存舊 Task 的狀態均已順利轉換
- [ ] 5.2 觸發單一、群組與專案測試執行，確認 Task 能正常從 `pending` 變更為 `running`，並在結束時正確寫入 `passed` 或 `failed`
- [ ] 5.3 驗證前端各頁面（專案列表、執行歷史、即時監控、任務監控）中的狀態 Badge 視覺、文字與 Icon 均顯示正常
- [ ] 5.4 驗證歷史紀錄頁面的狀態篩選選單過濾功能運作正常
