## Why

目前前端介面使用了 Vanilla Tailwind CSS 手寫組裝，尚未整合與重用 UI 元件。此外，由於 `tsconfig.json` 與 `components.json` 對於別名 `@/` 的路徑對照解析有誤，導致使用 shadcn CLI 下載元件時，會錯誤建立名為 `@` 的實體資料夾而非放置於 `src/components/ui/` 中。修正此配置將有助於前端程式碼的模組化重構。

## What Changes

- 修正前端的路徑別名配置，確保 `tsconfig.json` 能被 shadcn CLI 正確讀取，使後續下載的 shadcn 元件能落入 `src/components/ui/`。
- 清理並刪除因配置錯誤而產生的 `frontend/@` 資料夾及其底下的 `button.tsx` 檔案。
- 使用 shadcn CLI 重新於正確路徑新增 `button` 等核心基礎元件。

## Capabilities

### New Capabilities
- 無

### Modified Capabilities
- 無

## Impact

- **設定檔**：將修正 `frontend/components.json` 與 `frontend/tsconfig.json`。
- **檔案目錄**：將清理 `frontend/@` 髒路徑，並於 `frontend/src/components/` 新增 `ui` 子目錄。
- **依賴項**：無影響，主要依賴項（如 tailwind-merge、CVA 等）均已包含在 `package.json` 中。
