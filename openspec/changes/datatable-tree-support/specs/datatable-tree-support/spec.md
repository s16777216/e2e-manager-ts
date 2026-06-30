## ADDED Requirements

### Requirement: Tree Table Hierarchical Rendering
通用 `DataTable` SHALL 支援選配的樹狀階層分層（Tree Grid）運算與展開/收合狀態管理能力。此機制 SHALL 與現有一維平鋪表格完全向下相容，且在 View 端能無障礙讀取 `depth` 與展開 API。

#### Scenario: Recursive subrows resolution
- **WHEN** 通用 `DataTable` 接收到包含 `children` 或 `subRows` 的樹狀資料，並傳入對應之 `getSubRows` 解析器時
- **THEN** 元件內部的 TanStack Table SHALL 正確建立階層鏈，且將 Row 的 `depth`（深度深度，0-indexed）與 `getCanExpand()`（是否有子列）屬性暴露給 Column 的 `cell` 渲染器。

#### Scenario: Smooth expand and collapse
- **WHEN** 使用者點擊 View 端 Column 中綁定 `row.getToggleExpandedHandler()` 的展開/摺疊按鈕時
- **THEN** Table 內部狀態 `expanded` SHALL 即時更新，且元件自動展開或收合對應子行。

#### Scenario: Fallback for flat tables
- **WHEN** 通用 `DataTable` 未傳入 `getSubRows` 參數時
- **THEN** 元件 SHALL 自動降級為一維普通平鋪表格展示，無任何錯誤或性能耗損。
