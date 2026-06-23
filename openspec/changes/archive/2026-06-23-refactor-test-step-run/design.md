## Context

在目前的系統架構中，測試步驟執行沒有對應的資料庫實體。後端在執行測試時直接在 `TestLog` 表中寫入帶有 `stepIdx` 和 `stepDescription` 的日誌，前端則拉取扁平日誌列表後在記憶體中動態分群。這導致了資料冗餘、無法精確記錄單個步驟的執行狀態（如單步時間、單步成敗），也使錯誤判定邏輯變得很模糊。

## Goals / Non-Goals

**Goals:**
- 新增 `TestRunStep` 資料庫實體，用於精確表達單個測試步驟在某次執行中的狀態。
- 正規化資料庫，將 `TestLog` 中的 `stepIdx`、`stepDescription` 移除，改為關聯至 `TestRunStep`。
- 修改後端圖執行邏輯（`stepTrackerNode` 與 `reporterNode`），改為結構化的步驟與日誌寫入。
- 重構 API `/api/runs/:runId`，使其回傳巢狀的步驟列表（包含其下關聯的日誌）。
- 重構前端 UI，直接依據後端回傳的結構化步驟資料進行渲染，移除前端記憶體分群計算。

**Non-Goals:**
- 不修改靜態測試案例 `Testcase` 元件的 `steps` 字串陣列定義。
- 不修改 `Project`、`TestGroup`、`Task` 實體的資料庫結構。

## Decisions

### 1. 新增與重構資料庫實體 (Entities)

* **新實體：`TestRunStep`**
  - `id`: UUID (Primary)
  - `stepIdx`: `integer`（步驟索引，如 0, 1, 2...）
  - `stepDescription`: `text`（步驟描述字串）
  - `status`: `varchar`（狀態，`pending` | `running` | `passed` | `failed` | `error`）
  - `screenshotData`: `bytea` (nullable, 儲存步驟結束或失敗時的截圖)
  - `promptTokens`, `completionTokens`, `totalTokens`: `integer`（單步 Token 消耗統計）
  - `run`: ManyToOne 關聯至 `TestRun`
  - `logs`: OneToMany 關聯至 `TestLog`

* **重構實體：`TestLog`**
  - 移除：`stepIdx`, `stepDescription`, `screenshotData` (截圖下沉至步驟層級，避免重複)
  - 新增：`step`: ManyToOne 關聯至 `TestRunStep`

* **重構實體：`TestRun`**
  - 新增：`steps`: OneToMany 關聯至 `TestRunStep`

---

### 2. 後端執行與寫入邏輯 (graph.ts)
* **單步開始時**：
  在 `executorNode` 執行之初，先在資料庫中為當前 `current_step_idx` 建立一筆 `TestRunStep`，狀態設為 `running`（若已存在則不重複建立），並透過 `pg_notify` 廣播 `event: "step_status"`。
* **單步成功結束時 (`stepTrackerNode`)**：
  - 讀取當前步驟的 `TestRunStep`。
  - 將當前步驟的所有 `logs` 關聯並儲存至 `TestLog`。
  - 將步驟完成後的截圖儲存至 `TestRunStep.screenshotData` 中。
  - 將該步驟的狀態更新為 `passed`。
  - 計算 Token 消耗並更新步驟與 `TestRun`。
  - 廣播更新通知。
* **測試失敗中斷時 (`reporterNode`)**：
  - 讀取當前未完成步驟的 `TestRunStep`，將其狀態更新為 `failed`。
  - 將最終失敗截圖 `screenshotFailBuffer` 儲存至該步驟的 `TestRunStep.screenshotData` 中。
  - 將暫存的所有日誌寫入資料庫並與該 `TestRunStep` 進行關聯。
  - 廣播更新通知。

---

### 3. API 與 SSE 串流重構
* **API：`/api/runs/:runId`**
  - 重構回傳結構，其中 `logs` 欄位將被替換為 `steps` 巢狀陣列：
    ```json
    {
      "runId": "uuid",
      "status": "failed",
      "steps": [
        {
          "id": "step-uuid",
          "stepIdx": 0,
          "stepDescription": "進入首頁",
          "status": "passed",
          "screenshotUrl": "/api/steps/step-uuid/screenshot",
          "totalTokens": 120,
          "logs": [
            { "id": "log-uuid", "action": "navigate_to", "result": "已導航" }
          ]
        }
      ]
    }
    ```
* **SSE 廣播事件**：
  - `event: "step_status"`：步驟狀態改變（例如新建步驟、狀態改為 passed/failed）。
  - `event: "log"`：新增某個步驟下的操作日誌。
  - `event: "completed"`：整場測試結束。

---

### 4. 前端 UI 重構
* 移除 `frontend/src/lib/logUtils.ts` 中的 `groupLogsByStep` 函數。
* 重構 `StepAccordion` 與 `StepCard`，直接接收後端 API 回傳的 `TestStep` 結構，並根據 `step.status` 渲染狀態圖示（CheckCircle2, XCircle, Loader2）。
* 重構 `useSSEStream` Hook，當收到 `step_status` 事件時，動態新增或更新步驟狀態；收到 `log` 事件時，將日誌 append 到對應 `stepIdx` 的步驟之下。

## Risks / Trade-offs

* **[Risk] 舊資料不相容**：資料表變動（移除 `TestLog` 中的 `stepIdx` 等）會導致既有的歷史執行紀錄在讀取時出錯。
  * **[Mitigation]** 由於是 Prototype 開發階段，可在資料庫啟動初始化時自動同步結構並清空舊紀錄，或是透過一個簡單的 migration 腳本將舊資料遷移。
