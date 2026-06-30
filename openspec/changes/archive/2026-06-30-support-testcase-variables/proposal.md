## Why

目前系統在執行測試時使用固定的環境配置與測試步驟。當需要更換網址（如開發環境、測試環境、正式環境）、變更測試帳號或替換測試用測試參數（如密碼、搜尋關鍵字）時，必須手動重複編寫多個測試案例與預置狀態（Cookie / LocalStorage），缺乏重用性。系統需要一套「專案 > 群組 > 測試案例」三層式變數插值系統，以動態替換測試步驟、Cookies、LocalStorage 與預期結果中的預留位置。

## What Changes

- **多層級變數資料庫 Schema 擴充**：於 `Project`、`TestGroup` 與 `Testcase` 三個實體中皆新增 `variables` (jsonb) 欄位，以儲存變數物件對應表（型別改為 `Record<string, { value: string; description?: string }>`，並實作舊版純字串變數的向後相容）。
- **後端變數合併與插值引擎**：於測試執行前，自動遞迴載入 `Project -> TestGroup -> Testcase` 變數集並進行淺合併（Shallow Merge）。隨後將步驟、Cookie、LocalStorage 與預期結果中所有的 `{{variableName}}` 替換為變數真實值。未定義之變數保持原樣並記錄警告。
- **後端 API 傳輸支援**：修改專案、群組、測試案例的建立與更新 API，使後端能正確儲存並回傳包含 `description` 的 `variables` 資料。
- **前端變數設定配置介面**：重新設計 `VariablesEditor`，改為全展開的 UI（取消摺疊收合）。已設定變數改為 Shadcn Item 清單式列出，並整合 Shadcn `Dialog` 彈窗來進行變數的「新增」與「編輯」（支援設定名稱、變數值與描述欄位）。

## Capabilities

### New Capabilities

### Modified Capabilities
- `testcase-management`: 擴充變數儲存結構，支援變數值與描述屬性，並在背景任務啟動前實作雙格式相容變數合併與插值替換。
- `e2e-web-dashboard`: 重新設計變數編輯 UI，將原有的摺疊多輸入框列表重構為全展開 Shadcn 項目清單 + Dialog 編輯彈窗，追加變數描述欄位。

## Impact

- **前端核心與 API**：
  - `api.ts` (同步擴充 Project, Group, Testcase 的變數 PATCH 與 POST 請求參數型別)
  - `types/api.ts` (更新 variables 屬性型別定義為 `Record<string, { value: string; description?: string }>`)
- **前端導航與 UI 元件**：
  - `components/custom/VariablesEditor.tsx` (重構為全展開清單 + Dialog 彈窗編輯器，支援名稱、變數值與描述欄位)
  - `components/custom/ProjectForm.tsx` (對接新版變數資料結構)
  - `components/custom/NewSubgroupDialog.tsx` (對接新版變數資料結構)
  - `views/ProjectDetailView.tsx` (對接新版變數資料結構)
  - `views/TestCaseDetailView.tsx` (對接新版變數資料結構)
