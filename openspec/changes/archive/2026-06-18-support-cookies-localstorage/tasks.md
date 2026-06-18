## 1. 後端實體與資料庫擴充

- [x] 1.1 修改 `backend/src/entities/Project.ts`，新增 `initCookies` 與 `initLocalStorage` 欄位（皆為 `jsonb`，允許為空）
- [x] 1.2 修改 `backend/src/entities/TestGroup.ts`，新增 `initCookies` 與 `initLocalStorage` 欄位（皆為 `jsonb`，允許為空）
- [x] 1.3 修改 `backend/src/entities/Testcase.ts`，新增 `initCookies` 與 `initLocalStorage` 欄位（皆為 `jsonb`，允許為空）
- [x] 1.4 啟動伺服器，使 TypeORM 自動同步並更新 PostgreSQL 的 Table Schema

## 2. 後端合併邏輯與 API 傳輸

- [x] 2.1 修改 `backend/src/routes/project.ts`、`group.ts`、`testcase.ts`，在 POST 與 PATCH 路由中接收並儲存這兩個欄位的值
- [x] 2.2 在後端實作 `mergeCookies` 與 `mergeLocalStorage` 的核心合併工具函數
- [x] 2.3 於 `backend/src/queue.ts` 的測試執行邏輯中，獲取當前 Testcase，並遞迴向上載入 Parent Group 與 Project，計算出最終合併的 Cookie 與 LocalStorage 資訊
- [x] 2.4 於 `backend/src/queue.ts` 中，使用 Playwright 的 `context.addCookies` 注入合併後的 Cookie，並使用 `context.addInitScript` 在文件加載前注入合併後的 LocalStorage

## 3. 前端類型同步與 UI 表單實作

- [x] 3.1 於 `frontend/src/types/api.ts` 中擴充 `Project`、`TestGroup` 與 `Testcase` 介面，同步加入 `initCookies` 與 `initLocalStorage` 欄位
- [x] 3.2 於 `frontend/src/components/custom/EditProjectDialog.tsx` 整合「進階環境設定」摺疊面板（Accordion），提供專案級預置 JSON 編輯與前端格式校驗
- [x] 3.3 於 `frontend/src/views/ProjectDetailView.tsx` 的「建立測試案例對話框」與「建立/編輯群組對話框」中，整合相同的摺疊面板，提供 JSON 編輯與校驗
- [x] 3.4 於 `frontend/src/views/TestCaseDetailView.tsx` 的編輯模式表單中整合該摺疊面板與校驗

## 4. 驗收

- [x] 4.1 驗證在專案、群組、測試案例不同層級輸入無效 JSON 時，前端能正確攔截並提示
- [x] 4.2 驗證當父群組設定了 Session Cookie，而子測試案例未設定時，執行測試時能夠正確自動繼承該 Cookie
- [x] 4.3 驗證當子測試案例覆蓋了父層同名 Cookie 時，瀏覽器最終是以子層設定執行
