## Context

系統在每次觸發 E2E 測試任務時，Playwright 都會重新建立全新的無痕 `BrowserContext`，這使得每一次測試都會重置登入與狀態標記。為了避免不同測試案例重複設定登入資訊以及 Session 過期時的維護痛點，本設計導入 **「專案 > 群組 > 測試案例」** 的層級繼承與合併機制，在瀏覽器啟動時，將合併後的 Cookie 與 LocalStorage 靜態且精準地注入，從而大幅提升測試效率與系統維護性。

## Goals / Non-Goals

**Goals:**
- 在 PostgreSQL 的 `project`、`test_group` 與 `testcase` 資料表中，皆新增 `initCookies` (jsonb) 與 `initLocalStorage` (jsonb) 欄位。
- 在後端 [queue.ts](file:///c:/works/e2e-manager-ts/backend/src/queue.ts) 的 Playwright 啟動流程中，計算測試案例的繼承鏈，進行 Cookie 與 LocalStorage 的合併：
  * **Cookie 合併**：以 Cookie 的 `name` 與 `domain` 為唯一鍵，若子層有同名 Cookie，則覆蓋父層；否則併入。
  * **LocalStorage 合併**：將 JSON 物件進行淺合併（Shallow Merge），子層同名 Key 覆蓋父層。
- 在前端的專案編輯 Dialog、群組建立/編輯 Dialog、以及測試案例 Dialog 中，增加摺疊面板（Accordion）支援 JSON 格式輸入。
- 前端在儲存前提供 JSON 格式校驗。

**Non-Goals:**
- 不提供動態寫入 API（如執行中動態改變 Cookie），僅在啟動瀏覽器時進行靜態預置與合併注入。

## Decisions

### 1. 繼承與合併邏輯的實作
* **邏輯**：
  * 後端在獲取要執行的 `Testcase` 時，會同時加載其隸屬的 `TestGroup`（包括遞迴的父群組 `parentId` 鏈）以及所屬的 `Project`。
  * **Cookie 合併函式**：
    ```typescript
    function mergeCookies(parent: any[], child: any[]) {
      const map = new Map();
      parent.forEach(c => map.set(`${c.name}:${c.domain || ""}`, c));
      child.forEach(c => map.set(`${c.name}:${c.domain || ""}`, c));
      return Array.from(map.values());
    }
    ```
  * **LocalStorage 合併函式**：
    ```typescript
    function mergeLocalStorage(parent: object, child: object) {
      return { ...parent, ...child };
    }
    ```
  * 合併順序：`Project ──▶ Parent Group ──▶ Child Group ──▶ Testcase`。

### 2. 注入時機
* **Cookie**：使用 Playwright 的 `context.addCookies(mergedCookies)` 於 context 初始化後直接注入。
* **LocalStorage**：使用 `context.addInitScript` 在文件載入前同步寫入 `window.localStorage`，避免錯過前端應用掛載時的 Token 讀取。
  ```typescript
  context.addInitScript((data) => {
    Object.entries(data).forEach(([key, val]) => {
      window.localStorage.setItem(key, typeof val === "string" ? val : JSON.stringify(val));
    });
  }, mergedLocalStorage);
  ```

## Risks / Trade-offs

- **[Risk] 當繼承鏈過長或 JSON 格式損壞，導致執行端報錯。**
  - **[Mitigation]**
    * 資料庫使用 `jsonb` 類型，從資料庫層級保證寫入的資料一定是合法 JSON。
    * 後端加載並合併時，使用 try-catch 包裹，若有格式異常或解析失敗，則在 TestRun 記錄中標註 `error` 並中止該次執行。
