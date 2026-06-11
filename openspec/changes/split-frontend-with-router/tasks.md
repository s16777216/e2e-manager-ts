## 1. 依賴安裝與基礎配置

- [ ] 1.1 在前端專案安裝 `react-router-dom` 庫
- [ ] 1.2 在前端目錄下建立路由、自訂 Hooks、Layouts、Views 與 Components 的資料夾架構

## 2. 抽取業務邏輯為自訂 Hooks

- [ ] 2.1 抽取專案加載與建立邏輯為 `useProjectData.ts`
- [ ] 2.2 抽取群組樹加載、建立與刪除邏輯為 `useGroupData.ts`
- [ ] 2.3 抽取測試劇本清單加載、建立、修改與刪除邏輯為 `useTestcaseData.ts`
- [ ] 2.4 抽取測試執行 trigger 與 SSE EventSource 日誌串流、截圖更新與退出清理邏輯為 `useSSEStream.ts`

## 3. 拆分 UI 元件與視圖

- [ ] 3.1 將側邊欄（Logo、專案選單、群組樹狀導航）拆分至 `layouts/RootLayout.tsx` 及其子元件 `components/custom/GroupTreeNode.tsx`
- [ ] 3.2 將新增專案與新增群組的 Dialog 獨立為 `components/custom/` 下的元件
- [ ] 3.3 將主控台（測試劇本清單、劇本建立與編輯表單）拆分至 `views/GroupDashboardView.tsx` 與 `views/WelcomeView.tsx`
- [ ] 3.4 將 SSE 即時監控與日誌截圖 Console 畫面拆分至 `views/SSEConsoleView.tsx`

## 4. 路由配置與全域整合

- [ ] 4.1 在 `src/routes.tsx` 中定義 React Router 配置，設定 RootLayout、WelcomeView、ProjectLayout、GroupDashboardView 與 SSEConsoleView 的層級關係，並設定 Outlet Context 共享群組狀態
- [ ] 4.2 重構 `src/App.tsx`，移除所有舊的 UI 邏輯與 HSL 變數，僅保留 `<RouterProvider>` 元件
- [ ] 4.3 在 `src/main.tsx` 整合全域 Toaster 並掛載路由 Provider

## 5. 編譯打包與功能驗證

- [ ] 5.1 在前端目錄執行 `npm run build`，驗證沒有任何 TypeScript 型別、宣告或 Vite 打包錯誤
- [ ] 5.2 啟動服務，手動驗證專案切換、群組樹導航狀態與 URL 同步正常
- [ ] 5.3 驗證測試執行時，畫面能轉導至 `/runs/:runId`，SSE 即時日誌、截圖與報告渲染完全正常
- [ ] 5.4 驗證直接複製網址或瀏覽器上一頁/下一頁能維持正確的視圖載入與歷史導航
