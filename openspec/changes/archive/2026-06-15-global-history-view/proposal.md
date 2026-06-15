## Why

目前批次測試任務（Task）的執行歷史紀錄被直接放置在「專案詳情頁」的底部。這導致專案詳情頁的版面過於冗長且職責不夠單一。此外，使用者無法在一個統一的介面中跨專案查看整個系統所有正在執行或已完成的批次任務狀態，不利於全域的測試控管與多專案的監控。

## What Changes

- **側邊欄選單更新**：在 RootLayout 側邊欄中，新增一個名為「執行紀錄 (History)」的全新導航入口，並使用 `Clock` 圖示。
- **全域歷史監控頁面**：新增一個全新的獨立頁面 `HistoryView.tsx`，以 Bento 磨砂玻璃設計呈現全域執行統計（總次數、成功率、當前執行中數），並提供跨專案的 Task 表格與進度監控，同時支援依「專案」與「狀態」進行前端篩選。
- **專案詳情頁精簡**：移除專案詳情頁（`ProjectDetailView.tsx`）底部的任務執行歷史表格與相關載入/快取邏輯，使其專注於專案內群組與測試案例的管理。
- **後端 API 擴展**：於 `GET /api/tasks` 提供全域任務查詢，聯表加載其關聯的專案名稱與 ID，供全域歷史頁面使用。

## Capabilities

### New Capabilities
- `global-execution-history`: 用於提供跨專案的全局批次測試任務執行歷史紀錄、全域狀態統計與篩選。

### Modified Capabilities
- `e2e-web-dashboard`: 調整儀表板全域 Layout 的側邊欄以整合新頁面路由，並移除專案詳情頁底部的歷史表格，確保各頁面功能職責清晰。

## Impact

- **前端**：`RootLayout.tsx` (導航選單), `routes.tsx` (路由表), `ProjectDetailView.tsx` (移除底部表格), `api.ts` (API 封裝), `HistoryView.tsx` (新增頁面)。
- **後端**：`task.ts` 路由模組（新增 `GET /tasks` 端點）。
- **依賴**：`lucide-react` (Clock 圖示)。
