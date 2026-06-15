## MODIFIED Requirements

### Requirement: Queue-based Task Runner with Concurrency Limit
背景任務執行器 SHALL 實作非同步先進先出 (FIFO) 佇列。佇列狀態 MUST 儲存於資料庫的 `test_runs` 表中，且執行器 MUST 使用資料庫交易行級鎖定（如 `FOR UPDATE SKIP LOCKED`）安全地領取任務，確保多個 Worker 平行運作時不會發生重複領取任務的 race condition，且併發執行數限制為 1。Worker MUST 在每個 TestRun 執行完成後，原子性地更新其所屬 Task（若存在）的 `doneCount` 欄位，並在 doneCount 達到 totalCount 時設定 Task.status = "done" 及計算 Task.finalResult，透過 `task_updates` pg_notify 通道發送完成事件。

#### Scenario: Queue task when concurrent runner limit reached
- **WHEN** 系統當前正在執行一個 E2E 測試任務，此時再次觸發新的執行任務
- **THEN** 新的任務寫入資料庫，狀態設為 `pending`，並在佇列中排隊等待，直到先前的任務執行完畢釋放資源

#### Scenario: Worker updates Task progress after TestRun completes
- **WHEN** Worker 完成一個 TestRun 的執行（status 更新為 passed/failed/error），且該 TestRun 的 task 外鍵不為 null
- **THEN** Worker MUST 以原子 SQL 更新 Task.doneCount = doneCount + 1，並透過 task_updates pg_notify 通道發送 progress 事件；若 doneCount 等於 totalCount，則同時設定 Task.status = "done"、計算 finalResult 並發送 completed 事件
