## 1. 表單強型別校驗與 Schema 設計

- [ ] 1.1 在 `SettingsView.tsx` 中使用 Zod 定義表單資料 Schema (`settingsSchema`)。
- [ ] 1.2 設定 `headless` 欄位為 `z.boolean()`，並針對數值欄位使用 `z.coerce.number()` 進行自動轉型。
- [ ] 1.3 加上 `min()` 與 `max()` 校驗規則，並提供對應的繁體中文錯誤提示（如「動作延遲不能超過 3000ms」、「寬度至少為 320」）。

## 2. 表單與元件重構

- [ ] 2.1 引入 `FormBlock` 與 `FormField` 元件，移除舊有的多個 `useState` 狀態管理。
- [ ] 2.2 調整 `loading` 狀態的條件渲染，在設定載入完成後才 Mount `FormBlock` 元件，確保 `defaultValues` 正確套用。
- [ ] 2.3 使用 `FormField` 改寫 `slowMo`, `defaultTimeout`, `viewportWidth` 與 `viewportHeight` 欄位，套用自動注入模式。
- [ ] 2.4 對 `Switch` 元件套用 `FormField` 的 Render Props 模式，以相容 `checked` 與 `onCheckedChange`。

## 3. 排版與危險區域調整

- [ ] 3.1 使用 `Separator` 分割設定區塊，並將「危險區域」以 Bento Grid 樣式的 `div`（`grid-cols-1 lg:grid-cols-3`）重新排版。
- [ ] 3.2 刪除 `SettingsView.tsx` 中舊的 `<form>` 排版程式碼，確保按鈕使用 `FormBlock` 的 `submitText` 屬性。

## 4. 功能驗證

- [ ] 4.1 開啟本地開發伺服器，驗證 `SettingsView` 表單載入正常且預設值正確。
- [ ] 4.2 測試提交表單，確認正確將設定儲存到 API 端點。
- [ ] 4.3 驗證校驗邏輯是否生效（如輸入不符合範圍的值時，會顯示中文錯誤提示並阻擋提交）。
- [ ] 4.4 測試危險區域的清除歷史紀錄按鈕，確保 Dialog 依然能正常彈出且功能正常。
