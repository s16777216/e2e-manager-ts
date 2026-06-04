## 1. 專案初始化與環境設定

- [x] 1.1 建立 Python 專案基本目錄結構（`src/`, `tests/`）
- [x] 1.2 建立 `requirements.txt` 檔案，加入 `playwright`、`langgraph`、`langchain-core`、`langchain-google-genai` 與 `pydantic`
- [x] 1.3 建立 `.env.example` 並設定 `GEMINI_API_KEY` 等環境變數
- [x] 1.4 初始化本機環境並執行 `playwright install` 安裝 Chromium 瀏覽器核心

## 2. 測試劇本解析與狀態定義

- [x] 2.1 實作劇本解析器，讀取 JSON 測試劇本並以 Pydantic 驗證（包含 `id`, `name`, `steps`, `expected` 欄位）
- [x] 2.2 定義 LangGraph 的 `TestState` (TypedDict)，用以追蹤步驟索引、截圖路徑、操作日誌與最終結果

## 3. Playwright 瀏覽器操作與 Tool-use 封裝

- [x] 3.1 實作 Playwright 輔助類別，處理瀏覽器初始化、頁面導航與視窗設定
- [x] 3.2 封裝網頁操作工具集（`navigate_to`, `click_element`, `input_text`, `wait_for_seconds`, `finish_step`）提供給 LLM 作為 Function Calling 的目標
- [x] 3.3 實作 DOM 簡化過濾器，將網頁的 HTML 結構過濾並簡化為僅包含按鈕、輸入框與關鍵文字的文字結構，以節省 Token

## 4. LangGraph 狀態圖節點與邊 (Nodes & Edges) 實作

- [x] 4.1 實作 `init_node`（初始化 Playwright 與載入劇本）與 `step_tracker_node`（截圖存檔、推進步驟索引）
- [x] 4.2 實作 `executor_node`，將當前步驟、DOM 與當前視窗截圖以多模態方式發送給 Gemini，並動態執行 Tool Call
- [x] 4.3 實作條件路由器（Conditional Edges），處理步驟內部重試/前進下一步/中斷失敗的流轉邏輯
- [x] 4.4 實作最終的 `asserter_node`，利用 Gemini 進行視覺多模態斷言判定是否符合 Expected
- [x] 4.5 串接所有 Nodes 與 Edges，編譯成完整的非同步 LangGraph 執行個體 (Compiled Graph)

## 5. 測試報告生成器

- [x] 5.1 實作 `reporter_node`，讀取 State 中的日誌與截圖路徑，產生 Markdown 報告檔 `report.md`
- [x] 5.2 確保報告包含測試結果、步驟詳細說明、錯誤理由與截圖的 Markdown 圖片語法連結

## 6. 功能驗證與測試

- [x] 6.1 撰寫一個簡單的公開網頁搜尋測試劇本（JSON 格式）
- [x] 6.2 執行已編譯的 LangGraph，觀察並驗證 AI 逐步執行、截圖存檔、最後斷言判定與 Markdown 報告產出的完整流程
