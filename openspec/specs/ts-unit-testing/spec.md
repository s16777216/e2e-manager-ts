# ts-unit-testing Specification

## Purpose
TBD - created by archiving change add-group-unit-tests. Update Purpose after archive.
## Requirements
### Requirement: TypeScript Unit Testing Environment
系統 MUST 提供支援原生 ESM 與 TypeScript 的單元測試執行環境。測試執行器 SHALL 原生支援 TS 檔案導入與執行，無需繁瑣的編譯設定，且 SHALL 提供單次運行（run）模式與開發時的監聽（watch）模式。

#### Scenario: Single test execution via CLI
- **WHEN** 開發者執行 `npm run test` 啟動測試命令
- **THEN** 系統以單次運行模式啟動單元測試，執行所有檢測到的測試檔案，輸出成功/失敗統計並安全退出

#### Scenario: Watch mode for active development
- **WHEN** 開發者執行 `npm run test:watch` 啟動測試命令
- **THEN** 系統以監聽模式啟動，保持進程常駐，並在偵測到原始碼或測試檔修改時，自動重新運行相關測試

### Requirement: Mock and Stub support for Isolation
測試環境 SHALL 提供 Mock 與 Stub 的功能，以便在不發起真實 PostgreSQL 資料庫連線或不開啟 Playwright 瀏覽器的前提下，對包含外部相依性的核心業務邏輯進行徹底的邏輯隔離測試。

#### Scenario: Mock database repository query
- **WHEN** 單元測試執行防環邏輯時，傳入被 Stub 化的 groupRepo，並調用 `findOne`
- **THEN** 系統不發起真實 SQL 連線，而是直接藉由 Stub 函數回傳模擬的群組節點資料，防環計算得出預期結果

