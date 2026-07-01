## Context

`TestCaseDetailView.tsx` 是一個大型視圖元件，用以展示測試案例步驟與執行歷史，並包含完整的編輯與刪除流程。目前該頁面存在於舊的 `views/` 目錄中，且內部包含了龐大的行內 HTML/JSX 表單代碼與局部狀態，維護難度高。

## Goals / Non-Goals

**Goals:**
- 將 `TestCaseDetailView.tsx` 搬移至 Feature 模組架構的 `features/projects/pages/` 中。
- 將編輯表單邏輯與狀態抽離至 `TestCaseEditBlock.tsx`。
- 複用已建立的 `TestCaseDeleteDialog.tsx` 進行刪除確認。
- 更新 `routes.tsx` 以適配搬移後的元件路徑。

**Non-Goals:**
- 不對測試案例執行的後端 API 做任何異動。
- 不修改與測試步驟執行日誌顯示 (`SSEConsoleView`) 或批次任務 (`TaskDetailView`) 的內部渲染邏輯。

## Decisions

### 1. 拆分編輯表單為 `TestCaseEditBlock`
- **方案**：將編輯狀態（步驟列表動態增減、JSON 欄位校驗、變數編輯）完全封裝在獨立元件中。
- **理由**：這使得主詳情視圖頁面僅需在 `isEditing === true` 時載入該 Block，大幅提升主元件的乾淨度，並減少重新渲染（re-renders）的範圍。

### 2. 複用 `TestCaseDeleteDialog`
- **方案**：直接 import `features/projects/components/TestCaseDeleteDialog.tsx`。
- **理由**：避免重寫相同的對話框 UI 與文字校驗邏輯，並確保刪除體驗在專案詳情頁面與案例詳情頁面完全一致。

## Risks / Trade-offs

- **[Risk]** 搬移檔案可能導致與其他視圖或 loaders 之間的相對路徑引用失效。
  - **Mitigation**：利用 Vite / TypeScript 靜態編譯與 `npm run build` 作全面檢查，確保路徑引用的正確性。
