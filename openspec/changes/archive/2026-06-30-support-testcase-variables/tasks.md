## 1. 後端實體與資料庫擴充

- [x] 1.1 修改 `backend/src/entities/Project.ts`，新增 `variables` 欄位（`jsonb`，預設為空物件 `{}`）
- [x] 1.2 修改 `backend/src/entities/TestGroup.ts`，新增 `variables` 欄位（`jsonb`，預設為空物件 `{}`）
- [x] 1.3 修改 `backend/src/entities/Testcase.ts`，新增 `variables` 欄位（`jsonb`，預設為空物件 `{}`）
- [x] 1.4 啟動後端伺服器，使 TypeORM 自動同步並更新 PostgreSQL 欄位

## 2. 後端合併與插值解析實作

- [x] 2.1 實作 `mergeVariables(projectVars, groupVars, tcVars)` 鍵值對淺合併工具函數，確保子層變數能正確覆蓋父層
- [x] 2.2 實作 `interpolateString(template, variables)` 正則表達式替換函式，將 `{{variableName}}` 替換為變數值
- [x] 2.3 實作 `interpolateObject(obj, variables)` 遞迴替換函式，用以處理字串陣列或巢狀 JSON 物件（步驟、Cookie、LocalStorage）
- [x] 2.4 修改 `backend/src/queue.ts` 的執行引擎，在測試啟動前加載繼承鏈並執行插值替換，將替換後的資料傳遞給 Playwright 與 AI Agent

## 3. API 路由修改與型別同步

- [x] 3.1 修改 `backend/src/routes/project.ts`、`group.ts`、`testcase.ts`，在 POST 與 PATCH 路由中接收並儲存 `variables` 欄位
- [x] 3.2 擴充前端 API 型別定義 `frontend/src/types/api.ts` 中的 `Project`、`TestGroup`、`Testcase`，同步加入 `variables` 屬性定義
- [x] 3.3 修改前端 `api.ts` 中相關請求，確保 `variables` 參數能夠正確傳遞與保存

## 4. 前端變數設定 UI 元件與 Dialog 整合

- [x] 4.1 在 `frontend/src/components/custom/` 目錄建立共用的 `VariablesEditor.tsx` 元件，提供鍵值對動態表單的編輯、新增與刪除操作
- [x] 4.2 於 `components/custom/EditProjectDialog.tsx` 中整合 `VariablesEditor` 元件，提供專案級變數編輯 (註：整合至對應之 ProjectForm)
- [x] 4.3 於 `views/ProjectDetailView.tsx` 的「建立測試案例對話框」與「建立/編輯群組對話框」中整合 `VariablesEditor` 元件 (註：整合至對應之 NewSubgroupDialog)
- [x] 4.4 於 `views/TestCaseDetailView.tsx` 的編輯模式表單中整合 `VariablesEditor` 元件，提供測試案例級變數編輯
- [x] 4.5 在前端 Dialog 各對應輸入框（步驟、Cookie、預期結果）加上變數引用的格式提示與說明

## 5. 驗收與整合測試

- [x] 5.1 驗收於專案、群組、測試案例不同層級設定同名變數時，執行測試能夠正確依 `Project -> Group -> Testcase` 優先權順序覆蓋
- [x] 5.2 驗收步驟、Cookie、LocalStorage 與預期結果中所有的 `{{key}}` 預留位置，皆能於執行時被正確替換為真實值
- [x] 5.3 驗收遇到未定義變數時，系統能正常運作並保留原預留位置，且於 TestLog 中顯示警告

## 6. Variables v2 - Shadcn Dialog & Description Refactoring

- [x] 6.1 擴充 `backend/src/services/environmentService.ts` 中的 `mergeVariables` 以支援物件格式變數（value & description）的合併，並相容舊版字串格式
- [x] 6.2 修改 `backend/src/queue.ts`，在進行變數插值替換前先將合併變數解析為扁平的 `Record<string, string>` 型別
- [x] 6.3 更新 `frontend/src/types/api.ts` 與 `frontend/src/lib/api.ts` 的 `variables` 參數與屬性型別定義為 `Record<string, { value: string; description?: string }>`
- [x] 6.4 重構 `frontend/src/components/custom/VariablesEditor.tsx` 元件，移除摺疊收合功能，改為全展開 Shadcn Item 項目清單 + Dialog 新增/編輯彈窗（支援名稱、值、描述欄位）
- [x] 6.5 修正並補齊 `backend/tests/services/environmentService.test.ts` 的 `mergeVariables` 單元測試，以驗證物件格式變數的合併與相容性
- [x] 6.6 執行測試與建置校驗，確保系統無 TypeScript 型別與編譯錯誤，驗證變數 v2 運作正常

