## Why

隨著專案級的環境配置（如 Cookie、LocalStorage 等）日漸豐富，原先利用 Dialog 彈窗編輯專案基本資訊與環境設定的方式面臨了嚴重的版面限制，不便於未來的設定功能擴展。將專案的「新增」與「編輯」改為獨立的頁面 (View)，能提供更為寬敞且直覺的雙欄式 Bento Grid 配置排版，並赋予每個操作獨立的 URL 與分享能力。

## What Changes

- **BREAKING**: 將「新增專案」功能自彈窗 `NewProjectDialog` 改為獨立路由頁面 `/project/new`。
- **BREAKING**: 將「編輯專案」功能自彈窗 `EditProjectDialog` 改為獨立路由頁面 `/project/:projectId/edit`。
- **BREAKING**: 廢棄原有的彈窗元件 `NewProjectDialog.tsx` 與 `EditProjectDialog.tsx`。
- 抽離可重用的 [ProjectForm.tsx](file:///c:/works/e2e-manager-ts/frontend/src/components/custom/ProjectForm.tsx) 元件，讓建立與編輯頁面共享表單呈現、JSON 校驗與狀態管理邏輯。

## Capabilities

### New Capabilities

- `project-views`: 建立獨立的專案建立頁面與專案編輯頁面，支援 URL 書籤直接連結，並提供寬屏雙欄排版。

### Modified Capabilities

*(無)*

## Impact

- **路由定義**:
  - [routes.tsx](file:///c:/works/e2e-manager-ts/frontend/src/routes.tsx) 新增 `/project/new` 與 `/project/:projectId/edit` 路由路徑。
- **頁面視圖**:
  - 新增 `ProjectCreateView.tsx` 與 `ProjectEditView.tsx`。
- **元件異動**:
  - 新增 `ProjectForm.tsx`。
  - 刪除 `NewProjectDialog.tsx` 與 `EditProjectDialog.tsx`。
- **現有頁面修改**:
  - [ProjectsView.tsx](file:///c:/works/e2e-manager-ts/frontend/src/views/ProjectsView.tsx) 中的建立專案按鈕邏輯。
  - [ProjectDetailView.tsx](file:///c:/works/e2e-manager-ts/frontend/src/views/ProjectDetailView.tsx) 中的編輯專案按鈕邏輯。
