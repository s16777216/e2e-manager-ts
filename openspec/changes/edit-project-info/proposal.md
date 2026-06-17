## Why

目前系統在專案列表中僅提供「建立新專案」的功能。一旦建立專案後，使用者無法在 UI 上修改專案的名稱與描述，也無法刪除已停用或誤建的專案。這導致專案管理維護性不佳，且容易在資料庫中累積過期無用的冗餘專案資料。

## What Changes

- **前端 API 封裝增強**：於 `api.ts` 補齊更新專案 `PATCH /api/projects/:id` 與刪除專案 `DELETE /api/projects/:id` 的 API 封裝。
- **前端 Hook 邏輯擴充**：於 `useProjectData.ts` 中新增更新與刪除專案的處理邏輯，確保專案狀態更新能即時反應至 React 全域 UI 中。
- **編輯專案資訊 Dialog**：新增 `EditProjectDialog.tsx` 元件，允許使用者修改專案的名稱與描述。
- **專案刪除與安全確認**：於 `EditProjectDialog` 中整合「刪除專案」功能，並在執行刪除前彈出二次確認對話框，要求使用者輸入專案名稱以防止誤刪操作。
- **專案詳情頁整合**：修改 `ProjectDetailView.tsx`，於頂部專案名稱旁新增編輯圖示作為功能入口，並在刪除專案成功後將使用者導向專案列表首頁。

## Capabilities

### New Capabilities
<!-- Capabilities being introduced. Replace <name> with kebab-case identifier (e.g., user-auth, data-export, api-rate-limiting). Each creates specs/<name>/spec.md -->

### Modified Capabilities
- `e2e-web-dashboard`: 於專案詳細頁面中新增編輯專案資訊與刪除專案的 UI 控制介面。

## Impact

- **前端核心與 API**：
  - [api.ts](file:///c:/works/e2e-manager-ts/frontend/src/lib/api.ts) (封裝 PATCH 與 DELETE 請求)
  - [useProjectData.ts](file:///c:/works/e2e-manager-ts/frontend/src/hooks/useProjectData.ts) (新增更新及刪除 handler)
- **前端導航與 UI 元件**：
  - [components/custom/EditProjectDialog.tsx](file:///c:/works/e2e-manager-ts/frontend/src/components/custom/EditProjectDialog.tsx) `[NEW]` (編輯與刪除二次確認對話框)
  - [views/ProjectDetailView.tsx](file:///c:/works/e2e-manager-ts/frontend/src/views/ProjectDetailView.tsx) (整合編輯入口與刪除後導頁邏輯)
