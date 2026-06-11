## ADDED Requirements

### Requirement: TestCase Details and Edit View
系統 MUST 為每個測試案例提供獨立的詳細資訊與編輯頁面。該頁面 MUST 提供 Steps (步驟) 與 History (歷史執行紀錄) 分頁（Tabs）。在 Steps 分頁中，使用者 SHALL 可以檢視、編輯劇本名稱與預期結果，並且能動態新增、修改或刪除個別執行步驟。

#### Scenario: Manage and save testcase steps
- **WHEN** 使用者在測試案例詳情頁的 Steps 分頁編輯名稱、預期結果並點擊「新增下一步」新增自然語言步驟後保存
- **THEN** 前端將修改後的測試案例資料傳送至 API `/api/testcases/:id` 進行儲存，並提示儲存成功，頁面同步更新最新步驟

### Requirement: TestCase Run History List
系統 MUST 在測試案例的 History 分頁中，列出該測試案例過去的所有執行任務。列表 MUST 顯示每次執行的狀態、啟動時間與結束時間，點擊特定任務 SHALL 可 navigate 跳轉至對應的即時監控 Console 頁面。

#### Scenario: View past runs and navigate
- **WHEN** 使用者點擊進入 History 分頁，且該測試案例存在歷史執行資料
- **THEN** 前端展示所有歷史執行卡片，並在點擊其中一筆執行紀錄時，將頁面導航至 `/project/:projectId/run/:runId`
