## Context

目前儀表板 [App.tsx](file:///C:/works/e2e-manager-ts/frontend/src/App.tsx) 使用了 Vanilla Tailwind CSS 自訂多種彈窗、按鈕和下拉選單。這些手寫元件在樣式一致性、焦點控制與輔助功能 (A11y) 上表現不足，且代碼長度過長。套用統一的 `shadcn/ui` 元件與預設 Zinc 暗色主題，能簡化程式碼並提升儀表板的視覺與交互質感。

## Goals / Non-Goals

**Goals:**
- 將主畫面中所涉及的專案下拉選單、專案與群組新增彈窗、表單控制項及彈出提示，全數替換為 shadcn/ui 的 `Select`、`Dialog`、`Input`、`Textarea` 與 `Sonner` 元件。
- 在側邊欄 Group Tree 以及 Console 日誌時間軸中，使用 `ScrollArea` 代替自訂的 CSS 滾動條，確保外觀一致。
- 調整 `index.css` 改為 Zinc 配色，使主題呈現高質感、現代化的黑灰白色調。

**Non-Goals:**
- 不修改後端的 API 與資料庫儲存欄位。
- 不變更前端既有的 state 與業務邏輯（如 API 請求、SSE EventSource 事件監聽等），本次專注於 UI 呈現層與樣式的替換重構。

## Decisions

### 1. 主題配色變更
- **決策**：將 `index.css` 中的 HSL 配色全數調整為 shadcn 預設的 Zinc 配色（Dark 模式為主），並將 `--radius` 設定為 `0.5rem`。
- **理由**：Zinc 配色為 shadcn 最具代表性的黑灰白色系，比原來的藍紫色系更顯商務與極簡質感，能夠顯著提升 E2E 管理器的主觀美學。

### 2. 元件替換方案與配置

* **彈窗 (Modals) 重構**：
  * *方案*：將專案與群組 Modal 重構為 `Dialog` 元件：
    ```tsx
    <Dialog open={showModal} onOpenChange={setShowModal}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>建立新專案</DialogTitle>
        </DialogHeader>
        {/* 表單內容 */}
      </DialogContent>
    </Dialog>
    ```
  * *理由*：Radix UI 的 Dialog 具備良好的無障礙支持，並且自帶流暢的淡入淡出動畫，能大幅消除自訂 Modal 時可能出現的閃動或排版錯亂。

* **下拉選單 (Select) 重構**：
  * *方案*：將專案切換下拉選單重構為 `Select` 元件：
    ```tsx
    <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="選擇專案" />
      </SelectTrigger>
      <SelectContent>
        {projects.map(p => <SelectItem value={p.id}>{p.name}</SelectItem>)}
      </SelectContent>
    </Select>
    ```
  * *理由*：解決原生 `<select>` 在不同瀏覽器下外觀與箭頭不一致的缺陷，與系統內建的其他 input 保持統一焦點樣式。

* **滾動區域 (ScrollArea) 重構**：
  * *方案*：使用 `ScrollArea` 包裹側邊欄與日誌 Console 的滾動區域，避免使用原生 Webkit 捲軸。
  * *理由*：在 Windows/Linux 底下，原生捲軸非常粗且缺乏質感，`ScrollArea` 能跨平台提供一致的精細懸浮滾動條。

* **提示 (Toast) 重構**：
  * *方案*：將所有 UI 回饋（如刪除確認後、儲存成功、連線異常等）由原生 `alert(...)` 改為呼叫 `toast.success` 與 `toast.error`。
  * *理由*：`alert(...)` 會阻斷 JavaScript 執行緒，非常影響使用者體驗，Sonner toast 具備流暢堆疊動畫，體驗最佳。

## Risks / Trade-offs

- **[Risk] App.tsx 元件代碼過長與複雜性**
  - *說明*：將 Dialog 和 Select 大量搬入 App.tsx 可能會進一步增加檔案大小。
  - *對策*：我們仍舊在 App.tsx 內部處理重構，但會將內建的彈窗或特定表單，拆分為獨立的子 React 元件，或透過乾淨的狀態宣告，保證程式碼的局部易讀性。
