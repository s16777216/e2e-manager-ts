## Context

系統目前基於 LangGraph 與 Playwright 執行 E2E 測試，使用 `gemini-3.1-flash-lite` 作為核心的決策 Agent（Executor）與視覺斷言（Asserter）。
目前每一次測試執行的 LLM Token 消耗量皆未被記錄，這使得我們無法評估 AI 測試成本，亦無法評估 Prompt 優化前後的 Token 節省效益。

## Goals / Non-Goals

**Goals:**
- 在 `TestLog`（步驟 Action 日誌）與 `TestRun`（測試執行紀錄）的資料庫 Entity 中，新增記錄 Prompt / Completion / Total Token 的欄位。
- 在 LangGraph 的 `executorNode` 節點中，攔截 `ChatGoogleGenerativeAI` 決策回傳的 `usage_metadata`，並寫入該 Action 的 `TestLog`。
- 在 `asserterNode` 節點中，藉由設定 `includeRaw: true` 以取得視覺斷言的 Token 消耗，並寫入 `TestRun`。
- 在後端 `stepTrackerNode` 中，藉由 `pg_notify` 的 JSON 廣播將 Token 即時傳遞給前端，並同步更新 `/api/runs/:runId` 介面。
- 前端在 Console 畫面上展示每個 Step 的累計 Token 消耗量，並在 Hover 步驟標頭時顯示 Prompt/Generation 分群 Tooltip。
- 前端在 History 歷史紀錄列表中，展示每次 Run 的總 Token 消耗。

**Non-Goals:**
- 本次設計不包含在後端換算實體美金費用，亦不對 API 進行匯率維護。
- 本次設計不包含針對 Token 超額的自動熔斷或阻斷執行的邏輯。

## Decisions

### 1. 將 Token 欄位直接內嵌於 TestLog 與 TestRun 資料表
- **決策說明**：我們選擇直接在 `TestLog` 及 `TestRun` 中增加欄位，而非建立一個獨立的 `TokenUsage` 關聯表。
- **理由**：每次 AI Action 對應一筆 `TestLog`（由單次 `executorNode` 的 `invoke` 產生），而視覺斷言對應一個 `TestRun` 的結束。直接加欄位可以避免多表 Join 的查詢開銷，且資料存取與維護非常直觀。
- **備選方案**：獨立的 `TokenUsage` table。缺點是會增加資料庫結構複雜度，在此簡單場景下並無必要。

### 2. 視覺斷言模型啟用 `includeRaw: true`
- **決策說明**：使用 `ChatGoogleGenerativeAI.withStructuredOutput` 時，必須指定第二個參數為 `{ includeRaw: true }`。
- **理由**：預設情況下，結構化輸出只會返回解析後的物件（如 `{ result: "PASS", reason: "..." }`），這會把 LangChain 的 `AIMessage`（包含 `usage_metadata`）完全過濾掉。只有啟用 `includeRaw: true`，我們才能在保留 Zod schema 校驗的好處下，同時存取原始 message 來獲取 Token 數據。

### 3. 前端進行「步驟級別 (Step-level)」的 Token 累加
- **決策說明**：後端日誌 `TestLog` 記錄的是 Action 層級（單次推理的動作），而前端 UI 是以步驟 `stepIdx` 進行分群折疊的。我們決定在前端的 `groupLogsByStep` 函數中將同一個 `stepIdx` 底下的所有 Log 消耗 Token 進行加總。
- **理由**：這使得後端不需要為「步驟累加」維護額外的狀態，能繼續保持 Hono SSE 廣播的輕量，並將統計渲染交給 React 處理。

## Risks / Trade-offs

- **[風險]**: `withStructuredOutput` 的 `includeRaw: true` 會將 `asserter_model.invoke(messages)` 的回傳型別從 `AssertionResult` 改變為 `{ parsed: AssertionResult, raw: AIMessage }`。如果忘記修改後續的屬性取用，會引發 TypeScript 編譯錯誤與執行期崩潰。
  - **[對策]**: 在 [graph.ts](file:///c:/works/e2e-manager-ts/backend/src/graph.ts) 中重構 `asserterNode`，將原本的 `assertion_result` 讀取邏輯調整為 `structuredResponse.parsed`，並在編譯時確認無任何 TypeScript type error。
- **[風險]**: 資料庫欄位變更可能因為 PostgreSQL 內無對應欄位，而導致 Server 啟動失敗。
  - **[對策]**: 目前專案在開發環境中使用 TypeORM 的 `synchronize: true` 設定，修改 Entity 後重啟 Hono server 會自動同步欄位。我們也將手動確認資料庫表結構，若有需要，將重新啟動或清除舊資料以利 schema 更新。
