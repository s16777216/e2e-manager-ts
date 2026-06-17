## Context

系統在每次觸發 E2E 測試任務時，Playwright 都會重新建立全新的無痕 `BrowserContext`，這使得每一次測試都會重置登入與狀態標記。本設計文件旨在藉由擴充 `Testcase` 資料欄位，在瀏覽器導航至首頁之前，靜態且精準地注入 Cookie 與 LocalStorage 資訊，從而繞過重複的登入流程，加速測試流程並節省 API 費用。

## Goals / Non-Goals

**Goals:**
- 在 PostgreSQL 的 `testcase` 資料表中新增 `initCookies` (jsonb) 與 `initLocalStorage` (jsonb) 屬性。
- 在後端 [queue.ts](file:///c:/works/e2e-manager-ts/backend/src/queue.ts) 的 Playwright 啟動流程中，串接 addCookies 與 addInitScript 邏輯。
- 於前端的建立與編輯測試案例 Dialog 中，增加摺疊面板（Accordion），支援對預置狀態進行 JSON 編寫。
- 在前端儲存前提供 JSON 語法有效性校驗，避免因語法錯誤導致執行端崩潰。

**Non-Goals:**
- 不向 Gemini AI Agent 提供可用於動態設定 Cookie/LocalStorage 的 Tools（如 `set_cookie` 等），僅實作測試啟動時的靜態預置。

## Decisions

### 1. LocalStorage 的注入時間點與機制
- **決定**：使用 Playwright 的 `context.addInitScript(fn, arg)` 來執行注入。
- **理由**：LocalStorage 與當前 Domain (Origin) 嚴格綁定。若瀏覽器處於 `about:blank` 時直接執行 `page.evaluate()` 寫入，會因為沒有 Origin 而報錯；若是導航至首頁後再寫入，又可能會因為網頁已載入完成，而錯過前端應用程式在 mount 時對 Token 的讀取。`addInitScript` 能夠在網頁文件建立後、其內部任何腳本執行前，優先將 Key-Value 寫入 localStorage，是目前最穩健的時機點。

### 2. 進階設定 UI 表單形式
- **決定**：於新增/編輯 Dialog 中，加入一個手動摺疊的 Accordion 組件（名為「進階環境設定」），內部放置兩個 JSON Textarea 控制項。
- **理由**：因大眾使用者一般僅需填寫步驟與預期結果，預置狀態屬於進階功能。使用摺疊面板能避免主 Dialog 顯得擁擠，維持簡單乾淨的 Bento 設計哲學。

## Risks / Trade-offs

- **[Risk] 使用者輸入無效 JSON 導致後端處理或 Playwright 執行失敗。**
  - **[Mitigation]** 前端在點擊「儲存測試案例」時，若「進階環境設定」內有文字輸入，則強制在前端進行 `JSON.parse` 校驗。若捕獲 Error，則不發送 API 請求並跳出 Sonner Toast 錯誤警告。
