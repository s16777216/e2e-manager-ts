## Why

當前專案編輯與環境配置功能（`ProjectEditView`）採用整張大表單與摺疊面板（Accordion）堆疊的設計。當使用者僅需修改專案名稱或描述時，亦必須通過進階設定中複雜的 JSON 格式語法校驗，且必須捲動至最底部統一儲存。這增添了操作難度與認知負擔。引進 GitHub 設定頁面之區塊化、就近儲存佈局，能讓各項配置（基本資料、Cookies、LocalStorage）獨立提交與驗證，大幅提升 UX 體驗與 Bento 風格美感。

## What Changes

- **BREAKING**: 重構專案編輯頁面（`ProjectEditView`）為區塊化設定卡片（Bento Card Settings）佈局，徹底廢除全表單統一提交與 Accordion 摺疊排版。
- **BREAKING**: 重新設計或重構 `ProjectForm.tsx`，使其適配區塊化局部更新機制，或直接在 `ProjectEditView` 內分拆成多個獨立的卡片表單與局部 `isSaving` 載入狀態。
- 分拆專案基本資料、Cookie 設定、LocalStorage 設定之儲存行為，提供就近的保存按鈕，並對應觸發局部的 API `PATCH` 請求。
- 優化「危險區域（Danger Zone）」的視覺排版，將其與其他設定區塊完全分離，並保持基於 `BaseDialog` 的安全二次確認彈窗。

## Capabilities

### New Capabilities

*(無)*

### Modified Capabilities

- `project-views`: 將專案編輯介面由單一統一表單修改為 GitHub Settings 風格的區塊化局部提交佈局。

## Impact

- **前端視圖與元件**：
  - [ProjectEditView.tsx](file:///c:/works/e2e-manager-ts/frontend/src/views/ProjectEditView.tsx) 進行 Bento 區塊化重構。
  - [ProjectForm.tsx](file:///c:/works/e2e-manager-ts/frontend/src/components/custom/ProjectForm.tsx) 進行對應重構或直接在 View 內拆分為局部元件。
- **後端 API**：
  - 無變動，繼續沿用 `PATCH /api/projects/:id`，藉由只傳送部分欄位實現局部更新。
