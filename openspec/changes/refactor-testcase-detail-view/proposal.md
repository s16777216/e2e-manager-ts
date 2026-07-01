## Why

專案中的 `TestCaseDetailView.tsx` 檔案過於龐大（達 762 行），混合了唯讀檢視、複雜的編輯表單（含步驟列表動態陣列、JSON 編輯器與變數編輯器）以及刪除確認彈窗。此設計違反了專案推動的 Single File Component (SFC) / One Component Per File 的代碼規範。同時，該檔案及多個專案/測試案例領域相關的視圖目前仍存放於舊的 `frontend/src/views/` 遺留目錄下，不符合 Feature-based 的模組化架構。

## What Changes

- 將 `TestCaseDetailView.tsx` 遷移至專案 Features 目錄下的 `frontend/src/features/projects/pages/TestCaseDetailView.tsx`。
- 重構並抽離 `TestCaseDetailView.tsx` 內部的編輯表單，建立獨立元件 `TestCaseEditBlock.tsx`。
- 複用已建立的 `TestCaseDeleteDialog.tsx` 元件，移除頁面中行內的刪除彈窗 DOM 結構。
- 更新 `routes.tsx` 以修正遷移後的視圖引用的相對路徑。
- 安全清除已被棄用且未被引用的遺留視圖 `GroupDashboardView.tsx`。

## Capabilities

### New Capabilities
- `testcase-detail-refactor`: 重構測試案例詳情視圖，優化結構並落實單一檔案元件 (SFC) 開發規範。

### Modified Capabilities
<!-- 無需求變更 -->
