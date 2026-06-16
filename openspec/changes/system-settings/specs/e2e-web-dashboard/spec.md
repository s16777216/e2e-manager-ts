## ADDED Requirements

### Requirement: Sidebar Footer Settings Redirection
系統 MUST 在側邊欄底部（Sidebar Footer）提供設定（Settings）控制按鈕，使用者點擊該按鈕時，系統 SHALL 將網頁路由導向 `/settings` 以載入全域設定介面，且設定頁面作為獨立頁面填滿右側主要工作區。

#### Scenario: Navigate to settings page from sidebar footer
- **WHEN** 使用者點擊側邊欄底部的設定圖示按鈕時
- **THEN** 前端應用程式將畫面轉導至 `/settings` 路由，並在主工作區渲染設定設定面板，頂部全域麵包屑展示為「系統設定」
