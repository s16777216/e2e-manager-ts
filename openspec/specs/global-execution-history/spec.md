# global-execution-history Specification

## Purpose
TBD - created by archiving change global-history-view. Update Purpose after archive.
## Requirements
### Requirement: Global Task Execution History Table
系統 MUST 提供一個跨專案的全域批次任務執行歷史列表，以 shadcn DataTable 組件呈現（使用 `@tanstack/react-table` + `components/ui/table.tsx`）。表格欄位 MUST 包含：任務 ID（前綴 `#` 的短雜湊）、所屬專案名稱、觸發範圍（專案、群組、單一案例）、執行進度（已完成個數 / 總個數）、建立時間、Token 消耗以及結果狀態 Badge。視覺風格 MUST 使用 shadcn 預設主題，不覆蓋 zinc 色號。

#### Scenario: Display global task list
- **WHEN** 使用者進入全域「執行紀錄」頁面且系統載入成功時
- **THEN** 前端將以 shadcn DataTable 形式，依據 `createdAt` 時間由近到遠（降冪）列出所有批次執行任務，並顯示正確的專案名稱與進度狀態

#### Scenario: Navigate to task monitor detail
- **WHEN** 使用者在執行紀錄表格中點擊任一任務行（Row）時
- **THEN** 前端 MUST 將畫面轉導至該任務的詳情監控頁面 `/project/:projectId/tasks/:taskId`

### Requirement: Global History Statistics and Filters
全域執行紀錄頁面上方 MUST 提供篩選控制項，支援依「專案名稱」與「執行結果狀態」進行即時前端過濾。統計指標看板（Bento 磨砂玻璃設計、執行總次數、成功率、當前執行中任務數）MUST 移除，不再顯示。篩選控制項維持下拉選單形式，過濾邏輯在傳入 DataTable 前由 View 層的 `Array.filter()` 處理，不使用 TanStack 的 globalFilter。

#### Scenario: Filter tasks by project and status
- **WHEN** 使用者從下拉選單選擇特定專案或特定狀態（如 PASS、FAIL、RUNNING）時
- **THEN** 表格將立即過濾只顯示符合篩選條件的任務列表

