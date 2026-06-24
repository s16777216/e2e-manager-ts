# Design: 統一 Task 與 TestRun 的狀態定義

## Architecture Overview
目前系統在測試執行與回報的架構上，狀態流轉如下圖所示：

```
[Trigger Run] ──▶ Create Task (status: "pending")
                        │
                        ▼
                  Create TestRuns (status: "pending")
                        │
                        ▼
                  Queue Runner (Task status ──▶ "running")
                        │
                        ▼
                  Execute TestRuns (Run status: "running" ──▶ "passed" | "failed" | "error")
                        │
                        ▼
                  All Runs Done? ──▶ Update Task Status
                                     (舊: status: "done", finalResult: "PASS" | "FAIL")
                                     (新: status: "passed" | "failed" | "error")
```

透過統一狀態值，我們直接以 `Task.status` 作為該次批次任務的最終結果，簡化了資料與展示邏輯。

## Database Changes
修改 `Task` 實體定義（`backend/src/entities/Task.ts`）：
* 修改 `status` 欄位：其資料庫類型維持 `varchar`，但其 TypeScript 型別與列舉值由 `"pending" | "running" | "done"` 改為 `"pending" | "running" | "passed" | "failed" | "error"`。
* 移除 `finalResult` 欄位。

## Backend Implementation

### 1. 任務佇列與狀態更新 (`backend/src/queue.ts`)
* 修改 `updateTaskProgress` 函數：
  * 原本在 `task.doneCount === task.totalCount` 時，設定 `task.status = "done"` 且依據是否全部通過來設定 `task.finalResult = allPassed ? "PASS" : "FAIL"`。
  * 修改為：若 `task.doneCount === task.totalCount`，若全部通過則 `task.status = "passed"`，否則 `task.status = "failed"`。若在任務啟動或調度過程中發生嚴重異常，則 `task.status = "error"`。
* 修改 SSE 狀態發送的 Payload，將 `finalResult` 欄位移除，改由更新後的 `status` 送往前端。

### 2. 有限狀態機 (`backend/src/queue/taskFSM.ts`)
* 更新 `taskFSM` 內部對狀態轉移的狀態欄位寫入：
  * 移除寫入 `finalResult`，統一改為寫入 `status = "passed" | "failed" | "error"`。

### 3. API 路由 (`backend/src/routes/task.ts` & `run.ts`)
* 更新 `/api/tasks` 及 `/api/tasks/:id` 回傳的 JSON 序列化，移除 `finalResult` 屬性。
* 確保前端接收到的資料結構中，`status` 值能完整表示任務的目前狀況。

## Frontend Implementation

### 1. API 類型定義 (`frontend/src/types/api.ts`)
* 更新 `Task` 介面定義：
  * 移除 `finalResult?: "PASS" | "FAIL" | null;`
  * 將 `status` 修改為：`status: "pending" | "running" | "passed" | "failed" | "error";`

### 2. 共用狀態 Badge 元件 (`frontend/src/components/custom/StatusBadge.tsx`)
在 `components/custom/` 下建立一個共用的狀態渲染元件：
```tsx
import React from "react";
import { CheckCircle, XCircle, Clock, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: "pending" | "running" | "passed" | "failed" | "error";
  className?: string;
  showText?: boolean;
  size?: number;
}

export function StatusBadge({ status, className, showText = true, size = 12 }: StatusBadgeProps) {
  // 元件實作...
}
```

### 3. 視圖重構
* **`History.tsx` (欄位定義)**：
  * 將原本的 `finalResult` 判斷移除，並使用 `<StatusBadge>` 元件作為「結果」欄位的渲染。
  * 更新「進度」與「結果」的篩選/排序顯示。
* **`HistoryView.tsx`**：
  * 將過濾器的 `selectedStatus` 下拉選單從舊的 `done-pass`/`done-fail` 修改為對應的 `passed`/`failed`/`error`/`running` 狀態直接進行過濾。
* **`TaskDetailView.tsx`**：
  * 移除 `renderTaskStatusBadge` 與 `renderRunStatusBadge` 的重複邏輯，全數替換為共用的 `<StatusBadge>` 元件。
  * 調整 Bento 進度看板中的狀態顯示。
* **`TestCaseDetailView.tsx`**：
  * 移除 `renderStatusBadge`，替換為 `<StatusBadge>`。
* **`GroupTreeNode.tsx`**：
  * 移除內建的 `renderStatusBadge`，替換為 `<StatusBadge>`。
* **`SSEConsoleView.tsx`**：
  * 當 `status` 為 `passed` 或 `failed`/`error` 時，顯示頂部的視覺斷言結果卡片。原本判斷 `finalResult` 改為判斷 `status` 是否為結束狀態 (`passed`、`failed`、`error`)。

## Migration Plan
由於資料庫的 `Task` 資料表中既存的舊資料：
* `status` 為 `done`，`finalResult` 為 `PASS`。
* `status` 為 `done`，`finalResult` 為 `FAIL`。

我們需要撰寫一個 Migration 或在應用程式啟動時的初始化腳本中，執行以下 SQL 以升級既有 Task 資料：
```sql
-- 將所有 PASS 任務升級為 passed 狀態
UPDATE task SET status = 'passed' WHERE status = 'done' AND finalResult = 'PASS';

-- 將所有 FAIL 任務升級為 failed 狀態
UPDATE task SET status = 'failed' WHERE status = 'done' AND finalResult = 'FAIL';

-- 如果有任何 done 但沒有 finalResult 的轉為 error
UPDATE task SET status = 'error' WHERE status = 'done' AND finalResult IS NULL;
```
隨後在資料庫綱要中刪除 `finalResult` 欄位。
