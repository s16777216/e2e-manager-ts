## Why

在導入 AI 進行 Web E2E 測試的過程中，若將一長串自然語言測試劇本一次性交給 AI 代理（如 browser-use 的預設模式），AI 容易迷路、產生幻覺，且在執行失敗時難以除錯與觀測。本變更旨在引入「逐步引導式 AI E2E 測試框架（Step-by-Step E2E Agent Runner）」，將測試流程拆解為結構化的步驟，由伺服器/協調器依序推動，每次僅交付單一步驟給 LLM 推理與執行，以提升測試穩定度、降低 Token 成本，並產出詳細的步驟截圖報告。

## What Changes

- **新增測試案例載入與驅動模組**：支援讀取 JSON 格式的結構化測試劇本（含步驟清單與預期結果）。
- **新增基於 LangGraph 的有狀態逐步 Agent 執行引擎**：使用 Playwright 驅動瀏覽器，並透過 LangGraph 定義的狀態圖與自訂工具集（如點擊、輸入等）供 Gemini LLM 逐步決策與執行。
- **新增步驟級截圖與報告生成器**：在每個步驟執行完畢後自動截圖存檔，並在測試結束後，將步驟過程與截圖彙整為 Markdown 格式的測試報告。
- **新增 LLM 視覺斷言驗證**：在所有步驟完成後，由 Gemini 讀取最終截圖並根據預期結果描述（Expected）進行 Pass/Fail 的視覺斷言。

## Capabilities

### New Capabilities

- `step-by-step-runner`: 提供 JSON 格式劇本的載入、以 LangGraph 狀態圖驅動的逐步驅動引擎，以及整合 Playwright 瀏覽器控制與 Gemini LLM 的 Tool-use 決策迴圈。
- `step-assertion-and-reporting`: 負責每個步驟執行後的自動截圖存檔、最後的 Expected 條件視覺判定（利用 Gemini 1.5），以及生成結構化的測試報告。

### Modified Capabilities

(無變更現有 spec)

## Impact

- **新增依賴**：`playwright`、`langgraph`、`langchain-core`、`langchain-google-genai`、`pydantic` 等 Python 庫。
- **專案結構**：於 workspace 建立 `src/` (Agent 與 Runner 核心邏輯) 與 `tests/` (測試腳本與執行入口) 目錄。
- **輸出影響**：每次執行測試時將於 `reports/` 目錄下產生時間戳記資料夾，存放各步驟截圖與 `report.md` 報告。
