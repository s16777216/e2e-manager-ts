## Context

隨著 E2E 測試在 Web 與 AI 流程中頻繁執行，步驟截圖（bytea）會迅速佔滿 PostgreSQL 的儲存空間。為了避免資料庫爆滿，同時保留有價值的測試歷史趨勢數據，我們需要實作自動清理過期截圖的機制，並以明確的狀態欄位防止前端顯示破圖。

## Goals / Non-Goals

**Goals:**
- 在 `SystemSetting` 中加入 `screenshotRetentionDays` 保留天數設定。
- 在 `TestRun` 與 `TestRunStep` 中新增狀態標記欄位，明確區分無截圖與截圖已過期兩種狀態。
- 實作定時自動清理過期截圖二進位數據的後端服務，並整合至 `TaskQueue` 背景 Worker。
- 修改前端 `SettingsView`，整合截圖保留天數設定輸入。
- 修改前端步驟與執行詳情頁面，以時鐘圖示和說明友善展示已過期的步驟與失敗截圖，避免破圖。

**Non-Goals:**
- 本案不包含對實體硬碟報告（`backend/reports/`）的清理。
- 本案不包含在 CLI 模式下進行歷史截圖清理。

## Decisions

### 1. 新增明確的 `screenshotStatus` / `screenshotFailStatus` 狀態欄位
- **決策說明**：於 `TestRunStep` 新增 `screenshotStatus`（`none` | `available` | `expired`），於 `TestRun` 新增 `screenshotFailStatus`（同上）。
- **理由**：
  - **避免 UX 破圖與混淆**：若僅將截圖二進位設為 `NULL`，前端無法區分「未擷取」與「已過期」，會造成使用者困惑。明確的狀態能讓前端精準展示不同的提示占位符。
  - **未來相容性**：若未來新增「手動關閉特定步驟截圖」的功能，狀態機設計能完美相容。
- **替代方案**：使用時間戳與執行結果在前端動態推導。但這容易因為前端時區或將來的截圖開關邏輯而產生誤判，不夠健壯。

### 2. 於 `TaskQueue` 輪詢週期中整合自動清理
- **決策說明**：在 `TaskQueue.startWorker` 的定期定時（3 秒一週期的 loop）中，呼叫非同步清理服務。
- **理由**：
  - **零外部依賴**：不需引入複雜的 Cron Job 管理模組，使用現有背景輪詢機制即可。
  - **不阻塞主流程**：清理工作是純資料庫的 UPDATE SQL 異步呼叫，執行時間極短，不會影響正常測試佇列的執行。

### 3. 前端 Bento 排版整合與狀態展現
- **決策說明**：將前端 `SettingsView.tsx` 下方的「危險區域」擴充為「儲存空間與清理」卡片；並在 `StepAccordion.tsx` 與 `SSEConsoleView.tsx` 中，對 `expired` 狀態渲染一個精美的灰色時鐘占位符。
- **理由**：這維持了 Bento 設計系統的精緻感，讓過期清理的體驗十分自然。

## Risks / Trade-offs

- **[風險]**: 在執行自動清理時，過大的 UPDATE 查詢可能會造成資料庫短暫鎖死。
  - **[對策]**: 加入 `andWhere("screenshotData IS NOT NULL")` 條件，僅對仍持有截圖資料的列進行更新，減少掃描與鎖定的行數。
