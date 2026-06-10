## Why

目前 E2E 管理器前端儀表板的所有 UI 都是使用 Vanilla Tailwind CSS 手寫組裝，導致 [App.tsx](file:///C:/works/e2e-manager-ts/frontend/src/App.tsx) 程式碼龐大（超過 1000 行）且元件缺乏重用性，部分原生元素如 `<select>` 與自訂彈窗的互動體驗也缺乏無障礙支援與動畫效果。將前端修改為以 `shadcn/ui` 元件為主體，並套用預設的 Zinc 主題，能夠大幅簡化程式碼複雜度，提供一致且具質感的黑白灰商務風格。

## What Changes

- **全域主題變更**：修正 `frontend/src/index.css` 與全域樣式，改用 shadcn 官方預設的 Zinc 色系變數，並確保正確的 Dark/Light 樣式支援。
- **引入基礎元件**：使用 shadcn CLI 陸續下載並導入 `select`、`dialog`、`scroll-area`、`input`、`textarea`、`sonner` 等基礎互動元件。
- **UI 重構**：
  - 用 `Button`、`Input`、`Textarea` 重構現有的表單與控制項。
  - 用 `Dialog` 重構「新增專案」與「新增子群組」的 Modal 彈窗。
  - 用 `Select` 替代原生的專案下拉選單。
  - 用 `ScrollArea` 包裹側邊欄群組樹與 Console 日誌，獲得精緻一致的滾動條。
  - 用 `Sonner` 替代瀏覽器原生的 `alert()`。

## Capabilities

### New Capabilities
- 無

### Modified Capabilities
- `e2e-web-dashboard`：重構前端儀表板的 UI 元件載入與視覺風格，使用預設的 Zinc 主題樣式，提供一致的互動體驗。

## Impact

- **受影響程式碼**：[App.tsx](file:///C:/works/e2e-manager-ts/frontend/src/App.tsx) 與 [index.css](file:///C:/works/e2e-manager-ts/frontend/src/index.css)。
- **依賴項**：將使用 shadcn CLI 下載相應元件（自動引入 `@radix-ui` 等底層依賴）。
