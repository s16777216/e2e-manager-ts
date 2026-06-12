## Context

目前前端 `TestCaseDetailView.tsx` 與 `SSEConsoleView.tsx` 頁面頂部 Header 中，皆放置了 `ChevronLeft` 返回按鈕。由於專案已有麵包屑 (Breadcrumbs) 導航且左側樹狀目錄常駐，返回按鈕功能上已屬重複。本設計旨在精簡 Header 的視覺層級，完全依靠麵包屑與目錄樹作為導航出口，實現更清爽的 Bento 極簡 Header 佈局。

## Goals / Non-Goals

**Goals:**
- **移除返回按鈕**：從 `TestCaseDetailView.tsx` 與 `SSEConsoleView.tsx` 移除 `ChevronLeft` 返回按鈕。
- **Header 樣式調整**：調整按鈕移除後的 Flexbox 佈局與 Padding/Gap 距離，確保標題、麵包屑與狀態標誌視覺平衡。
- **Lint 清理**：移除與按鈕相關的無用 import（例如 `ChevronLeft` 圖示）。

**Non-Goals:**
- 不改變專案的路由定義與麵包屑元件實作。
- 不改變專案的 Layout 與 Sidebar 樹狀目錄結構。

## Decisions

### 1. 導航完全交由麵包屑與樹狀目錄接管
我們移除實體返回按鈕，導航退回功能完全由頂部動態麵包屑中的專案與 TestCase 連結、以及左側 GroupTreeNode 的點擊跳轉接管，確保操作順暢且省下 Header 空間。

### 2. 視圖 Header 簡化
- **TestCaseDetailView.tsx**：原本 Header 為：
  ```tsx
  <div className="flex items-center gap-4">
    <Button ...><ChevronLeft /></Button>
    <div><h2 ...>{testcase.name}</h2>...</div>
  </div>
  ```
  簡化為：
  ```tsx
  <div>
    <h2 className="text-xl font-bold tracking-tight text-zinc-100">{isEditing ? "編輯測試案例" : testcase.name}</h2>
    <p className="text-xs font-mono text-zinc-500 mt-1">ID: {testcase.id}</p>
  </div>
  ```
  去除了按鈕容器與對齊 Gap，結構更加單純。
- **SSEConsoleView.tsx**：原本 Header 亦移除了 `<Button ...><ChevronLeft /></Button>`，使標題部分與即時追蹤說明欄位直接呈現在最左側，狀態標誌在最右側。
