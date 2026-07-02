## REMOVED Requirements

### Requirement: CLI Test Execution
**Reason**: 系統已完全改由 API Server 模式運作，CLI 模式為過渡期遺留，已無使用路徑。
**Migration**: 透過 `POST /api/testcases/:id/run` 觸發測試執行，再以 `GET /api/runs/:runId` 查詢結果。
