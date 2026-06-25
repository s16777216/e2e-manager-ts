## Context

目前的系統全域設定頁面 (`SettingsView.tsx`) 使用多個 `useState` 來管理表單輸入，代碼重複度較高。此變更將套用新開發的自訂表單元件 (`FormBlock` 與 `FormField`)，以簡化狀態管理並統一視覺設計風格。

## Goals / Non-Goals

**Goals:**
- 將 `SettingsView.tsx` 重構為使用 `FormBlock` 和 `FormField` 元件，實現宣告式表單與 Zod 強型別驗證。
- 將設定頁面的 Layout 改為統一的 Bento Grid 風格，使「全域設定」與「危險區域」在視覺上具備一致的對齊與間距。
- 確保原本的設定讀取、儲存與清除歷史紀錄功能完全不受影響。

**Non-Goals:**
- 不修改後端的 API 端點 (`/api/settings` 與 `/api/settings/history`) 的任何邏輯。
- 不引入額外的全域設定選項。

## Decisions

### 1. 數值欄位使用 Zod 的 `z.coerce.number()` 自動轉型
- **決策**：在 `settingsSchema` 中對 `slowMo`, `defaultTimeout`, `viewportWidth`, `viewportHeight` 使用 `z.coerce.number()`。
- **理由**：HTML 原生 `<input type="number">` 在 `onChange` 時傳回的是字串。若使用 `z.number()`，會導致 React Hook Form 因型別不符而驗證失敗。使用 `coerce` 可以在驗證時自動將字串轉換成數字，如此一來便能使用 `FormField` 的 `React.cloneElement` 自動注入模式，保持極簡的 JSX。

### 2. Switch 元件採用 Render Props 模式
- **決策**：對無頭模式的 `Switch` 欄位，採用 `FormField` 的 `(field, id) => ReactNode` 函式注入模式。
- **理由**：`Switch` 元件的介面為 `checked` 與 `onCheckedChange`，而非表單預設的 `value` 與 `onChange`。透過 Render Props 可以輕鬆進行屬性適配，解決隱式注入的相容性問題。

### 3. 非同步資料載入完成後才渲染 FormBlock
- **決策**：在 `loading` 為 `true` 或 `settings` 為 `null` 時渲染載入動畫，直到 API 成功獲取設定值後才 Mount `FormBlock`。
- **理由**：React Hook Form 的 `defaultValues` 僅在初始載入時生效。在 API 完成後才渲染 `FormBlock` 可以確保預設值被正確讀取，免去在表單內部編寫動態 `reset(defaultValues)` 的副作用，結構更加單純。

### 4. 拆分「全域設定」與「危險區域」為兩個 Bento 區塊
- **決策**：將頁面拆分為上方的 `FormBlock`（設定表單）與下方的 `DangerZone`（清除歷史紀錄），中間以 `Separator` 隔開，排版風格與 `account-settings-01` 保持一致。
- **理由**：符合 Bento 設計系統，避免表單元素與破壞性的清除按鈕混雜，版面清晰且符合直覺。

## Risks / Trade-offs

- **[Risk]**：用戶在輸入框中清空內容（例如將寬度清空為空字串）時，`z.coerce.number()` 會將其轉為 `0`，可能導致校驗失敗。
  - **Mitigation**：在 Zod schema 中指定合理的 `.min(320, "寬度至少為 320")` 等明確的錯誤提示，確保使用者在輸入無效值時能看見友善的中文提示，而非 TS/Zod 的預設英文錯誤。
