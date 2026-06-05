## 1. 劇本解析器與 DOM Selector 演算法重構及測試 (Parser & Selector Testing)

- [x] 1.1 建立測試檔案 `tests/parser.test.ts` 與 `tests/browser/selector.test.ts`
- [x] 1.2 建立服務模組 `src/browser/selector.ts`，將原寫死在 `src/browser.ts` evaluate 中的 selector 計算演算法抽離為純函數
- [x] 1.3 修改 `src/browser.ts` 引入並調用 `src/browser/selector.ts` 內的純函數
- [x] 1.4 於 `tests/parser.test.ts` 實作對 `src/parser.ts` 劇本解析與 Zod 欄位校驗的單元測試
- [x] 1.5 於 `tests/browser/selector.test.ts` 實作對 selector 計算與字串引號轉義的單元測試
- [x] 1.6 執行 `npx vitest run tests/parser.test.ts tests/browser/selector.test.ts` 確保測試通過

## 2. 狀態機與任務佇列 FSM 邏輯重構 (Refactoring)

- [x] 2.1 建立服務模組 `src/graph/prompt.ts` 與 `src/graph/router.ts`，抽離狀態機中的 Prompt 拼接與路由方法
- [x] 2.2 建立服務模組 `src/queue/taskFSM.ts`，抽離原本在 `src/queue.ts` 內的任務狀態轉移規則與理由更新
- [x] 2.3 修改 `src/graph.ts` 引入並調用 Prompt / Router 純函數，移除原本內聯的 Prompt 拼接與成員路由方法
- [x] 2.4 修改 `src/queue.ts` 引入並調用 `src/queue/taskFSM.ts`，將資料庫更新替換為狀態機計算出的 payload

## 3. 狀態機與任務 FSM 單元測試實作 (Router & FSM Testing)

- [x] 3.1 建立測試檔案 `tests/graph.test.ts` 與 `tests/queue/taskFSM.test.ts`
- [x] 3.2 於 `tests/graph.test.ts` 針對 Prompt 拼接與條件路由純函數編寫單元測試
- [x] 3.3 於 `tests/queue/taskFSM.test.ts` 針對任務狀態轉移與描述更新邏輯編寫單元測試
- [x] 3.4 執行 `npx vitest run tests/graph.test.ts tests/queue/taskFSM.test.ts` 確保測試通過

## 4. 完整測試套件整合驗證 (Full Run Verification)

- [x] 4.1 本地執行 `npm run test`，驗證所有單元測試檔案（parser、graph、selector、taskFSM、groupService）全部成功通過
