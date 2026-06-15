## 1. 後端 API 實作

- [ ] 1.1 修改 `backend/src/routes/task.ts`，新增 `GET /tasks` 路由，透過 TypeORM 聯表加載 Task 及其 runs.testcase.group.project，並格式化回傳包含專案名稱與 ID 的 Task 列表。

## 2. 前端型別與 API 封裝

- [ ] 2.1 修改 `frontend/src/types/api.ts` 的 `Task` 介面，新增 `projectId?: string` 與 `projectName?: string` 選用欄位。
- [ ] 2.2 修改 `frontend/src/lib/api.ts`，新增 `api.getAllTasks(): Promise<Task[]>` 封裝函數。

## 3. 前端導航與路由調整

- [ ] 3.1 修改 `frontend/src/layouts/RootLayout.tsx`，在左側導航選單中加入「執行紀錄 (History)」按鈕（使用 Clock 圖示），點擊後跳轉至 `/tasks`。
- [ ] 3.2 修改 `frontend/src/routes.tsx`，註冊 `/tasks` 路由至 `RootLayout` 子路由中，指向 `HistoryView` 元件。

## 4. 實作獨立執行紀錄頁面 (HistoryView)

- [ ] 4.1 新建 `frontend/src/views/HistoryView.tsx`，實作基礎架構與全域麵包屑設定 `[{ label: "執行紀錄" }]`。
- [ ] 4.2 在 `HistoryView` 中實作 Bento 磨砂玻璃風格的統計面板（總次數、成功率、執行中數量）。
- [ ] 4.3 在 `HistoryView` 中實作專案與狀態的前端過濾下拉選單控制項。
- [ ] 4.4 在 `HistoryView` 中實作歷史表格，展示各 Task 的詳細進度與狀態，並支援點擊行（Row）跳轉至 `TaskDetailView`。

## 5. 專案詳情頁清理

- [ ] 5.1 修改 `frontend/src/views/ProjectDetailView.tsx`，移除底部的「批次任務執行歷史紀錄」表格 DOM，並清理相關的 `historyTasks` 狀態、`loadHistoryTasks` useCallback 以及載入 `useEffect`。

## 6. 專案編譯與驗證

- [ ] 6.1 執行 `npm run build`，確保前端與後端均無任何 TypeScript 編譯錯誤或 ESLint 警告。
- [ ] 6.2 進行手動 E2E 流程驗證，確認側邊欄轉導、全域歷史過濾篩選、專案頁精簡、以及 Task 跳轉功能運作完全正常。
