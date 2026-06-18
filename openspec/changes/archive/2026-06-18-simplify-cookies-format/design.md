## Context

原有的 `initCookies` 設計為 Playwright 原生的 Cookie 陣列物件格式（包含 name, value, domain, path 等完整屬性），在 UI 配置上極為累贅。現計改為更精簡以網域路徑為 Key 的 JSON 分組物件格式，並於後端進行合併與 Playwright 規格轉換。

## Goals / Non-Goals

**Goals:**
- 將前端 Cookie 的編輯與 API 傳輸格式簡化為 `Record<string, Record<string, string>>` 物件。
- 後端實作二層深度合併（Deep Merge）算法，確保多層級繼承時同網域下的 Cookie 能部分覆蓋且保留其它 Key。
- 後端在 Playwright context 啟動時，自動解析 Key-Value 結構並還原為 Playwright 的 Cookie 物件陣列進行注入。
- 100% 通過 TypeScript 型別檢查與後端單元測試。

**Non-Goals:**
- 不變更 PostgreSQL 的 Table Schema（因為原本就是 `jsonb` 欄位，可以直接保存新的 JSON 格式）。
- 不支援在 UI 端配置複雜的 Cookie 細部屬性（如 httpOnly, secure, expires, sameSite 等，這些在還原時統一帶入安全預設值）。

## Decisions

### 1. 雙層分組 JSON 結構設計
採用以「網域與路徑」作為第一層 Key，內部包裹該網域下的 Cookie Key-Value 物件：
```json
{
  "localhost/": {
    "session_id": "123"
  }
}
```
* **決策理由**：兼具了 `Record<string, unknown>` 的極簡格式（前端驗證可用同一套邏輯），又保留了跨網域與跨路徑綁定的必要能力。

### 2. 二層深度合併 (Deep Merge)
在 `environmentService.ts` 中，對同網域（Key）下的兩個物件進行淺合併，覆蓋同名的 Cookie 名稱。
* **決策理由**：若僅使用一層 Shallow Merge，子群組設定 `"localhost/": { "token": "child" }` 將會把父群組整個 `"localhost/"` 物件（包含其他 Cookie 如 `"theme": "dark"`) 覆蓋掉，這不符合繼承與多層級覆蓋的預期。

### 3. 解析與還原演算法
在後端注入 Playwright 時，透過字串切割提取 `domain` 與 `path`：
* 去除開頭可能存在的協定頭（如 `http://`, `https://`）。
* 以第一個 `/` 為界，左邊為 `domain`，右邊為 `path`（預設 `path = "/"`）。
* 轉換為 `Playwright.Cookie` 物件：
  ```typescript
  {
    name: name,
    value: String(value),
    domain: domain,
    path: path
  }
  ```

## Risks / Trade-offs

- **[Risk] 使用者填寫無效的 Key (例如: "invalid-domain-name")**
  - **Mitigation**：如果 Key 沒有 `/`，預設將整個 Key 當作 `domain`，並帶上預設的 `path = "/"`。另外，前端編輯時，會進行 JSON 物件的格式基本校驗。
