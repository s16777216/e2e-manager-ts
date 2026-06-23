## Context

在 `JsonEditorAccordion.tsx` 中，`useEffect` 用於向父組件回傳最新解析的 JSON 物件與校驗狀態：
```typescript
useEffect(() => {
  onChange({
    cookies: parsedCookies,
    localStorage: parsedLocalStorage,
    isValid,
  });
}, [cookiesStr, localStorageStr, onChange]);
```
由於 `onChange` 被列入 `useEffect` 的依賴陣列中，且父組件（如 `NewSubgroupDialog.tsx`、`ProjectDetailView.tsx`、`TestCaseDetailView.tsx`）都是直接傳入行內宣告的匿名回調函數，當 `onChange` 執行並更新父組件狀態時，父組件重新渲染會生成一個全新參照地址的 `onChange` 實例，導致 `useEffect` 再次被執行，進而引發無限重渲染循環。

## Goals / Non-Goals

**Goals:**
- 阻斷 `JsonEditorAccordion` 與父組件之間的無限重渲染死循環。
- 確保在使用者輸入、貼上 JSON 時，元件能穩定地處理輸入並執行格式驗證。
- 無需修改任何外部父組件，從子組件內部一勞永逸地解決此類問題。

**Non-Goals:**
- 不修改父組件中的回調傳遞方式（如強制要求父組件使用 `useCallback`）。

## Decisions

### 1. 使用 useRef 緩存最新的 onChange 回調函數
- **選擇**：在 `JsonEditorAccordion.tsx` 內部利用 `useRef` 參照最新傳入的 `onChange` 回調。
  ```typescript
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);
  ```
  並在觸發更新的 `useEffect` 中呼叫 `onChangeRef.current(...)`。
- **理由**：這樣我們就可以安全地將 `onChange` 從 `useEffect` 的依賴陣列中移除，使 `useEffect` 僅在 `cookiesStr` 與 `localStorageStr` 真正發生內容改變時才觸發。
- **替代方案**：要求所有調用處使用 `useCallback`。缺點是修改點分散在多個檔案中，且未來新增元件調用時容易遺漏而再次引發此 Bug。

## Risks / Trade-offs

- **[Risk]** 在 React 18+ 併發模式下，Ref 的同步更新可能會與 UI 渲染有微小的時序差。
  - **Mitigation**：此處的 `onChange` 僅用於將使用者的表單輸入向上同步，無複雜的併發調度，且依賴 `[onChange]` 的單獨 Effect 能確保 Ref 的值始終最新，無時序風險。
