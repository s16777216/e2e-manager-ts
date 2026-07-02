## 1. 刪除 CLI 相關檔案

- [ ] 1.1 刪除 `backend/src/main.ts`
- [ ] 1.2 刪除 `backend/src/parser.ts`

## 2. 更新 package.json

- [ ] 2.1 移除 `backend/package.json` 中的 `dev` script（`tsx src/main.ts`）
- [ ] 2.2 移除 `backend/package.json` 中的 `start` script（`node dist/main.js`）
- [ ] 2.3 將 `backend/package.json` 中的 `main` 欄位由 `dist/main.js` 改為 `dist/server.js`
