## 1. 前端頁面返回按鈕移除

- [ ] 1.1 修改 `frontend/src/views/TestCaseDetailView.tsx`，移除頂部 `ChevronLeft` 返回按鈕及無用圖示 import，並調整標題排版樣式。
- [ ] 1.2 修改 `frontend/src/views/SSEConsoleView.tsx`，移除頂部 `ChevronLeft` 返回按鈕及無用圖示 import，並調整 Header 排版樣式。

## 2. 編譯與端到端驗證

- [ ] 2.1 執行 `npx tsc --noEmit --project tsconfig.app.json` 與 `npm run lint`，確保無編譯與 Lint 錯誤。
- [ ] 2.2 啟動測試任務，在瀏覽器中驗證「測試案例詳情頁」與「即時 Console / 執行詳情頁」頂部 Header 返回按鈕已被成功移除，且視覺佈局正常、透過麵包屑與樹狀目錄導航功能流暢。
