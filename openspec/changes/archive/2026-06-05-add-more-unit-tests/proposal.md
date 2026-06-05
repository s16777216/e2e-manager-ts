## Why

專案中的劇本解析器（`src/parser.ts`）、狀態機控制與路由（`src/graph.ts`）、DOM 定位器 Selector 演算法（`src/browser.ts`）以及任務佇列狀態轉移（`src/queue.ts`）皆包含大量業務純邏輯。然而，這些邏輯目前與外部 I/O（如 Playwright 瀏覽器沙盒、TypeORM PostgreSQL 連線）高度耦合，導致無法進行輕量、高效的單元測試保護。為了保障專案的長期健壯性，必須將這些模組解耦抽離為純函數，並建立全面的單元測試網。

## What Changes

- **劇本解析器驗證**：新增單元測試檔 `tests/parser.test.ts`，針對 Zod 劇本驗證模組進行多場景（包含完整劇本、必填欄位缺失、空 steps 陣列等）的單元測試。
- **狀態機解耦重構**：將狀態機中的「Prompt 拼接」與「條件路由邏輯」抽離至獨立純函數模組 `src/graph/prompt.ts` 與 `src/graph/router.ts`，並新增單元測試檔 `tests/graph.test.ts`。
- **DOM 定位器解耦重構**：將 `src/browser.ts` 的 Selector 拼接計算演算法抽離至 `src/browser/selector.ts`，並新增單元測試檔 `tests/browser/selector.test.ts`。
- **任務狀態機解耦重構**：將 `src/queue.ts` 中任務的「狀態與理由轉換規則」抽離為獨立的純有限狀態機（FSM） `src/queue/taskFSM.ts`，並新增單元測試檔 `tests/queue/taskFSM.test.ts`。

## Capabilities

### New Capabilities
- `ts-parser-and-router-testing`: 為 Zod 劇本解析器與 LangGraph 狀態機條件路由添加單元測試保障。
- `ts-browser-and-queue-testing`: 為 DOM 定位 Selector 演算法與任務佇列狀態機轉換添加單元測試保障。

### Modified Capabilities
<!-- Existing capabilities whose REQUIREMENTS are changing. Leave empty if no requirement changes. -->

## Impact

- **程式碼變更**：
  - `src/graph.ts`：移除內聯的 Prompt 拼接與成員路由方法，改為引入並調用 `src/graph/prompt.ts` 與 `src/graph/router.ts`。
  - `src/browser.ts`：將內聯的 selector 計算逻辑替換為調用 `src/browser/selector.ts`。
  - `src/queue.ts`：將內置的任務更新屬性轉換替換為調用 `src/queue/taskFSM.ts`。
  - `src/graph/prompt.ts` [NEW]、`src/graph/router.ts` [NEW]、`src/browser/selector.ts` [NEW]、`src/queue/taskFSM.ts` [NEW]。
- **新增測試檔案**：
  - `tests/parser.test.ts` [NEW]
  - `tests/graph.test.ts` [NEW]
  - `tests/browser/selector.test.ts` [NEW]
  - `tests/queue/taskFSM.test.ts` [NEW]
