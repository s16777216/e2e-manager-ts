## 1. 建立獨立路由子路由器 (Route Routers Creation)

- [x] 1.1 建立 `src/routes/project.ts`，抽離原本在 `src/server.ts` 內 Project 的所有 CRUD API 路由
- [x] 1.2 建立 `src/routes/group.ts`，抽離原本在 `src/server.ts` 內 Group 的所有樹狀與 CRUD API 路由
- [x] 1.3 建立 `src/routes/testcase.ts`，抽離原本在 `src/server.ts` 內 Testcase 的所有 CRUD API 路由
- [x] 1.4 建立 `src/routes/run.ts`，抽離原本在 `src/server.ts` 內 TestRun 的執行觸發、狀態查詢、取消、二進位圖片輸出與 SSE Stream API 路由

## 2. 重構伺服器主入口 (Server Entry Refactoring)

- [x] 2.1 修改 `src/server.ts`，移除原有的路由實現，並引入上述 4 個子路由器，透過 `app.route` 進行路徑相容性裝配

## 3. 編譯與測試驗證 (Build & Test Verification)

- [x] 3.1 執行 `npm run build`，驗證重構後的專案能正確編譯且無 TypeScript 錯誤
- [x] 3.2 執行 `npm run test`，驗證全專案 5 個測試套件共 25 個單元測試能順利通過
