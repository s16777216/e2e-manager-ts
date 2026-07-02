## Why

目前系統的環境變數（Project / Group / Testcase 層級）只支援靜態常數值，每次測試執行時插值結果完全相同。當測試需要唯一識別符（避免帳號名稱衝突）、當前時間（驗證頁面顯示的日期）或隨機數值時，測試人員只能在步驟文字中手動寫死，失去靈活性與可維護性。

## What Changes

- 在插值引擎中新增**內建函式語法** `{{$functionName("arg1", "arg2")}}` 的解析與執行能力
- 提供**時間類**內建函式：`$timestamp()`、`$now(format?)`、`$date()`、`$datetime()`
- 提供**隨機類**內建函式：`$random_int(min?, max?)`、`$random_float(min?, max?)`、`$random_uuid()`、`$random_string(len?)`
- 支援**命名快照 (Named Snapshot)**：在函式的最後一個參數傳入 `"@snapshotKey"` 格式，同一個 TestRun 中相同 snapshotKey 只計算一次並快取，後續呼叫返回相同值
- 內建函式的插值點與靜態變數相同：step action、step expected、initCookies、initLocalStorage

## Capabilities

### New Capabilities

- `builtin-dynamic-variables`: 插值引擎支援內建動態函式呼叫（語法解析、函式執行、命名快照快取），並提供一組預設內建函式庫（時間類、隨機類）

### Modified Capabilities

- `project-variables-persistence`: 現有靜態變數的插值行為不變，但 `interpolateString` / `interpolateObject` 的函式簽名需擴展以傳入 `RunContext`（向下相容，現有呼叫不受影響）

## Impact

- **後端** `backend/src/services/environmentService.ts`：擴展 `interpolateString` 與 `interpolateObject` 的插值邏輯
- **後端** `backend/src/services/builtinFunctions.ts`（新增）：內建函式庫實作
- **後端** `backend/src/queue.ts`：在 `executeJob` 中建立 `RunContext` 並傳遞給所有插值呼叫
- **外部依賴**：考慮引入 `dayjs`（~2KB）以支援彈性日期格式化；若功能需求簡單可考慮手動實作
- **前端**：不需要改動核心邏輯；可選擇性更新 `VariablesEditor.tsx` 的說明文字，提示使用者可輸入內建函式語法
