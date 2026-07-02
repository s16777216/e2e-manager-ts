## Why

系統已完全轉移至 API Server 模式（`server.ts` + `queue.ts`），`main.ts` 的 CLI 入口點與 `parser.ts` 的 JSON 劇本解析器已無實際用途，繼續保留只會造成維護混淆。

## What Changes

- **刪除** `backend/src/main.ts`：CLI 入口點，包含 argument parsing、直接執行測試的邏輯
- **刪除** `backend/src/parser.ts`：JSON 劇本解析器，只被 `main.ts` 使用
- **修改** `backend/package.json`：移除 `dev`（指向 CLI）和 `start` 兩個 script，並將 `main` 欄位改指向 `dist/server.js`

## Capabilities

### New Capabilities

（無新增功能）

### Modified Capabilities

- `api-server-and-scenario-store`：移除 CLI 執行路徑後，測試執行的唯一入口改為透過 API Server（`/run` endpoint + queue worker）

## Impact

- `backend/src/main.ts`：刪除
- `backend/src/parser.ts`：刪除
- `backend/package.json`：移除 `dev`、`start` script；`main` 欄位改為 `dist/server.js`
- 無 API 變動、無資料庫 schema 變動
- `npm run dev` 與 `npm start` 這兩個指令將不再適用於後端（現有 `npm run server` 取代 dev 用途）
