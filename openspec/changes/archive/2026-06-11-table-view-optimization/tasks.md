## 1. 專案首頁表格化與篩選功能

- [x] 1.1 修改 `frontend/src/views/ProjectsView.tsx`，將原有的 Bento Grid 卡片列表替換為 `<table>` 表格結構。
- [x] 1.2 在 `ProjectsView.tsx` 內加入搜尋 input 及排序 config 的 React state。
- [x] 1.3 實作專案名稱搜尋與各個欄位（如「最後執行時間」、「劇本數量」）的升降冪排序邏輯。

## 2. 目錄樹 Tree Table 重構

- [x] 2.1 修改 `frontend/src/components/custom/GroupTreeNode.tsx` 與 `ProjectDetailView.tsx`，將原先單一欄位的 Tree View 改寫為支援 Tree Table 的列（Row）渲染結構。
- [x] 2.2 實作 Tree Table 的扁平化資料轉換邏輯，並確保群組節點展開與收合時，表格列能平滑地進行插入與移除。
- [x] 2.3 在 Tree Table 橫向欄位中，加入類型（群組/劇本）、子項目/步驟數、以及最後執行狀態（Passed/Failed）的渲染與對齊。

## 3. 執行歷史表格化重構

- [x] 3.1 修改 `frontend/src/views/TestCaseDetailView.tsx` 歷史紀錄 Tab，將原有的卡片列表重構為 HTML `<table>` 結構。
- [x] 3.2 表格橫向欄位包含：執行編號（支援短 UUID 與跳轉連結）、狀態（Badge）、啟動時間、執行耗時、最終審查結論與操作。
- [x] 3.3 加入 Row hover 動效與點擊整行直接轉導至 SSE 即時/歷史 Console 的行為。

## 4. 編譯與端到端驗證

- [x] 4.1 執行 `npx tsc --noEmit --project tsconfig.app.json` 與 `npm run lint`，確保無編譯與 Lint 錯誤。
- [x] 4.2 啟動伺服器，於瀏覽器中驗證三個表格的排序、過濾、Tree Table 展開收合及跳轉流程是否完美運作。
