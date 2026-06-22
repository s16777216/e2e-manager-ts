## Why

系統在建立新的子群組後無法在畫面上正常顯示，且編輯子群組時會因無法定位節點而產生錯誤。這是因為前端與後端 API 樹狀資料結構不對等，導致前端資料重建邏輯將所有子群組節點完全剔除。

## What Changes

- **修正資料處理邏輯**：重構 `useGroupData` Hook 的載入狀態處理，直接利用後端 API 回傳的樹狀結構並補全 `parentId` 屬性，廢除前端過期且有缺陷的 `buildGroupTree` 重建邏輯。
- **補全群組扁平化資料**：在 Hook 內部遞迴扁平化群組樹以更新扁平的 `groups` 狀態，使前端能夠順利透過 `groups.find()` 在所有層級（含深層子群組）中正常定位編輯節點。
- **改進使用者體驗 (UX)**：建立新的子群組後，自動將對應的父群組狀態設為展開，確保使用者可以立即看到新建的子群組。

## Capabilities

### New Capabilities

*(無)*

### Modified Capabilities

- `e2e-web-dashboard`: 修正主畫面滿版群組與測試案例樹狀表格在載入與建立子群組時的即時更新與顯示行為，確保階層關係與操作定位正確。

## Impact

- 影響前端 `useGroupData` Hook 及其返回的 `groups` 與 `groupTree` 屬性。
- 影響前端 `ProjectDetailView` 的群組建立回調行為 (`onCreateGroup`)。
