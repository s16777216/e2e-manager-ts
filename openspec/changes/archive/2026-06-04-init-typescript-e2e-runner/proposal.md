## Why

本變更旨在將 E2E 逐步指引式測試框架移植至 TypeScript (於 `e2e-manager-ts/` 目錄中實作)。使用 TypeScript 不僅能享受到 Playwright 原生 JS 生態的最佳整合與極致的型別安全性，還能直接在專案中以型別安全的方式開發 Web DOM 簡化過濾器，並為未來與前端專案、網頁測試儀表板 (Dashboard) 的深度整合建立堅實的架構基礎。

## What Changes

- **專案結構初始化**：於 `e2e-manager-ts/` 初始化 npm 專案與配置 TypeScript 編譯選項。
- **移植 LangGraph 狀態圖邏輯**：使用 `@langchain/langgraph` (TypeScript 版) 重新實作核心協調狀態機與節點 (Nodes)/邊 (Edges) 定義。
- **Playwright 與 DOM 簡化器 TS 化**：使用原生的 Playwright Node.js SDK 進行瀏覽器控制，並以型別安全方式實作 DOM 簡化過濾器。
- **Zod 驗證與結構化輸出**：使用 `zod` 取代 `pydantic`，對 JSON 測試劇本進行 Schema 驗證，並綁定至 Gemini 進行最終結果的視覺斷言。
- **測試報告生成器**：將測試執行日誌與步驟截圖輸出為精美的 Markdown 報告。

## Capabilities

### New Capabilities

- `ts-step-by-step-runner`: 提供 TypeScript 與 LangGraph.js 驅動的劇本解析、步驟驅動引擎與 Playwright 工具封裝。
- `ts-step-assertion-and-reporting`: 負責 TypeScript 版本的每步截圖、Zod 結構化視覺斷言與 Markdown 報告生成。

### Modified Capabilities

(無變更現有 spec)

## Impact

- **新增依賴**：在 `e2e-manager-ts/` 建立 `package.json` 並依賴 `@langchain/langgraph`、`playwright`、`zod`、`dotenv`、`tsx` 等 Node.js 套件。
- **專案結構**：新增 `e2e-manager-ts/src/` 與 `e2e-manager-ts/tests/` 資料夾，放置所有 TypeScript 測試管理器原始碼。
- **環境要求**：主機需安裝 Node.js 18+ 環境。
