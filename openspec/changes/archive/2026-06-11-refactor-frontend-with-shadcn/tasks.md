## 1. 安裝並新增 shadcn/ui 元件

- [x] 1.1 於前端目錄執行 shadcn CLI 安裝 `dialog`、`select`、`scroll-area`、`input`、`textarea`、`sonner` 等基礎元件

## 2. 更新全域主題配色

- [x] 2.1 修改 `frontend/src/index.css`，將 HSL 顏色配置更換為 shadcn 預設 Zinc 色系（包含 Light 與 Dark 模式設定）

## 3. 重構主視圖 UI 元件

- [x] 3.1 於 `frontend/src/App.tsx` 中，使用 `Dialog` 元件重構專案建立與子群組建立的自訂 Modal 彈窗
- [x] 3.2 使用 `Select` 元件重構左側側邊欄的專案切換下拉選單
- [x] 3.3 使用 `ScrollArea` 元件包裹側邊欄 Group Tree 區域以及右側 Console 的日誌步驟時間軸區域
- [x] 3.4 使用 `Button`、`Input`、`Textarea` 重構 App 內部的操作按鈕、測試案例建立表單與步驟增減輸入框
- [x] 3.5 於 `App.tsx` 外層掛載 `<Toaster />` 元件，並將所有業務邏輯中的 `alert(...)` 呼叫替換為高質感的 `toast` 提示

## 4. 編譯與功能驗證

- [x] 4.1 於前端目錄執行 `npm run build` 進行編譯與打包，驗證 TSConfig 路徑映射與程式碼型別完全正確
- [x] 4.2 本地啟動雙端服務，手動操作儀表板確認專案建立、群組導航、測試案例編輯及測試執行 SSE 時間軸與截圖能完全正常渲染
