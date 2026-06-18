## Why

目前系統在執行測試時使用固定的環境配置與測試步驟。當需要更換網址（如開發環境、測試環境、正式環境）、變更測試帳號或替換測試用測試參數（如密碼、搜尋關鍵字）時，必須手動重複編寫多個測試案例與預置狀態（Cookie / LocalStorage），缺乏重用性。系統需要一套「專案 > 群組 > 測試案例」三層式變數插值系統，以動態替換測試步驟、Cookies、LocalStorage 與預期結果中的預留位置。

## What Changes

- **多層級變數資料庫 Schema 擴充**：於 `Project`、`TestGroup` 與 `Testcase` 三個實體中皆新增 `variables` (jsonb) 欄位，以儲存鍵值對變數（`Record<string, string>`）。
- **後端變數合併與插值引擎**：於測試執行前，自動遞迴載入 `Project -> TestGroup -> Testcase` 變數集並進行淺合併（Shallow Merge，子層同名變數覆蓋父層）。隨後將步驟（Steps）、Cookie（initCookies）、LocalStorage（initLocalStorage）與預期結果（Expected）中所有的 `{{variableName}}` 預留位置，替換為對應的變數真實值。
- **後端 API 傳輸支援**：修改專案、群組、測試案例的建立與更新 API，使後端能正確儲存並回傳 `variables` 資料。
- **前端變數設定配置介面**：在專案編輯、群組編輯、與測試案例對話框中，整合變數鍵值對設定表單，並在步驟、環境設定與預期結果欄位中加上變數引用的 UI 提示。

## Capabilities

### New Capabilities

### Modified Capabilities
- `testcase-management`: 擴充專案、群組與測試案例之資料結構，使其原生支援變數儲存，並在背景任務啟動前實作變數合併與正則表達式插值替換。
- `e2e-web-dashboard`: 修改編輯與建立專案、群組、測試案例 Dialog，新增變數編輯與管理介面，並提示變數引用格式。

## Impact

- **前端核心與 API**：
  - `api.ts` (同步擴充 Project, Group, Testcase 的變數 PATCH 與 POST 請求)
  - `types/api.ts` (同步加入 variables 屬性定義)
- **前端導航與 UI 元件**：
  - `components/custom/EditProjectDialog.tsx` (整合專案級變數編輯表單)
  - `views/ProjectDetailView.tsx` (整合群組級與測試案例建立的變數編輯表單)
  - `views/TestCaseDetailView.tsx` (整合測試案例編輯的變數表單)
