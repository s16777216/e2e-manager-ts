## Context

系統自 `serverize-e2e-manager-with-db` 變更後已完全轉移至 API Server 模式。
測試執行透過 `server.ts` 接收 HTTP 請求，再由 `queue.ts` 的背景 Worker 呼叫 `E2EGraphBuilder`。

`main.ts`（CLI 入口）和 `parser.ts`（JSON 劇本解析器）是過渡期的遺留產物，兩者均已無 import 被 server 端呼叫。

## Goals / Non-Goals

**Goals:**
- 移除 `main.ts` 與 `parser.ts` 兩個無用檔案
- 更新 `package.json`，使 scripts 與實際進入點一致
- 消除維護者因看到 `npm run dev` 指向 CLI 而產生的困惑

**Non-Goals:**
- 不改動任何 API 端點行為
- 不改動資料庫 schema
- 不清理資料庫中歷史遺留的 "CLI Projects" 資料

## Decisions

### 直接刪除，不做 deprecation 期

`main.ts` 和 `parser.ts` 目前在整個 codebase 中只有自身的 import 關係，沒有任何其他模組依賴它們。直接刪除是最乾淨的做法，沒有理由保留一個過渡期。

### package.json scripts 調整方式

| script | 原本 | 變更後 |
|--------|------|-------|
| `dev` | `tsx src/main.ts` | 移除 |
| `start` | `node dist/main.js` | 移除 |
| `main` 欄位 | `dist/main.js` | `dist/server.js` |

`server` script（`tsx src/server.ts`）已存在，直接作為開發啟動指令，無需新增。

## Risks / Trade-offs

- **歷史 CI/CD 腳本**：若有外部腳本使用 `npm run dev` 或 `npm start` 啟動後端，移除後將失效。→ 目前無 CI pipeline，風險可接受
- **`npm run dev` 語義轉移**：根目錄的 `package.json` 有自己的 `dev` script，後端目錄不再有同名指令，需確保開發文件更新一致
