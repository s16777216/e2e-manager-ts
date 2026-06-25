## Why

目前的系統設定頁面 (`SettingsView.tsx`) 使用了大量的 `useState` 來管理各個表單欄位的狀態，並且排版較為零散。使用我們新開發的自訂表單元件 (`FormBlock` 與 `FormField`) 進行重構，可以統一專案中的表單撰寫模式，利用 `react-hook-form` 與 `Zod` 提供自動校驗與強型別安全，並使畫面排版與 `account-settings-01` 風格對齊。

## What Changes

- **狀態管理重構**：移除 `SettingsView.tsx` 內多個獨立的 `useState`，統一交由 `FormBlock`（底層為 `react-hook-form`）進行狀態託管與提交處理。
- **UI 排版更新**：改用 `FormBlock`（Bento Grid 風格）重構「全域設定表單」，並以同樣的響應式 Grid排版重新設計「危險區域」(Danger Zone)，使整體視覺更為對稱與對齊。
- **表單元件套用**：
  - `Input` 欄位改為使用 `<FormField>` 包裹，並使用自動注入 (Implicit props)。
  - `Switch` 欄位改為使用 `<FormField>` 的 Render Props 模式傳遞 `checked` 與 `onCheckedChange`。
- **型別安全校驗**：使用 `Zod` 定義強型別 Schema，並透過 `z.coerce.number()` 自動將數字輸入框的值轉為數字型別，避免 React Hook Form 驗證失敗。

## Capabilities

### New Capabilities
- `settings-validation`: 系統全域設定的數值範圍與格式驗證。

### Modified Capabilities
- None

## Impact

- **前端視圖**：影響 `frontend/src/views/SettingsView.tsx` 的程式碼結構，不影響原有功能。
- **API 與資料庫**：無影響，依然呼叫現有的 `/api/settings` 與 `/api/settings/history` 介面。
