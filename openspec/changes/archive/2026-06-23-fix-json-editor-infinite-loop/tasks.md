## 1. 重構 JsonEditorAccordion 元件防環更新

- [x] 1.1 於 `JsonEditorAccordion.tsx` 中引入 React 的 `useRef` 鉤子。
- [x] 1.2 使用 `onChangeRef` 與專屬 `useEffect` 快取最新傳入的 `onChange` 實例，確保 Ref 內維持最新的回調參照。
- [x] 1.3 調整觸發更新的 `useEffect`，呼叫 `onChangeRef.current` 代替直撥，並將 `onChange` 自依賴陣列（dependency array）中安全移除，防止無限重渲染循環。

## 2. 驗證與測試

- [x] 2.1 執行前端建置 `npm run build`，驗證無型別或編譯錯誤。
- [x] 2.2 於網頁中測試粘貼或輸入大段 JSON 字串至 Cookies 或 LocalStorage 欄位，驗證格式驗證正確，且不再觸發 `Maximum update depth exceeded` 錯誤。
