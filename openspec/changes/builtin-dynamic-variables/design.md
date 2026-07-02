## Context

E2E Manager 的插值引擎（`environmentService.ts`）目前使用單一正則表達式 `/\{\{([^}]+)\}\}/g` 掃描模板字串，並以靜態 `variables` 表做鍵值查找。系統已在 Project / Group / Testcase 三層建立了繼承式變數合併機制，但所有變數值都是在資料庫儲存時確定的靜態常數。

測試步驟如 `"建立帳號 {{username}}"` 目前只能靠事先設定的固定值執行，無法在每次 run 時動態產生唯一值。

## Goals / Non-Goals

**Goals:**
- 在不破壞現有靜態變數行為的前提下，擴展插值引擎支援 `{{$functionName("arg")}}` 語法
- 提供時間類與隨機類的內建函式庫
- 支援命名快照（Named Snapshot），確保同一 TestRun 內同一快照鍵只計算一次
- 與現有的 `interpolateObject`、Cookies/LocalStorage 插值管線整合

**Non-Goals:**
- 不支援使用者自訂函式（User-defined Functions）
- 不實作完整運算式求值（算術、條件判斷等）
- 不修改前端 VariablesEditor 的核心互動邏輯（UI 只新增提示說明）
- 不處理函式的非同步執行（所有內建函式均為同步）

## Decisions

### 決策 1：插值引擎擴展策略 — 選項 A（Inline 分流）

**選擇**：在 `interpolateString` 的正則替換回呼中，判斷 `{{...}}` 內容是否以 `$` 開頭，若是則解析為函式呼叫；否則走現有靜態查表邏輯。

**替代方案考慮**：
- *選項 B（預展開）*：執行前先掃描模板找出所有 `$fn()` 並求值，結果塞進 `flatVariables`。優點是不需改 regex；缺點是需要掃描兩遍，且命名快照的作用域難以保證跨模板一致性。
- *選項 C（完整 Parser）*：建立 AST 解析器。過度設計，不值得現在投入。

**選擇 A 的理由**：改動最小，命名快照的 `RunContext` 可自然流入單一呼叫路徑，向下相容性好。

---

### 決策 2：函式參數解析

**格式規格**：所有參數必須用雙引號包裹（`"arg"`），以逗號分隔。

```
{{$random_int("1", "100")}}       ✅
{{$random_int(1, 100)}}           ❌ 不支援
{{$random_uuid("@account_id")}}   ✅ 最後一個參數若以 @ 開頭則為快照鍵
```

**參數解析器**：手動實作簡單的 quoted-string 分割器，不引入額外的解析庫。

---

### 決策 3：命名快照的作用域

快照以 `RunContext.snapshots: Map<string, string>` 儲存，`RunContext` 在 `queue.ts` 的 `executeJob()` 開頭建立，傳給該 run 的所有 interpolation 呼叫。

- 快照僅在**同一 TestRun** 內有效
- 不同 run 之間完全隔離
- 快照鍵為字串，大小寫敏感（`@User` ≠ `@user`）

---

### 決策 4：日期格式化依賴

**選擇**：引入 `dayjs`（gzip 後約 2KB，無額外依賴）。

**理由**：`$now("YYYY-MM-DD HH:mm:ss")` 需要完整的格式字串支援。手動實作僅能覆蓋有限 token，且需要自行處理時區，不划算。`dayjs` 是業界標準輕量方案。

**替代方案**：`Intl.DateTimeFormat`（瀏覽器原生，但 API 不支援任意格式字串）。

---

### 決策 5：函式簽名與 RunContext 傳遞

`interpolateString` 與 `interpolateObject` 新增可選的 `context?: RunContext` 參數，置於 `onUndefined` 之前。現有所有呼叫若不傳 `context` 仍可正常運作（不會有快照，但函式仍能執行，只是每次都重新計算）。

```typescript
interface RunContext {
  snapshots: Map<string, string>;
}

function interpolateString(
  template: string,
  variables: Record<string, string>,
  context?: RunContext,          // 新增（可選）
  onUndefined?: (varName: string) => void
): string
```

## Risks / Trade-offs

| 風險 | 緩解策略 |
|------|----------|
| `$fn()` 語法與現有變數名稱衝突（若有人用 `$xxx` 作為變數名） | `$` 前綴在現有系統中未被使用；若發生衝突則函式優先，靜態變數次之，文件說明此規則 |
| 命名快照跨 step 不一致（step 1 快照、step 2 拿到不同值） | `RunContext` 在整個 `executeJob` 生命週期共享，天然解決此問題 |
| 日期格式字串錯誤導致 `$now("invalid")` 崩潰 | `evalBuiltinCall` 加 try-catch，錯誤時返回空字串並呼叫 `onUndefined` 回呼 |
| `dayjs` 版本升級破壞格式字串行為 | 鎖定 `dayjs` 版本於 `package.json`，升級需手動驗證 |

## Migration Plan

此功能為純加法，不涉及資料庫 schema 變更或既有 API 修改：
1. 新增 `builtinFunctions.ts` 與 `RunContext` 型別
2. 擴展 `environmentService.ts`（向下相容）
3. 更新 `queue.ts` 傳入 `RunContext`
4. 無需 migration script；無需停機部署

## Open Questions

- `dayjs` 是否需要 timezone plugin（`dayjs/plugin/timezone`）？若使用者在非 UTC+8 環境部署，`$now()` 是否應返回 server local time 還是 UTC？
  - **暫定**：返回 server local time，符合大多數使用者預期；如需 UTC 可用 `$timestamp()` 轉換
