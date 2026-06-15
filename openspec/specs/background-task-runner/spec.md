# background-task-runner Specification

## Purpose
TBD - created by archiving change serverize-e2e-manager-with-db. Update Purpose after archive.
## Requirements
### Requirement: Queue-based Task Runner with Concurrency Limit
背景任務執行器 SHALL 實作非同步先進先出 (FIFO) 佇列。佇列狀態 MUST 儲存於資料庫的 `test_runs` 表中，且執行器 MUST 使用資料庫交易行級鎖定（如 `FOR UPDATE SKIP LOCKED`）安全地領取任務，確保多個 Worker 平行運作時不會發生重複領取任務的 race condition，且併發執行數限制為 1。Worker MUST 在每個 TestRun 執行完成後，原子性地更新其所屬 Task（若存在）的 `doneCount` 欄位，並在 doneCount 達到 totalCount 時設定 Task.status = "done" 及計算 Task.finalResult，透過 `task_updates` pg_notify 通道發送完成事件。

#### Scenario: Queue task when concurrent runner limit reached
- **WHEN** 系統當前正在執行一個 E2E 測試任務，此時再次觸發新的執行任務
- **THEN** 新的任務寫入資料庫，狀態設為 `pending`，並在佇列中排隊等待，直到先前的任務執行完畢釋放資源

#### Scenario: Worker updates Task progress after TestRun completes
- **WHEN** Worker 完成一個 TestRun 的執行（status 更新為 passed/failed/error），且該 TestRun 的 task 外鍵不為 null
- **THEN** Worker MUST 以原子 SQL 更新 Task.doneCount = doneCount + 1，並透過 task_updates pg_notify 通道發送 progress 事件；若 doneCount 等於 totalCount，則同時設定 Task.status = "done"、計算 finalResult 並發送 completed 事件

### Requirement: Step execution status persistence
在 LangGraph 逐步執行狀態機的生命週期中，執行器 MUST 在每個步驟完成、重試或出錯時，即時更新資料庫中對應 `test_runs` 的目前狀態。執行器 MUST 將步驟截圖存檔為實體檔案，將步驟日誌（包含步驟內容、AI 決策、工具呼叫、結果與截圖路徑）寫入資料庫的 `test_logs` 表中，且 MUST 發送資料庫即時異步通知（如 `NOTIFY` 通道）發佈此步驟事件，以供訂閱者進行即時串流。

#### Scenario: Update progress log and notify instantly after step complete
- **WHEN** LangGraph `stepTrackerNode` 完成當前步驟，存檔步驟截圖檔案，並寫入資料庫 `test_logs` 表
- **THEN** 系統透過資料庫 `NOTIFY` 通道發出步驟完成通知事件，使訂閱該通道的 API 伺服器能即時串流該日誌與截圖路徑

### Requirement: Structured Visual Assertion and Run Completion
在所有步驟執行完畢後，執行器 MUST 呼叫 Gemini 進行結構化視覺斷言判定。判定完成後，系統 MUST 更新任務狀態（`passed` 或 `failed`），確實關閉 Playwright 瀏覽器實例釋放記憶體，並寫入完成時間戳記，且發送任務結束的即時通知。

#### Scenario: Final assertion passes and updates run record
- **WHEN** Gemini 視覺斷言返回 PASS 判定結果與理由
- **THEN** 系統將 `test_runs` 狀態更新為 `passed`，寫入判定理由與結束時間，關閉瀏覽器與 Context，並發佈任務結束的 `NOTIFY` 事件

