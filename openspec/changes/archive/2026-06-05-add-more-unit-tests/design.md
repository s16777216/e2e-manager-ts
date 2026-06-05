## Context

在前一次變更中，專案已經成功引入了 Vitest 測試框架。本次變更的目標是為專案中四個關鍵的純邏輯模組進行解耦重構與擴展單元測試：
1. **劇本解析器 (`src/parser.ts`)**：負責讀取並使用 Zod 強制驗證劇本 JSON 欄位。
2. **狀態機條件路由與 Prompt (`src/graph.ts`)**：控制整個 AI Agent 的執行流轉、中斷與提示詞拼接。
3. **DOM Selector 計算演算法 (`src/browser.ts`)**：負責在瀏覽器端提取網頁互動元素的定位 CSS Selector。
4. **任務佇列有限狀態機 (`src/queue.ts`)**：負責對任務狀態、時間戳記與失敗原因進行業務轉換。

這些模組目前缺乏單元測試保護，急需透過依賴注入與邏輯拆分進行解耦，以實現無外部 I/O 依賴的高效單元測試。

## Goals / Non-Goals

**Goals:**
- 為 Zod 劇本驗證模組編寫單元測試。
- 解耦狀態機的 Prompt 拼接與條件路由，分別抽離至獨立模組，並編寫單元測試。
- 解耦 DOM 定位 Selector 計算演算法，抽離至 `src/browser/selector.ts`，並編寫測試。
- 解耦任務佇列狀態轉移，抽離為獨立有限狀態機 `src/queue/taskFSM.ts`，並編寫測試。
- 測試過程中不得發起任何真實的 Gemini API 請求，亦不得開啟真實的 Playwright 瀏覽器或發起實際 SQL 連線。

**Non-Goals:**
- 本次變更不包含對狀態機節點內部核心執行邏輯（如 `executorNode` 內部 LLM 的推理決策）的整合測試。
- 僅在解耦所需範圍內修改 `src/graph.ts`、`src/browser.ts` 與 `src/queue.ts`，不變動系統現有的任何外部 API 行為。

## Decisions

### 1. 模擬劇本檔案系統讀取
- **決定**：測試 `parseTestCase` 時，在測試 setup 中向臨時目錄（如 `scratch/`）動態寫入測試 JSON 檔案，執行解析驗證，並在 teardown 中將其刪除。
- **理由**：這能靈活模擬各種損壞的 JSON 格式（如格式損壞、欄位缺失），而不需要依賴專案現有的實體劇本檔案，維持測試的獨立性。

### 2. 狀態機 Prompt 拼接與路由邏輯解耦重構
- **決定**：將原寫死在 `src/graph.ts` 內的 Prompt 拼接語句與路由成員方法，分別抽離為獨立的純函數模組 `src/graph/prompt.ts` 與 `src/graph/router.ts`。
- **理由**：如此一來，測試路由與 Prompt 時**完全不需要實例化 `E2EGraphBuilder`**，從而免去了 Mock `BrowserManager`、`ChatGoogleGenerativeAI` 與資料庫的大量成本，測試將轉化為 100% 的純函數驗證，且在無 API 金鑰的 CI/CD 環境下運行亦無任何初始化崩潰風險。

### 3. DOM Selector 演算法解耦重構
- **決定**：將原寫死在 `src/browser.ts` 的 evaluate JS 中的定位器 Selector 拼接演算法，抽離為獨立的純函數 `src/browser/selector.ts` 中的 `calculateSelector`。
- **理由**：Selector 定位邏輯是關鍵的 DOM 解析演算法，抽離為獨立模組後，Node.js 端的單元測試可以直接對多種標籤與帶有引號的字串進行極速單元測試。

### 4. 任務狀態機轉換 FSM 解耦重構
- **決定**：將寫死在 `src/queue.ts` 的任務狀態更新細節與時間、理由拼裝，抽離為獨立的有限狀態機 `src/queue/taskFSM.ts`。
- **理由**：狀態機狀態轉換規則屬於核心的業務邏輯，將其與 TypeORM PostgreSQL I/O 隔離後，我們能在沒有任何資料庫連線的情形下，對任務超時、崩潰、啟動、成功等狀態流轉 payload 進行 100% 的純邏輯驗證。

---

## Risks / Trade-offs

- **[Risk] 重構導致狀態機節點呼叫錯誤** → *[Mitigation]*：修改 `src/graph.ts` 的導入，改由調用這兩個純函數模組。藉由 TypeScript 的靜態型別與既有的 CLI 測試來做功能性驗收。
- **[Risk] FSM 狀態移轉在 TypeORM 中對應錯誤** → *[Mitigation]*：我們使用嚴格的 TypeScript 介面定義（如 `TaskStateUpdate`）來保證傳遞給 TypeORM `set()` 的 payload 與資料庫欄位類型 100% 吻合。
