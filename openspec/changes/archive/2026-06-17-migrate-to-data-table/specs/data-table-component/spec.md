## ADDED Requirements

### Requirement: DataTable 泛型組件存在
系統 SHALL 提供 `components/custom/DataTable.tsx` 泛型組件，接受 `columns: ColumnDef<TData>[]`、`data: TData[]`、可選的 `onRowClick` 回調、可選的 `globalFilter` 字串與 `onGlobalFilterChange` 回調。

#### Scenario: Row click 導航
- **WHEN** 使用者點擊 DataTable 中的任一資料列
- **THEN** 系統呼叫 `onRowClick(row.original)` 並由父層 View 執行 navigate 動作

#### Scenario: 欄位排序
- **WHEN** 使用者點擊啟用排序的欄位 header
- **THEN** 系統依該欄位升冪排序資料列；再次點擊改為降冪；第三次點擊取消排序

#### Scenario: 全域過濾
- **WHEN** 父層傳入非空的 `globalFilter` 字串
- **THEN** DataTable 只顯示在任一欄位的字串值中包含該字串的資料列（大小寫不敏感）

#### Scenario: 無資料時顯示空白訊息
- **WHEN** `data` 為空陣列，或過濾後無符合資料列
- **THEN** Table 顯示「找不到符合條件的紀錄。」空白提示

### Requirement: DataTable 使用 shadcn 預設主題
DataTable 組件 SHALL 使用 `components/ui/table.tsx` 的 `Table`、`TableHeader`、`TableBody`、`TableRow`、`TableHead`、`TableCell` 組件渲染，不覆蓋任何 shadcn 預設 class。

#### Scenario: 視覺風格一致
- **WHEN** DataTable 渲染
- **THEN** Table 的背景、邊框、文字顏色皆使用 shadcn 的 CSS variable（`--background`、`--border`、`--muted-foreground` 等），不使用硬編碼 zinc 色號
