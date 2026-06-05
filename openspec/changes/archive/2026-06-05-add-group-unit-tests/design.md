## Context

當前 `e2e-manager-ts` 專案中的群組樹祖先鏈查詢與防環邏輯 `findAncestors` 直接定義在 API 層 `src/server.ts` 內，且直接讀取全域 `AppDataSource` 連線實例。這使得該核心防環邏輯與資料庫、API 框架產生了高度耦合，無法被獨立測試。在引入 Vitest 測試框架的同時，我們需要透過依賴注入（Dependency Injection）將該業務邏輯解耦重構，以實現輕量、高效的單元測試。

## Goals / Non-Goals

**Goals:**
- 引入 **Vitest** 作為單元測試核心，並配置於開發環境中。
- 將 `findAncestors` 邏輯從 `src/server.ts` 抽離，建立獨立的群組服務模組 `src/services/groupService.ts`。
- 對 `findAncestors` 與防環邏輯進行依賴注入重構（接受 Repository 作為參數）。
- 為防環邏輯編寫覆蓋完整場景（正常樹狀結構、循環嵌套檢測、父群組為自己等）的單元測試，確保測試執行不依賴任何真實 PostgreSQL 資料庫連線。

**Non-Goals:**
- 不修改與外部 API 的 HTTP 請求/響應結構合約（維持原 API 接口與錯誤回傳碼）。
- 本次不進行涉及真實資料庫的整合測試（Integration Tests）或 AI Agent 流程 E2E 測試的重構。

## Decisions

### 1. 測試框架選用 Vitest
- **決定**：使用 `vitest` 作為單元測試執行器，而非 `jest`。
- **理由**：專案使用原生 ES Modules (`"type": "module"`) 與 TypeScript。Jest 在原生 ESM 下的配置極為繁瑣，容易遇到模組導入解析問題；而 Vitest 對 ESM 與 TS 的支援是開箱即用的，且執行速度非常快，與 Jest 的斷言 API 高度相容。

### 2. 依賴注入 (DI) 設計
- **決定**：重構 `findAncestors(group, groupRepo)` 函數簽名，使其接受 `groupRepo` (對應 TypeORM 的 Repository) 作為第二參數。
- **理由**：這能將該核心純邏輯與全域資料庫連線實例解耦。在單元測試中，我們僅需傳入一個簡單的 Stub 物件 `{ findOne: vi.fn(...) }`，即可在無資料庫連線下驗證純遞迴演算法的正確性。

---

## Risks / Trade-offs

- **[Risk] 依賴注入導致代碼呼叫處需要修改** → *[Mitigation]*：該防環邏輯在 `src/server.ts` 中僅在 `PATCH /api/groups/:id` 端點的修改父群組業務中被調用。影響面極窄，且可透過 TS 編譯型別檢查來確保參數傳遞的正確性。
