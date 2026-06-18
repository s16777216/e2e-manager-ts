## Context

目前系統在執行測試時使用靜態配置。如果想在不同環境、角色或測試參數下跑相同的測試案例，現有架構必須重複建立測試案例。為此，我們設計了一套多層級的「變數插值系統」，允許使用者在專案、群組、測試案例三個層級自訂 `variables` 鍵值對。在 Playwright 啟動並交付任務前，後端執行器會自動完成合併，並將變數替換套用至步驟、預期結果與環境設定中。

## Goals / Non-Goals

**Goals:**
- 在 PostgreSQL 的 `project`、`test_group`、`testcase` 資料表中新增 `variables` (jsonb) 欄位（TypeScript 型別為 `Record<string, string>`，預設為空物件 `{}`）。
- 於後端實作變數遞迴合併演算法：`Project ──▶ Parent Group ──▶ Child Group ──▶ Testcase`。子層同名變數覆蓋父層。
- 於後端實作字串插值解析演算法，支援以 `{{variableName}}` 預留位置進行正則表達式全局替換。
- 在 E2E 執行引擎 [queue.ts](file:///c:/works/e2e-manager-ts/backend/src/queue.ts) 中，於測試啟動前，對 Testcase 的 `steps` 陣列、`expected`、`initCookies`、`initLocalStorage` 內容同步進行插值替換。
- 於前端提供簡易的 `variables` 鍵值對編輯表格，整合於專案、群組與測試案例的編輯對話框中。

**Non-Goals:**
- 不支援變數的動態計算或執行期修改，僅實作啟動時的靜態插值替換。
- 不提供複雜的表達式求值（如 `{{ a + b }}` 或 `{{ if (x) ... }}`），僅支援單純的變數鍵值直接映射替換。

## Decisions

### 1. 變數插值替換的時機點
- **決策**：在 `queue.ts` 的 `executeJob` 任務中，從資料庫加載 Testcase 並計算完合併變數後，**在將資料傳遞給 Playwright Context 以及 AI Agent 步驟列表的前一刻**，在記憶體中執行字串替換，並使用替換後的純字串值去啟動執行。
- **考量**：
  * 對 AI Agent 而言，它看見的步驟將是替換後的具體文字（例如 `輸入帳號 admin_test`），不需要理解 `{{username}}` 預留位置。
  * 對 Playwright 而言，注入的 Cookie / LocalStorage 已經是具體的 Session Token，不會因為變數格式錯誤而導致瀏覽器初始化報錯。
  * 歷史紀錄中依然會存有原本帶有 `{{variableName}}` 的模板設定，方便維護。

### 2. 前端鍵值對編輯 UI 設計
- **決策**：在 Dialog 中新增「變數設定」摺疊面板。內部提供一個動態表單：
  * 每列包含「變數名稱 (Key)」與「變數值 (Value)」兩個輸入框。
  * 提供「新增變數」與「刪除」按鈕。
  * 儲存時，前端將其轉換為 JSON 物件 `{ "key": "value" }` 發送給 API。
- **考量**：比起讓使用者直接手動編寫 JSON，這種鍵值對輸入介面更不容易出錯，且對一般使用者更友善。

## Risks / Trade-offs

- **[Risk] 當變數被循環引用，或者引用的變數未定義時，導致執行中斷。**
  - **[Mitigation]**
    * 變數不支援嵌套引用（即變數值中不能再包含 `{{anotherVar}}`）。
    * 在後端正則替換時，若遇到未定義的變數（如 `{{undefinedVar}}`），後端會保持其預留位置 `{{undefinedVar}}` 原樣不動，並照常發送執行，避免拋出崩潰 Error。同時在 TestLog 中印出警告提示。
