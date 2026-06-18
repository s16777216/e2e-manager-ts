## 1. 後端實作與單元測試

- [x] 1.1 修改 `backend/src/services/environmentService.ts` 中的 `mergeCookies` 函數，改為支援雙層 JSON 物件的深度合併 (Deep Merge)
- [x] 1.2 修改 `backend/tests/services/environmentService.test.ts`，更新並新增對 `mergeCookies` 雙層深度合併行為的 Vitest 單元測試
- [x] 1.3 執行後端單元測試，確保 100% 通過無誤

## 2. 後端 Playwright 注入邏輯

- [x] 2.1 修改 `backend/src/queue.ts`，於 Playwright 瀏覽器 Context 注入前，將 `mergedCookies` 物件依 Key 分割還原為 Playwright 格式的 Cookie 陣列並注入

## 3. 前端 UI 整合與驗證

- [x] 3.1 修改 `frontend/src/components/custom/JsonEditorAccordion.tsx` 的 `validateCookies` 與 placeholder，統一改為 JSON 物件驗證
- [x] 3.2 執行前端項目建置，確保 100% 通過型別檢查與編譯
