## 1. 重構步驟決策提示詞 (Executor Prompt)

- [x] 1.1 於 `backend/src/graph/prompt.ts` 中，將 `buildExecutorSystemPrompt` 的中文提示詞重構為全英文 (English Core)
- [x] 1.2 於英文 System Prompt 中，加入對工具調用的強烈約束，包含防重複操作、強制要求目標達成時立刻呼叫 `finish_step`，以及防重複導航的邏輯定義

## 2. 重構視覺斷言提示詞 (Asserter Prompt)

- [x] 2.1 於 `backend/src/graph/prompt.ts` 中，將 `buildAsserterSystemPrompt` 的中文提示詞重構為全英文 (English Core)
- [x] 2.2 確保斷言提示詞中明確說明預期結果（expected）與最終網頁截圖的比對邏輯，引導其透過 Zod 準確進行 PASS/FAIL 判定

## 3. 功能驗證與測試

- [x] 3.1 本地啟動雙端服務 (Vite + Hono)，或於後端單獨執行測試命令：`npx tsx backend/src/main.ts backend/tests/search_test.json`
- [x] 3.2 於前端 Web 儀表板（或後端日誌）中，驗證 AI 執行測試步驟時，不再重複呼叫相同的工具，且流程順暢收斂
- [x] 3.3 確保在儀表板 Console 中，測試狀態成功渲染為 Passed，且最終視覺斷言結論與各步驟截圖皆能順利加載

