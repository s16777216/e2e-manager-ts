## Why

目前系統執行 E2E 測試時，瀏覽器每次都會以乾淨的無痕模式啟動。如果測試案例需要驗證「登入後」或「帶有特定 Session/Token」的頁面，AI Agent 必須在每次執行時都重新跑一次繁雜的登入互動，這不僅大幅增加了測試耗時，也因重複調用 LLM 而產生額外的 Token 消耗。

此問題若僅在個別測試案例（Testcase）上設定預置狀態，會導致當登入 Session 過期時，使用者必須逐一手動修改多個測試案例。因此，系統需要一組優雅的「繼承與合併機制」，支援在專案（Project）、群組（TestGroup）以及測試案例（Testcase）三個層級統一或覆蓋地設定環境資訊。

## What Changes

- **多層級資料庫 Schema 擴充**：於 `Project`、`TestGroup` 與 `Testcase` 三個實體皆新增 `initCookies` (jsonb) 與 `initLocalStorage` (jsonb) 欄位。
- **後端繼承與合併引擎**：在測試啟動時，Playwright 執行器會沿著 `Project > TestGroup > Testcase` 的層級鏈，對 Cookie 與 LocalStorage 進行遞迴合併（子層的同名 Cookie / LocalStorage Key 會覆蓋父層）。
- **後端 API 傳輸支援**：修改專案、群組、測試案例的建立與更新 API，使後端能正確儲存並回傳這兩個預置欄位的值。
- **前端預置表單介面**：在專案首頁、群組設定、以及測試案例編輯對話框中，整合「進階環境設定」摺疊面板，提供 JSON 格式編輯輸入框與格式驗證。

## Capabilities

### New Capabilities

### Modified Capabilities
- `testcase-management`: 擴充專案、群組與測試案例之資料結構，使其原生支援初始化 Cookie 與 LocalStorage 的資料欄位，並實作繼承合併邏輯。
- `e2e-web-dashboard`: 在前端專案詳情、群組與測試案例 Dialog 中，新增進階環境設定表單以對接 API 的 Cookie 與 LocalStorage 設定。

## Impact

- **前端核心與 API**：
  - `api.ts` (封裝 Project, Group, Testcase 的 PATCH 與 POST 請求)
  - `useProjectData.ts` (更新與刪除 handler)
- **前端導航與 UI 元件**：
  - `views/ProjectDetailView.tsx` (整合專案與群組的編輯/進階設定入口)
  - `components/custom/EditProjectDialog.tsx` (提供專案級 JSON 預置)
  - `components/custom/GroupTreeNode.tsx` (提供群組級 JSON 預置)
  - `views/TestCaseDetailView.tsx` (提供測試案例級 JSON 預置)
