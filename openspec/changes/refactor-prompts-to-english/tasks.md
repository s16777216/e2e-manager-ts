## 1. 重構步驟決策提示詞 (Executor Prompt)

- [ ] 1.1 於 `src/graph.ts` 的 `executorNode` 節點中，將 `system_prompt` 字串常數修改重構為全英文 (English Core)
- [ ] 1.2 於英文 System Prompt 中，加入對工具調用的強烈約束，包含防重複操作、強制要求目標達成時立刻呼叫 `finish_step`，以及防重複導航的邏輯定義

## 2. 重構視覺斷言提示詞 (Asserter Prompt)

- [ ] 2.1 於 `src/graph.ts` 的 `asserterNode` 節點中，將 `system_prompt` 字串常數修改重構為全英文 (English Core)
- [ ] 2.2 確保斷言提示詞中明確說明預期結果（expected）與最終網頁截圖的比對邏輯，引導其透過 Zod 準確進行 PASS/FAIL 判定

## 3. 功能驗證與測試

- [ ] 3.1 於本地執行命令 `npx tsx src/main.ts tests/search_test.json` 執行維基百科測試案例
- [ ] 3.2 查閱生成報告中「逐步執行歷程與截圖」日誌，驗證步驟 2 中輸入文字的 `input_text` 工具不再被 AI 重複呼叫，且流程順暢收斂
- [ ] 3.3 確保測試報告 `report.md` 生成無誤且為 PASS 狀態
