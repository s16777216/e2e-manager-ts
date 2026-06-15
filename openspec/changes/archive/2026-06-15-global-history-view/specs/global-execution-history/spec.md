## ADDED Requirements

### Requirement: Global Task Execution History Table
系統 MUST 提供一個跨專案的全域批次任務執行歷史列表。此列表需展示所有批次任務，欄位 MUST 包含：任務 ID（前綴 `#` 的短雜湊）、所屬專案名稱、觸發範圍（專案、群組、單一案例）、執行進度（已完成個數 / 總個數）、建立時間以及結果狀態 Badge。

#### Scenario: Display global task list
- **WHEN** 使用者進入全域「執行紀錄」頁面且系統載入成功時
- **THEN** 前端將以表格形式，依據 `createdAt` 時間由近到遠（降冪）列出所有批次執行任務，並顯示正確的專案名稱與進度狀態

#### Scenario: Navigate to task monitor detail
- **WHEN** 使用者在執行紀錄表格中點擊任一任務行（Row）時
- **THEN** 前端 MUST 將畫面轉導至該任務的詳情監控頁面 `/project/:projectId/tasks/:taskId`

### Requirement: Global History Statistics and Filters
全域執行紀錄頁面上方 MUST 提供 Bento 磨砂玻璃設計的統計指標看板與篩選控制項。統計指標 MUST 包括：執行總次數、成功率、當前執行中任務數。篩選控制項 MUST 支援依「專案名稱」與「執行結果狀態」進行即時前端過濾。

#### Scenario: Display stats indicators
- **WHEN** 載入執行紀錄頁面時
- **THEN** 系統將即時計算所有任務並渲染出對應的總次數、成功率（以 PASS 占已完成 Task 的比例計算）以及執行中狀態數量

#### Scenario: Filter tasks by project and status
- **WHEN** 使用者從下拉選單選擇特定專案或特定狀態（如 PASS、FAIL、RUNNING）時
- **THEN** 表格將立即過濾只顯示符合篩選條件的任務列表
