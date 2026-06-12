## 1. 前端 UI 文字替換

- [x] 1.1 修改 `frontend/src/views/WelcomeView.tsx`，將首頁中「劇本」的說明文案替換為「測試案例」。
- [x] 1.2 修改 `frontend/src/views/ProjectsView.tsx`，將專案列表表格首部的「劇本數」與對應的標題描述替換為「測試案例數」。
- [x] 1.3 修改 `frontend/src/views/ProjectDetailView.tsx`，將群組樹狀目錄上的說明文字、建立劇本 Dialog 標題及按鈕（如「建立全新測試劇本」、「劇本名稱」、「儲存劇本」）全面替換為「測試案例」。
- [x] 1.4 修改 `frontend/src/views/TestCaseDetailView.tsx`，將測試案例詳情頁內的載入/失敗提示、標頭與編輯視圖的「劇本」字眼全面替換為「測試案例」。
- [x] 1.5 修改 `frontend/src/views/SSEConsoleView.tsx`，將任務監控控制台內相關「劇本」的 console 錯誤提示字眼改為「測試案例」。
- [x] 1.6 修改 `frontend/src/views/GroupDashboardView.tsx`，將裡面的「測試劇本清單」、「編輯測試劇本」及刪除提示等文字替換為「測試案例」。
- [x] 1.7 修改 `frontend/src/components/custom/GroupTreeNode.tsx` 元件，將載入提示「載入劇本中...」改為「載入測試案例中...」，並將類型標籤「劇本」改為「測試案例」。

## 2. Hooks 與資料流提示修正

- [x] 2.1 修改 `frontend/src/hooks/useTestcaseData.ts` 中的 toast 成功/失敗通知訊息，將其中的「劇本」字眼全部改為「測試案例」。

## 3. 編譯與端到端驗證

- [x] 3.1 在 `frontend` 目錄下執行 `npx tsc --noEmit --project tsconfig.app.json` 與 `npm run lint`，確保無 any 編譯與 Lint 錯誤。
- [x] 3.2 啟動瀏覽器代理人，點選進入各個頁面並進行新增、編輯與執行案例操作，確認所有「劇本」中文字眼皆已被完全替換，且對齊版面與功能正常。
