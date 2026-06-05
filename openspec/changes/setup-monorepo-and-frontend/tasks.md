## 1. Monorepo Workspace 重構與後端搬遷 (Monorepo Setup)

- [ ] 1.1 建立 `backend/` 目錄，將原本專案根目錄的後端相關檔案（`src/`, `tests/`, `tsconfig*`, `package.json`, `.env*`）全數移入其中
- [ ] 1.2 於專案根目錄建立全域 `package.json`，宣告 `workspaces: ["backend", "frontend"]`，並安裝 `concurrently` 與設定全域啟動指令
- [ ] 1.3 調整後端 `backend/package.json` 中的 script 執行路徑，並於 `backend/src/server.ts` 內使用 `serveStatic` 註冊託管前端的靜態目錄 `../frontend/dist`
- [ ] 1.4 在根目錄重新安裝依賴，並於 `backend/` 下執行 `npm run build` 與 `npm run test`，驗證重構搬遷後的後端仍 100% 正常運作

## 2. 前端基礎建設與 UI 元件初始化 (Frontend Initializing)

- [ ] 2.1 於 `frontend/` 目錄初始化 React + TS 的 Vite 專案，並於 `vite.config.ts` 配置 `/api` 開發代理
- [ ] 2.2 於前端專案中配置 Tailwind CSS 並初始化 shadcn/ui
- [ ] 2.3 於前端建立 Axios 或者是 Fetch 的 API 請求 client，並定義與後端 `backend` 軟連結共享的 API 資料型別

## 3. 前端頁面與 SSE 實時監控實作 (Frontend UI Implementation)

- [ ] 3.1 實作左側 Sidebar 樹狀群組導航元件，支援 Project 選擇、Group 折疊展開，以及 Group 建立/修改/刪除操作
- [ ] 3.2 實作右側劇本管理面板，包含 Testcases 列表展示、劇本新增/編輯表單（步驟陣列動態編輯），與執行觸發按鈕
- [ ] 3.3 實作實時執行與日誌 Console 元件，點擊執行後以 EventSource 訂閱 `/api/runs/:runId/stream` 的 SSE 事件流
- [ ] 3.4 實作執行 Console 滾動日誌時間軸、步驟完成截圖（bytea 二進位圖片加載）的 Cross-fade 渲染，以及最終視覺斷言 PASS/FAIL 的報告展示

## 4. 全系統整合與端到端驗證 (End-to-End Integration)

- [ ] 4.1 在根目錄執行 `npm run build`，驗證前端打包成果（`frontend/dist/`）成功且後端正常完成編譯
- [ ] 4.2 本地啟動雙端服務，進行手動端到端點擊測試，確保從劇本編輯、觸發執行、觀看即時 Console 與截圖、到顯示斷言的流程完全符合預期
