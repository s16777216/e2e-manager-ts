## Why

當使用者在進階環境設定的 `Cookies` 或 `LocalStorage` 欄位中輸入或粘貼 JSON 字串時，系統會拋出 `Maximum update depth exceeded` 錯誤導致應用程式崩潰。這是由於 `JsonEditorAccordion` 元件的依賴項中包含 `onChange`，而父組件每次更新 state 重新渲染時，傳遞的行內匿名回調函數都會產生新的參照，從而形成無限循環渲染。

## What Changes

- **優化回調與依賴機制**：重構 `JsonEditorAccordion.tsx` 的回調處理機制，使用 `useRef` 參照快取傳入的 `onChange` 屬性，在 `useEffect` 中將 `onChange` 移出依賴項，從而阻斷因父組件重新渲染而導致的無限更新循環。
- **防止多餘更新**：確保 `useEffect` 僅在 `cookiesStr` 與 `localStorageStr` 變更時觸發，避免不必要的副作用連鎖反應。

## Capabilities

### New Capabilities

*(無)*

### Modified Capabilities

- `e2e-web-dashboard`: 確保進階環境設定 JSON 編輯元件在使用者貼入或輸入 JSON 字串時能穩定處理，不會因無限渲染循環而崩潰。

## Impact

- 影響前端 `JsonEditorAccordion.tsx` 元件。
- 改善包含專案編輯、群組編輯與測試案例編輯等所有使用 `JsonEditorAccordion` 的表單頁面的輸入穩定性與可靠性。
