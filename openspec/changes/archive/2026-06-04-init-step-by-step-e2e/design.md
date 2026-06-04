## Context

本專案 `e2e-manager` 旨在建立一個基於 AI 的自動化 Web 驗收測試框架。目前的 codebase 處於全新初始化狀態。我們需要在此變更中建立核心的系統架構，實現由 Python 伺服器主導、逐步調度 Gemini 大語言模型，並透過 Playwright 控制瀏覽器執行測試的「逐步指引式 E2E 測試流程（Step-by-Step E2E Agent Runner）」。本設計將引入 LangGraph 架構，以「有狀態的狀態圖（Stateful Graph）」來規範整個測試生命週期。

## Goals / Non-Goals

**Goals:**
- 實作讀取 JSON 格式測試劇本的模組。
- 使用 LangGraph 建構測試狀態圖（包含 Init, Executor, StepTracker, Asserter, Reporter 等節點）。
- 封裝 Playwright 操作（例如 `click`, `fill`, `navigate`）作為 LLM 可調用的工具集（Tools）。
- 實作步驟內部的 LLM 決策迴圈（Gemini 1.5 配合多模態與 Function Calling），讓 LLM 能在步驟中多次推理與操作直到完成。
- 實作每個步驟結束後的自動截圖存檔機制。
- 實作最終預期結果（Expected）的 LLM 視覺斷言驗證。
- 自動生成包含步驟截圖與結果說明（Markdown）的測試報告。

**Non-Goals:**
- 本階段不進行 Docker 打包與 CI/CD 流程整合（此為 Phase 3 目標）。
- 不處理多因素身分驗證（MFA/2FA）或圖形驗證碼等需要第三方介入的流程。
- 不開發前端圖形介面（Dashboard），僅以 CLI 形式執行與輸出 Markdown 報告。

## Decisions

### 1. SDK 與框架選型：使用 LangGraph 狀態圖架構 (LangGraph + LangChain)
- **選擇**：Python 3 + `langgraph` + `langchain-google-genai` + `playwright`。
- **理由**：
  * **有狀態管理 (Stateful)**：測試流程具有高度的狀態相依性。利用 LangGraph 的 `State` 可以優雅地統一管理目前步驟索引、所有步驟截圖、執行日誌與判定結果，避免混亂的類別實例傳遞。
  * **控制流可視化**：測試流程（初始化 ➔ 執行步驟 ➔ 條件分支 ➔ 視覺判定 ➔ 生成報告）天然契合 Directed Acyclic Graph (DAG) 架構。使用 LangGraph 可以極度清晰地勾勒出每個步驟在失敗、成功、重試時的流轉邊界。
  * **時間旅行 (Checkpointer)**：為未來複雜測試預留「Checkpoint」功能。當後半段步驟出錯時，不需從頭跑起，可直接回溯至指定節點的 State 重新除錯。

### 2. LangGraph 狀態定義 (State Definition)
我們定義 `TestState` 如下：
```python
from typing import TypedDict, List, Dict, Any

class TestState(TypedDict):
    # 測試基本資訊
    test_id: str
    test_name: str
    steps: List[str]
    expected: str
    
    # 執行狀態
    current_step_idx: int
    step_retry_count: int
    last_screenshot: bytes          # 當前頁面的截圖資料
    simplified_dom: str             # 當前頁面簡化後的 DOM 結構
    
    # 紀錄與結果
    screenshots_paths: List[str]    # 所有步驟已存檔的截圖路徑
    logs: List[Dict[str, Any]]      # 每一步的操作日誌
    final_result: str               # "PASS" | "FAIL"
    final_reason: str               # 判定 PASS/FAIL 的理由說明
```

### 3. Graph 節點 (Nodes) 與流程流轉 (Edges)
我們建構的 Graph 包括以下節點：

* **Node: `init_node`**：
  * 啟動 Playwright 瀏覽器並開啟頁面。
  * 載入 JSON 腳本至 State。
  * 將 `current_step_idx` 設為 0。
* **Node: `executor_node`**：
  * 截圖並解析當前 DOM，更新至 State。
  * 呼叫 Gemini 1.5（使用 `ChatGoogleGenerativeAI` 配合 Tool-use 綁定）。
  * Prompt 引導：*"你目前的任務是完成第 {idx} 步：{step}。請根據截圖與 DOM，決定呼叫何種 Tool，直到你認為此步驟已完成，請呼叫 finish_step。"*
  * 執行 LLM 回傳的 Tool（`click`, `fill`, `navigate`, `wait`），更新瀏覽器狀態。
* **Conditional Edge: `route_after_execution`**：
  * 若 LLM 呼叫了 `finish_step` ➔ 前進至 `step_tracker_node`。
  * 若 LLM 執行了其他工具且尚未呼叫 `finish_step`（且重試次數未超限） ➔ 迴圈回到 `executor_node`。
  * 若重試次數超限仍未完成 ➔ 標記失敗，前進至 `reporter_node`。
* **Node: `step_tracker_node`**：
  * 將當前頁面截圖存檔至報告目錄 `step_n_result.png`，路徑寫入 `screenshots_paths`。
  * 將 `current_step_idx` 增加 1，重設 `step_retry_count` 為 0。
* **Conditional Edge: `route_next_step`**：
  * 若 `current_step_idx` < `len(steps)` ➔ 前進至 `executor_node` 繼續執行下一步。
  * 若所有步驟執行完畢 ➔ 前進至 `asserter_node`。
* **Node: `asserter_node`**：
  * 將最終網頁狀態截圖與預期結果 `expected` 發送給 Gemini 1.5（視覺多模態）。
  * Gemini 判斷是否符合預期，回傳 Pass/Fail 與原因，更新至 State 的 `final_result` 與 `final_reason`。
  * 關閉 Playwright 瀏覽器。
* **Node: `reporter_node`**：
  * 讀取 State 中的 `logs`、`screenshots_paths`、`final_result` 等。
  * 產生 Markdown 報告檔 `report.md`。

### 4. 提供給 LLM 的 Tools 設計
- `navigate_to(url)`: 導向網址。
- `click_element(selector, text)`: 點擊網頁元素。
- `input_text(selector, text)`: 輸入欄位內容。
- `wait_for_seconds(seconds)`: 強制等待。
- `finish_step(message)`: 告知協調器目前步驟已完成。

## Risks / Trade-offs

- **[Risk] 由於使用 LangChain / LangGraph 導致的 Gemini 多模態截圖傳輸耗費大量記憶體與 Token**
  - **對策**：每次在 `executor_node` 獲取截圖時，對圖片進行壓縮與尺寸優化（例如調小至 1024 寬度），再轉為 Base64 傳送給 LLM，以確保反應速度與節省 Token。
- **[Risk] Playwright 的非同步與 LangGraph 的同步執行衝突**
  - **對策**：使用 LangGraph 的非同步版本（`StateGraph(TestState)` 編譯為非同步 graph），所有 Node 函數均宣告為 `async def`，確保與 Playwright 的 `async_api` 完美融合。
