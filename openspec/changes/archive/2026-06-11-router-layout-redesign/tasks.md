## 1. 後端 API 調整

- [x] 1.1 修改 backend/src/routes/testcase.ts 中 GET /testcases/:id，加載 runs 關係
- [x] 1.2 修改 backend/src/routes/run.ts 中 GET /runs/:runId，加載 testcase 並在回傳的 JSON 中加入 testcaseId

## 2. 前端 API 與路由配置

- [x] 2.1 修改 frontend/src/lib/api.ts，新增 getTestcaseDetail 方法
- [x] 2.2 修改 frontend/src/routes.tsx，調整路由以配置新路由結構

## 3. 前端佈局與樹狀元件修改

- [x] 3.1 修改 frontend/src/layouts/RootLayout.tsx，將群組導航樹與專案切換移出 Sidebar
- [x] 3.2 修改 frontend/src/components/custom/GroupTreeNode.tsx，支援在節點展開時動態發送 API 載入測試案例，並快取於本地後進行渲染與點選跳轉

## 4. 前端 Views 的建立與修改

- [x] 4.1 新增 frontend/src/views/ProjectsView.tsx (Bento Grid 卡片列表專案頁面)
- [x] 4.2 新增 frontend/src/views/ProjectDetailView.tsx (整合新增測試案例/群組功能與樹狀目錄)
- [x] 4.3 新增 frontend/src/views/TestCaseDetailView.tsx (包含 Steps 與 History Tabs)
- [x] 4.4 修改 frontend/src/views/SSEConsoleView.tsx，點擊返回導航回對應的測試案例詳情頁
- [x] 4.5 修改 frontend/src/views/WelcomeView.tsx，修改引導說明

## 5. 編譯與驗證

- [x] 5.1 執行編譯指令，確保前後端 TypeScript 無型別與建置錯誤
- [x] 5.2 於瀏覽器進行手動端到端測試，驗證完整路由流程與新增/編輯功能
