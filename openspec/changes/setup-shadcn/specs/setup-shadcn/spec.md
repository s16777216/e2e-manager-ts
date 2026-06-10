## ADDED Requirements

### Requirement: Frontend UI library structure
前端專案 MUST 具備正確的 shadcn/ui 元件安裝配置，當使用 CLI 新增元件時，相關檔案 MUST 被正確寫入至專案的 `src/components/ui/` 目錄下。

#### Scenario: Verify component output path
- **WHEN** 執行 `npx shadcn add` 時
- **THEN** 元件檔案會被放置在 `frontend/src/components/ui/` 資料夾下，且不會產生額外的 `frontend/@` 資料夾
