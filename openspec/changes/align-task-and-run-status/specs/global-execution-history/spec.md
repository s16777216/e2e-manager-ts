## MODIFIED Requirements

### Requirement: Global History Statistics and Filters
全域執行紀錄頁面上方 MUST 提供篩選控制項，支援依「專案名稱」與「執行結果狀態」進行即時前端過濾。統計指標看板（Bento 磨砂玻璃設計、執行總次數、成功率、當前執行中任務數）MUST 移除，不再顯示。篩選控制項維持下拉選單形式，過濾邏輯在傳入 DataTable 前由 View 層的 `Array.filter()` 處理，不使用 TanStack 的 globalFilter。篩選的狀態選項 MUST 與變更後的 Task 統一狀態一致（包含 passed、failed、error、running、pending）。

#### Scenario: Filter tasks by project and status
- **WHEN** 使用者從下拉選單選擇特定專案或特定狀態（如 passed、failed、error、running、pending）時
- **THEN** 表格將立即過濾只顯示符合篩選條件的任務列表
