## Context

目前的通用 `DataTable` 是以 TanStack Table v8 實作，但並未對外提供樹狀展開所需的 `getExpandedRowModel` 與 `getSubRows` 配置。本設計旨在擴充通用 `DataTable`，並在 `ProjectDetailView.tsx` 中將原本手動拼接的 DOM 表格替換為此強大的 Tree Table，以取得全站一致的 UI 體驗。

## Goals / Non-Goals

**Goals:**
* 擴充 `DataTable` 屬性，使其能接收 `getSubRows` 並載入 `getExpandedRowModel` 計算展開狀態，且與現有的平鋪表格完全向下相容。
* 保持 `DataTable` 的 Headless 通用性，展開/收摺控制按鈕的樣式與點擊行為由 View 端的 `ColumnDef` 自行客製化。
* 重構 `ProjectDetailView.tsx`，導入新版 `DataTable` 以取代原本遞迴渲染的 `GroupTreeNode`，在第一欄中完美呈現 Depth 縮排、資料夾與案例圖示、以及樹狀展開按鈕。

**Non-Goals:**
* 不在 `DataTable` 內部直接綁定特定的展開/收合圖示，所有 UI 繪製放手給 Column。

## Decisions

### 1. 擴充 DataTable 屬性與 TanStack Table 狀態
* **決策**：在 `DataTableProps` 新增可選的 `getSubRows?: (row: TData) => TData[] | undefined`。
* **狀態管理**：
  ```typescript
  const [expanded, setExpanded] = useState<ExpandedState>({});
  
  const table = useReactTable({
    // ... 原有配置
    getSubRows,
    getExpandedRowModel: getExpandedRowModel(),
    onExpandedChange: setExpanded,
    state: {
      // ...
      expanded,
    }
  });
  ```

### 2. View 端的 ColumnDef 縮排與圖示自訂
* **決策**：在 `ProjectDetailView.tsx` 的 Column 定義中，對「名稱」欄位採用以下渲染結構：
  * 使用 `style={{ paddingLeft: `${row.depth * 1.5}rem` }}` 進行層級縮排。
  * 若 `row.getCanExpand()` 為 true，渲染展開/收合按鈕並點擊呼叫 `row.getToggleExpandedHandler()`，若為 false 則為葉子節點。
  * 根據節點類型（Group / TestCase）自動呈現 `Folder`、`FolderOpen` 或 `FileText` 圖示。

### 3. 與 Lazy Loading 機制無縫整合
* **決策**：在使用者點擊展開按鈕時，除了觸發 `row.getToggleExpandedHandler()`，若該 Group 的測試案例尚未載入，則發送 API 載入，並將其合併至前端的 treeRows 資料中，觸發 Table 的重新渲染。

## Risks / Trade-offs

* **[風險]** React Table v8 的樹狀數據結構要求父子列型別一致。目前專案中的群組（Group）與測試案例（TestCase）是不同的型別結構。
  * **[對策]** 在 View 中，我們需要建立一個統一的 `FlatTreeRow` (或者 UnifiedTreeNode) 型別物件，包含 `id`, `name`, `type: "group" | "case"`, `children` 等，將 API 獲取的 Group 樹與懶加載的 TestCase 樹統一包裝為這一個型別的樹狀結構，以供 `DataTable` 解析。
