## 1. 專案初始化與環境設定

- [x] 1.1 於 `e2e-manager-ts/` 目錄建立 package.json 檔案並配置 typescript、tsx 等依賴項
- [x] 1.2 配置 tsconfig.json 檔案，設定 target 與 module 支援 ES Modules 規範
- [x] 1.3 安裝所有 Node.js 依賴套件（@langchain/langgraph、playwright、zod、dotenv 等）
- [x] 1.4 於本機執行 `npx playwright install` 安裝 Chromium 瀏覽器核心

## 2. 測試劇本解析與狀態定義

- [x] 2.1 使用 Zod 實作劇本解析器，讀取 JSON 測試劇本並進行型別約束驗證（id, name, steps, expected）
- [x] 2.2 定義 LangGraph.js 狀態結構 `TestState` (使用 Annotation.Root)，用以追蹤步驟、日誌與截圖

## 3. Playwright 瀏覽器控制與 Tool-use 封裝

- [x] 3.1 實作 TS 版 `BrowserManager`，處理 Playwright 啟動、`ignoreHTTPSErrors: true` 憑證忽略設定與頁面導航
- [x] 3.2 實作 TS 版 DOM 簡化過濾器，擷取可見的互動元素並動態將其當前 `value` 屬性渲染至標籤中，供 AI 感知
- [x] 3.3 封裝網頁模擬操作工具集（navigate_to, click_element, input_text, wait_for_seconds, finish_step）為 LangChain Tools

## 4. LangGraph.js 狀態圖節點與邊實作

- [x] 4.1 實作 `initNode` 與 `stepTrackerNode`，推進步驟索引並進行每步截圖 `step_n_result.png` 存檔
- [x] 4.2 實作 `executorNode` 節點，獲取當前截圖與網址 (current_url)，呼叫 Gemini 進行多模態決策並動態執行工具呼叫
- [x] 4.3 實作圖形的條件邊（Conditional Edges），流暢路由 Executor 的內部決策與重試超限中斷
- [x] 4.4 實作 `asserterNode`，利用 Zod 綁定 Gemini 的結構化輸出，對最後網頁畫面進行視覺預期結果斷言
- [x] 4.5 串聯所有節點與邊，編譯為完整的非同步 Compiled Graph

## 5. 報告生成器與程序安全清理

- [x] 5.1 於 `reporterNode` 實作中，當測試失敗或中斷時，於關閉瀏覽器前自動擷取畫面存檔為 `screenshot_fail.png`
- [x] 5.2 於 `reporterNode` 實作 `finally` 安全機制與 CLI 入口監聽器，確保不論測試成功或異常，皆能確實關閉 Playwright 進程
- [x] 5.3 實作 Markdown 測試報告生成器，輸出 `report.md`，內容必須正確關聯步驟截圖與失敗截圖

## 6. 功能驗證與測試

- [x] 6.1 於 `e2e-manager-ts/tests/` 建立公開搜尋與系統登入的驗證劇本 JSON
- [x] 6.2 執行 TS 版本的 E2E Runner，確認其跑出 PASS 結果並能產出精緻的 Markdown 報告
