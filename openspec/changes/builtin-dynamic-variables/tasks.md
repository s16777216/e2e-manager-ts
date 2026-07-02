## 1. 依賴與型別基礎

- [ ] 1.1 安裝 `dayjs` 依賴：在 `backend/package.json` 新增 `dayjs`，並執行 `npm install`
- [ ] 1.2 在 `backend/src/services/environmentService.ts` 定義並匯出 `RunContext` interface：`{ snapshots: Map<string, string> }`

## 2. 內建函式庫

- [ ] 2.1 建立 `backend/src/services/builtinFunctions.ts`，定義 `BuiltinFn` 型別：`(args: string[], context?: RunContext) => string`
- [ ] 2.2 實作時間類函式：`$timestamp(unit?)`, `$now(format?)`, `$date()`, `$datetime()`
- [ ] 2.3 實作隨機類函式：`$random_int(min?, max?)`, `$random_float(min?, max?)`, `$random_uuid()`, `$random_string(len?)`
- [ ] 2.4 建立 `BUILTIN_FUNCTIONS` map，將所有函式名稱對應到實作
- [ ] 2.5 實作 `parseBuiltinCall(expr: string)` 解析器：從 `$fn("a","b","@snap")` 解析出 `{ name, args, snapshotKey }`
- [ ] 2.6 實作 `evalBuiltinCall(name, args, snapshotKey, context?)` 函式，處理命名快照邏輯（先查 `context.snapshots`，未命中則執行函式並存入快照）

## 3. 插值引擎擴展

- [ ] 3.1 更新 `interpolateString` 的函式簽名，新增可選的 `context?: RunContext` 參數（放在 `onUndefined` 之前）
- [ ] 3.2 更新 `interpolateString` 的正則表達式，使其能同時匹配 `{{$fn(args)}}` 與 `{{varName}}` 兩種模式
- [ ] 3.3 在 `interpolateString` 的替換回呼中，加入 `$` 前綴分流邏輯：若為函式呼叫則呼叫 `evalBuiltinCall`，否則走現有靜態查表邏輯
- [ ] 3.4 更新 `interpolateObject` 的函式簽名，傳遞 `context` 至遞迴呼叫的 `interpolateString`

## 4. 執行管線整合

- [ ] 4.1 在 `backend/src/queue.ts` 的 `executeJob` 函式開頭建立 `RunContext`：`const runContext: RunContext = { snapshots: new Map() }`
- [ ] 4.2 更新 `queue.ts` 中所有 `interpolateObject` 呼叫（cookies、localStoage），傳入 `runContext`
- [ ] 4.3 更新 `queue.ts` 中所有 `interpolateString` 呼叫（step action、step expected、testcase expected），傳入 `runContext`

## 5. 前端說明更新（可選）

- [ ] 5.1 在 `frontend/src/components/custom/VariablesEditor.tsx` 的 Dialog 說明文字中，新增「可使用內建函式，例如 `{{$random_uuid()}}`、`{{$timestamp()}}`」的提示

## 6. 驗證

- [ ] 6.1 手動測試：在 Testcase step 中輸入 `{{$random_uuid()}}` 並執行，確認每次 run 產生不同 UUID
- [ ] 6.2 手動測試：在兩個步驟中使用 `{{$random_uuid("@uid")}}` 並執行，確認同一 run 中兩個步驟取得相同 UUID
- [ ] 6.3 手動測試：在步驟中輸入 `{{$timestamp()}}` 並執行，確認輸出為 Unix 時間戳（秒）
- [ ] 6.4 手動測試：在步驟中輸入 `{{$now("YYYY-MM-DD")}}` 並執行，確認輸出為當天日期
- [ ] 6.5 手動測試：確認現有靜態變數 `{{api_key}}` 等在更新後仍正常運作（向下相容驗證）
- [ ] 6.6 手動測試：在步驟中輸入 `{{$random_int("1", "100")}}` 並執行多次，確認輸出在 [1, 100] 之間
