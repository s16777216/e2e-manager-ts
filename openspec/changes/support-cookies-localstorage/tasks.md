## 1. 後端實體與資料庫擴充

- [ ] 1.1 於 `backend/src/entities/Testcase.ts` 中，新增 `initCookies` 與 `initLocalStorage` 欄位（皆為 `jsonb` 類型，允許為空）。
- [ ] 1.2 執行或重啟伺服器，使 TypeORM 同步 schema 至 PostgreSQL。

## 2. 後端 API 與測試執行器修改

- [ ] 2.1 修改 `backend/src/routes/testcase.ts` 中建立（POST）與更新（PATCH）的路由邏輯，接收並儲存 `initCookies` 與 `initLocalStorage` 資料。
- [ ] 2.2 於 `backend/src/queue.ts` 的 `executeJob` 函數中，於瀏覽器初始化後，透過 `browserManager.context?.addCookies` 注入 `initCookies`。
- [ ] 2.3 於 `queue.ts` 中，使用 `browserManager.context?.addInitScript` 於頁面加載前，自動對 `initLocalStorage` 的 Key-Value 進行 `window.localStorage.setItem` 注入。

## 3. 前端類型同步與 UI 表單實作

- [ ] 3.1 於 `frontend/src/types/api.ts` 中擴充 `Testcase` 介面，同步加入 `initCookies` 與 `initLocalStorage` 欄位型態。
- [ ] 3.2 修改 `frontend/src/views/ProjectDetailView.tsx` 的「建立測試案例對話框」，加入可摺疊的「進階環境設定」面板，提供 JSON 編輯文字框，並在儲存前校驗 JSON 語法正確性。
- [ ] 3.3 修改 `frontend/src/views/TestCaseDetailView.tsx` 的「編輯與詳情頁面」，整合相同的進階設定折疊表單與格式驗證，並在儲存成功後正確更新畫面。
