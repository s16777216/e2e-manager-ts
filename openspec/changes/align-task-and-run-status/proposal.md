# Proposal: 統一 Task 與 TestRun 的狀態定義

## Summary
本變更旨在將系統中「批次任務 (Task)」與「單次測試案例執行 (TestRun)」的狀態值（Status）進行統一。雙方將共同使用一組明確的狀態集：`pending`、`running`、`passed`、`failed`、`error`，並移除原先 Task 專屬的 `done` 狀態與 `finalResult` 欄位。

## Problem
目前系統將 Task 與 TestRun 的狀態與結果分開處理：
* **Task**: `status` 為 `pending` \| `running` \| `done`；最終結果存於 `finalResult` (`PASS` \| `FAIL` \| `null`)。
* **TestRun**: `status` 為 `pending` \| `running` \| `passed` \| `failed` \| `error`。

這種分歧導致了以下問題：
1. **邏輯冗餘**：後端在 Task 完成時需同時更新 `status` 為 `done` 並寫入 `finalResult`。
2. **前端維護成本高**：多個視圖（HistoryView, TaskDetailView, TestCaseDetailView, GroupTreeNode）為了在 UI 上渲染狀態圖示，必須針對 Task 與 TestRun 分別撰寫多套 switch-case 邏輯。
3. **概念不一致**：無法直觀地透過單一狀態屬性得知 Task 最終是成功還是失敗，必須同時比對兩個欄位。

## Proposed Solution
將 Task 與 TestRun 的狀態統一。Task 的生命週期直接映射至與 TestRun 相同的狀態集：
* 進行中：`running`
* 排隊中：`pending`
* 全部成功完工：`passed`
* 包含失敗案例完工：`failed`
* 引擎嚴重出錯或逾時：`error`

此方案的好處：
* **精簡資料表**：可安全移除 Task 實體的 `finalResult` 欄位。
* **統一 UI 元件**：前端可抽離出單一的 `<StatusBadge>` 元件，輸入狀態字串即可渲染一致的視覺。
* **簡化狀態機與 API**：簡化 FSM 更新邏輯，提升狀態流轉的維護性。

## Scope
### In Scope
* 修改後端資料庫 `Task` 實體與 Migration。
* 修改後端 `queue.ts`、`taskFSM.ts` 以及相關路由中有關 Task 狀態的寫入與回傳邏輯。
* 更新前後端 API 的型別定義。
* 重構前端 `HistoryView`、`TaskDetailView`、`GroupTreeNode` 及 `TestCaseDetailView` 的狀態渲染與過濾邏輯。
* 在前端建立共用的狀態 Badge 元件。

### Out of Scope
* 修改 TestRun 既有的狀態類型。
* 修改測試執行引擎底下的 LLM 視覺斷言演算法本身。
