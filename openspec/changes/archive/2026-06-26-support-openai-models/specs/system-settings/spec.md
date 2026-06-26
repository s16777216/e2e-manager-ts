## MODIFIED Requirements

### Requirement: System Global Settings Persistence
後端系統 MUST 提供全域設定的持久化儲存，將設定以 JSON 格式儲存於後端專案目錄下的 `settings.json` 檔案中。後端 MUST 提供 API 路由 `GET /api/settings` 與 `POST /api/settings` 以供讀取與覆寫設定。設定內容除了基礎 Playwright 參數外，也 MUST 包含：模型提供者（google / openai）、Gemini API 金鑰、OpenAI Base URL、OpenAI API 金鑰、執行（Executor）與斷言（Asserter）模型名稱。後端系統 MUST 提供 `DELETE /api/settings/history` 路由，一鍵清除資料庫中的所有 `TestRun` 執行紀錄與關聯日誌。

#### Scenario: Read global configurations with AI parameters
- **WHEN** 前端發送 `GET /api/settings` 請求且後端配置有設定檔時
- **THEN** 後端 MUST 返回包含所有設定參數（包含 Playwright 瀏覽器參數與 LLM 供應商參數）的 JSON 物件，狀態碼為 200

#### Scenario: Update global configurations with AI parameters
- **WHEN** 前端發送 `POST /api/settings` 請求並提供包含新 AI 提供者與金鑰的參數值時
- **THEN** 後端 MUST 將新設定寫入並更新 `settings.json` 檔案中，並返回儲存成功訊息

## ADDED Requirements

### Requirement: Multi-provider LLM Configuration
系統核心 MUST 支援 `Google Gemini` 與 `OpenAI Compatible` 兩種模型提供者。在執行測試案例及視覺斷言時，後端 MUST 依據設定值動態呼叫對應模型的 SDK 實例，且不論選用何種提供者，系統皆 MUST 支援 Vision 多模態圖片輸入、Function Calling 瀏覽器工具呼叫，以及完整攔截並回傳 Token 消耗數量。

#### Scenario: Execute test run using OpenAI Compatible model
- **WHEN** 使用者將供應商設為 `openai`、填妥 Base URL 與金鑰並啟動測試案例執行時
- **THEN** 後端 LangGraph 自動實例化 `ChatOpenAI` 來執行瀏覽器 Tool 動作，並且順利完成測試步驟，日誌中能正確計算並返回 Token 數據

