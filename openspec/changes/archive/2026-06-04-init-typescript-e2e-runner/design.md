## Context

專案目前已於根目錄實作完畢 Python 版的 E2E 測試管理器。本變更旨在於 `e2e-manager-ts/` 資料夾中實作全 TypeScript 版本，平移移植所有核心邏輯，並採用 Node.js/TS 原生的 LangGraphJS 與 Playwright 生態，為未來的測試工程化建立更高水準的底座。

## Goals / Non-Goals

**Goals:**
- 初始化 TypeScript 專案與 tsconfig.json 配置，採用現代 ES Modules (ESM) 規範。
- 使用 `@langchain/langgraph` (JS/TS 原生版) 與 `TestState` 重新建構測試圖。
- 移植並以型別安全方式實作 Playwright 瀏覽器控制、`ignoreHTTPSErrors`、及 DOM 簡化過濾器（含當前輸入 value 的動態渲染）。
- 使用 `zod` 進行劇本驗證，並結合 Gemini 進行型別安全的結構化視覺斷言。
- 實作步驟完成截圖、失敗當刻截圖（`screenshot_fail.png`），與完整的 Markdown 測試報告生成器。

**Non-Goals:**
- 本階段不移除非 TS (Python) 版本程式碼，兩者共存於 workspace。
- 不進行 Docker 容器化打包（保留至 Phase 3 整合）。
- 不開發網頁版儀表板 (Dashboard) 介面。

## Decisions

### 1. 執行引擎與轉譯選型：tsx (TypeScript Execute)
- **選擇**：TypeScript + `tsx` 執行引擎。
- **理由**：`ts-node` 在處理 Node.js ES Modules (ESM) 時配置極為繁雜且易出錯。`tsx` 能無縫且快速地直接執行 ESM 規範下的 TS 檔案，且不需要額外的轉譯步驟，開發體驗與反應速度極佳。

### 2. 資料驗證與結構化輸出：Zod
- **選擇**：使用 `zod` 作為型別約束與 Schema 驗證工具。
- **理由**：Zod 是 Node.js 圈最流暢、最主流的 Schema 驗證庫。LangChain.js 官方首選 Zod 作為 Tool parameters 的 Schema 限制，以及 Gemini 的 `.withStructuredOutput(zodSchema)` 強制 JSON 結構化輸出手段，穩定度極高。

### 3. Playwright 非同步事件控制
- **選擇**：採用原生的 `playwright` (Node.js SDK)。
- **理由**：Playwright 本身就是以 TS/JS 為核心設計的。其在 Node.js 下的 `page.fill`、`page.click`、以及 `ignoreHTTPSErrors: true` 相比於 Python 擁有更少的中間層開銷，對 React/Vue 等框架 DOM 反應式監聽支援更加完美。

## Risks / Trade-offs

- **[Risk] Node.js 處理 Playwright 非同步 Promise 容易因未捕獲異常 (Unhandled Promise Rejections) 導致瀏覽器處理程序殘留 (Zombie Chrome processes)**
  - **對策**：在 `main.ts` 入口點中，註冊 `process.on('unhandledRejection')` 與 `process.on('SIGINT')` 監聽器，強制觸發 `browserManager.closeBrowser()` 做安全清理。此外，在 LangGraph 的 `reporter` 節點中以 `finally` 確保關閉瀏覽器。
- **[Risk] 多模態圖片傳輸在 Node.js 中 Base64 過長導致記憶體暴增**
  - **對策**：利用 Node.js 原生的 `Buffer` 處理，在擷取 Playwright 截圖時對 Buffer 進行壓縮限制（必要時呼叫 Playwright 縮小 viewport），再以 Stream 或是 Base64 精簡字串傳遞給 Gemini，維持反應流暢度。
