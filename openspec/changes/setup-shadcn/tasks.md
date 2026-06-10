## 1. 清理舊配置與錯誤路徑

- [ ] 1.1 刪除前端專案下因路徑解析錯誤而產生的 `frontend/@` 資料夾及其內容

## 2. 修正別名與 TSConfig 配置

- [ ] 2.1 修改 `frontend/components.json`，將 `aliases` 改為相對於專案根目錄的 `src/` 實體路徑，防止別名解析失敗

## 3. 下載與驗證基礎元件

- [ ] 3.1 於前端目錄執行 `npx shadcn@latest add button` 重新下載按鈕元件，確保其正確建立於 `frontend/src/components/ui/button.tsx`
- [ ] 3.2 驗證前端編譯與執行正常，確認 Vite 與 TSConfig 對於元件別名的加載無誤
