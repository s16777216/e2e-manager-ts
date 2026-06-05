## Why

目前專案缺乏自動化單元測試機制，對核心業務邏輯（例如群組防環判斷、Zod 劇本解析器）的程式碼修改無法在毫秒級別內得到快速驗證。特別是現有的群組防環邏輯 `findAncestors` 直接依賴資料庫，形成了高耦合，使得我們無法在不連接資料庫的情況下進行純邏輯驗證。此時引入單元測試框架並對邏輯進行解耦重構，能保障代碼的長期健壯性。

## What Changes

- 引入 **Vitest** 測試框架作為單元測試核心。
- 重構群組防環邏輯：將 `findAncestors` 函數從 `src/server.ts` 中解耦抽離至全新的 `src/services/groupService.ts`，並改用依賴注入（將 `groupRepo` 當作參數傳入）的形式。
- 新增單元測試檔 `tests/services/groupService.test.ts`，針對「無環的正常樹狀結構」與「循環嵌套的防環校驗」等場景編寫單元測試。
- 於 `package.json` 配置 `test` 與 `test:watch` 等測試指令。

## Capabilities

### New Capabilities
- `ts-unit-testing`: 引入 TypeScript 專案的單元測試環境、Vitest 配置與測試執行命令。

### Modified Capabilities
<!-- Existing capabilities whose REQUIREMENTS are changing (not just implementation).
     Only list here if spec-level behavior changes. Each needs a delta spec file.
     Use existing spec names from openspec/specs/. Leave empty if no requirement changes. -->


## Impact

- **依賴變更**：`package.json` 將新增 `vitest` 開發依賴。
- **程式碼變更**：
  - `src/server.ts`：移除私有的 `findAncestors` 邏輯，改為引入 `src/services/groupService.ts` 並傳入 `groupRepo` 調用。
  - `src/services/groupService.ts` [NEW]：存放解耦後的群組服務方法。
  - `tests/services/groupService.test.ts` [NEW]：存放 Vitest 單元測試案例。
