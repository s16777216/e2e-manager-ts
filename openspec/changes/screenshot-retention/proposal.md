## Why

隨著 E2E 測試在背景頻繁執行，步驟截圖（以二進位 bytea 儲存於 PostgreSQL 中）會迅速填滿資料庫空間，造成效能瓶頸。本案旨在引入自動化「截圖保留天數」清理機制，在釋放資料庫空間（可減少 95% 以上資料庫容量）的同時，藉由新增狀態欄位防止前端破圖，且能完整保留歷史測試的中繼數據（例如：通過率、LLM Token 消耗量、執行耗時等統計資訊）。

## What Changes

- **設定實體擴充**：於 `SystemSetting` 中新增 `screenshotRetentionDays` 欄位（單位：天），預設為 0（代表永久保留）。
- **狀態標記欄位引入**：
  - 於 `TestRunStep` 新增 `screenshotStatus` 欄位（可選值：`none` | `available` | `expired`，預設為 `none`）。
  - 於 `TestRun` 新增 `screenshotFailStatus` 欄位（同上，預設為 `none`）。
- **後端自動清理服務**：
  - 建立 `cleanExpiredScreenshots` 服務，計算過期截止日並批次將對應的二進位欄位（`screenshotData`、`screenshotFailData`）更新為 `NULL`，同時將狀態標記更新為 `expired`。
  - 將此清理邏輯整合至背景 Worker 佇列（`queue.ts`）的輪詢週期中。
- **測試流程狀態標記**：
  - 修改 `graph.ts` 的測試執行節點，當成功儲存截圖至資料庫時，一併將對應的 `screenshotStatus` / `screenshotFailStatus` 設為 `available`。
- **前端 Bento 設定面板擴充**：
  - 於 `SettingsView.tsx` 的「儲存空間與清理」卡片中，新增「截圖保留天數」輸入欄位與對接。
- **前端截圖防破圖與過期提示**：
  - 修改 `StepAccordion.tsx` 與 `SSEConsoleView.tsx` 的截圖區塊，若狀態為 `expired`，不載入圖片，改為渲染附有時鐘圖示的友善提示：「此步驟之截圖已過期清理」。

## Capabilities

### New Capabilities
<!-- 無新增，此案為擴充現有設定能力 -->

### Modified Capabilities
- `system-settings`: 全域設定新增「截圖保留時間」策略，並在資料庫中對截圖可用狀態進行細緻標記與定時清理。

## Impact

- **後端模組與實體**：
  - [entities/SystemSetting.ts](file:///c:/works/e2e-manager-ts/backend/src/entities/SystemSetting.ts) (擴充 `screenshotRetentionDays` 欄位)
  - [entities/TestRun.ts](file:///c:/works/e2e-manager-ts/backend/src/entities/TestRun.ts) (新增 `screenshotFailStatus` 欄位)
  - [entities/TestRunStep.ts](file:///c:/works/e2e-manager-ts/backend/src/entities/TestRunStep.ts) (新增 `screenshotStatus` 欄位)
  - [services/cleanerService.ts](file:///c:/works/e2e-manager-ts/backend/src/services/cleanerService.ts) `[NEW]` (實作自動清理邏輯)
  - [queue.ts](file:///c:/works/e2e-manager-ts/backend/src/queue.ts) (輪詢中呼叫自動清理)
  - [graph.ts](file:///c:/works/e2e-manager-ts/backend/src/graph.ts) (寫入 `available` 狀態)
  - [routes/run.ts](file:///c:/works/e2e-manager-ts/backend/src/routes/run.ts) (API 對應映射並回傳狀態屬性)
- **前端視圖與型別**：
  - [types/api.ts](file:///c:/works/e2e-manager-ts/frontend/src/types/api.ts) (擴充型別定義)
  - [views/SettingsView.tsx](file:///c:/works/e2e-manager-ts/frontend/src/views/SettingsView.tsx) (新增截圖天數設定輸入與儲存)
  - [components/custom/StepAccordion.tsx](file:///c:/works/e2e-manager-ts/frontend/src/components/custom/StepAccordion.tsx) (處理過期與無截圖狀態渲染)
  - [views/SSEConsoleView.tsx](file:///c:/works/e2e-manager-ts/frontend/src/views/SSEConsoleView.tsx) (處理過期與無截圖狀態渲染)
