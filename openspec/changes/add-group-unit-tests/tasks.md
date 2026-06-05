## 1. 測試環境與依賴配置 (Setup)

- [ ] 1.1 於 `package.json` 安裝 `vitest` 開發依賴
- [ ] 1.2 於 `package.json` 的 `scripts` 配置測試啟動指令 `"test": "vitest run"` 與 `"test:watch": "vitest"`

## 2. 核心業務邏輯重構 (Refactoring & Decoupling)

- [ ] 2.1 新增服務模組 `src/services/groupService.ts`，實作解耦後的 `findAncestors` 函數（接受 `groupRepo` 作為參數）
- [ ] 2.2 修改 `src/server.ts`，移除原有的 `findAncestors` 私有方法，在 `PATCH /api/groups/:id` 端點引入並改用新 service 的 `findAncestors` 實作

## 3. 單元測試實作與驗證 (Testing & Verification)

- [ ] 3.1 建立單元測試檔案 `tests/services/groupService.test.ts`，實作「正常樹狀結構祖先查詢 (場景 A)」的單元測試
- [ ] 3.2 於 `tests/services/groupService.test.ts` 實作「循環嵌套判定 (場景 B)」與其他邊界條件（如父群組指向自己）的防環單元測試
- [ ] 3.3 本地執行 `npm run test` 執行單元測試，確保所有測試全部通過
