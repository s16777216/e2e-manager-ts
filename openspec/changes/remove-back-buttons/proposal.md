## Why

隨著前端樹狀目錄樹 (Sidebar Group Tree) 與全域麵包屑 (Breadcrumbs) 導航的引入，前端「測試案例詳情」與「執行紀錄監控」頁面頂部的「上一頁 (ChevronLeft)」返回按鈕在功能上已產生重複。全數移除這些按鈕可以進一步簡化頂部 Header 的排版，讓介面呈現更加乾淨的 Bento 極簡美學。

## What Changes

- **移除返回按鈕**：移除 `TestCaseDetailView.tsx` 與 `SSEConsoleView.tsx` 頁面頂部 Header 欄位中的返回按鈕。
- **排版微調**：移除按鈕後，微調 Header 中標題與麵包屑、狀態 Badge 之間的 Flexbox 排版（Gap 距離與 padding），確保視覺比例完美。
- **代碼清理**：清理與返回按鈕相關的 React 狀態（若有）與無用的 Lucide-react `ChevronLeft` 圖示 Import。

## Capabilities

### New Capabilities

- 無

### Modified Capabilities

- `e2e-web-dashboard`: 調整 `TestCaseDetailView` 與 `SSEConsoleView` 的導航佈局，移除 ChevronLeft 返回按鈕，完全依賴樹狀目錄樹與麵包屑進行退回與跳轉。

## Impact

- **受影響前端檔案**：
  - `frontend/src/views/TestCaseDetailView.tsx`
  - `frontend/src/views/SSEConsoleView.tsx`
