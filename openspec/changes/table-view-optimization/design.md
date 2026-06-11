## Context

當前應用程式有三個核心區域使用不夠整合的 UI 呈現方式：
1. **專案首頁**：使用 Bento 卡片排列。在專案數多時不便檢索。
2. **目錄導航樹**：使用單一欄位的 Tree View，無法在樹狀結構上直接對照子項目數量或該劇本最後執行狀態。
3. **劇本執行歷史**：以垂直日誌卡片流水帳展示，資訊不對齊且不便按時間或耗時排序。

本設計將這三個主要模組優化為嚴謹的 Table（表格）與 Tree Table（樹狀表格）形式，保留原有的暗色 IDE 高級感及微動畫，並大幅提升橫向屬性比對的能力。

## Goals / Non-Goals

**Goals:**
- **專案表格化與篩選**：將 `ProjectsView.tsx` 改為表格展現，支援即時搜尋關鍵字過濾，以及按最後執行時間或專案名稱排序。
- **樹狀表格化（Tree Table）**：將 `ProjectDetailView.tsx` 左側導航樹升級為樹狀表格，展示項目名稱、類型、子項目/步驟數、以及最後執行狀態。
- **歷史紀錄表格化**：將 `TestCaseDetailView.tsx` 的執行歷史紀錄改為 Table 展示，清晰對齊各欄位，並支援點擊列直接跳轉。

**Non-Goals:**
- 不在此變更中變更後端 API 的資料庫欄位或型別，所有多維度屬性（如專案下的群組/劇本數，或步驟數）均利用現有的 API 資料結構在前端計算得出。

## Decisions

### 1. 專案列表表格 (Projects Table) 設計
- **結構**：使用 HTML `<table>` 配合 CSS grid/flex，使其外觀完美契合 Bento 與 IDE 質感。
- **功能**：
  - 前端以 React state 維持 `filterQuery` 與 `sortConfig: { key: string, direction: 'asc' | 'desc' }`。
  - 當欄位（如「最後執行時間」）標頭被點選時，動態對 projects 資料進行前端排序。

### 2. 樹狀表格 (Groups Tree Table) 的扁平化渲染與層級對齊
傳統 Tree View 使用遞迴渲染子元件。在 Tree Table 中，為了保持標準的 `<table>` `<tr>` 結構，我們在前端將樹狀結構進行扁平化處理：
- **扁平化轉換**：遍歷整個 `groupTree`，將其轉換為一維陣列 `FlatTreeRow[]`：
  ```typescript
  interface FlatTreeRow {
    id: string;
    name: string;
    type: 'group' | 'testcase';
    depth: number;
    isExpanded: boolean;
    hasChildren: boolean;
    itemCount?: number; // 子項目或步驟數
    lastStatus?: string; // 僅劇本有值 (passed / failed / error / pending)
  }
  ```
- **展開與收折**：當點選群組時，更新 `expandedGroups` 狀態。在下一次渲染時，重新執行扁平化，隱藏折疊群組下的所有子行。
- **縮排視覺線**：第一欄「名稱」依據 `depth` 設定 `paddingLeft`，並利用 CSS 虛線或引導圖示，優雅地表現樹狀層級架構。

### 3. 執行歷史表格 (Run History Table) 設計
- **結構**：在 `TestCaseDetailView` 的 History Tab 下建立 `<table>` 元件。
- **欄位細節**：
  - **執行編號**：渲染為前綴 `#` 的 8 碼短 UUID（如 `#a8f12c`），並帶有跳轉連結。
  - **狀態**：使用對應顏色的 Badge。
  - **啟動時間**：使用 `new Date(run.createdAt).toLocaleString()` 格式化。
  - **執行耗時**：若測試已完成，計算 `finishedAt` 與 `createdAt` 的毫秒差值並轉換為秒數（如 `12s`）；若執行中則顯示「-」。
  - **最終審查報告**：截取 `finalReason` 的前 25 個字，並在 hover 時以 tooltip 或彈窗展示完整內容。
- **動效**：表格的 row (`<tr>`) 加入 `hover:bg-muted/40 transition-colors` 效果，使滑鼠懸停時具有高度互動反饋。
