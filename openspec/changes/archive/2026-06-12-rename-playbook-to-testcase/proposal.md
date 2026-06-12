## Why

目前系統的前端中文 UI 將測試項目稱為「劇本（Playbook）」，但在代碼、API 模型及測試術語中皆為 `Testcase`。這造成了前後端對應的認知混淆，且在軟體測試業界中，「測試案例 (Test Case)」是更通用、專業且標準的術語。

本變更將全面將 UI 上的「劇本」字眼替換為「測試案例」，以確保系統語意一致性。

## What Changes

- **名詞統一修正**：將前端 UI（如首頁、專案詳情、劇本詳情、SSE 監控 Console 等）中所有的「劇本」中文字詞，全面替換為「測試案例」或「案例」。
- **提示語與吐司通知 (Toast) 修正**：將 Hook 及資料請求的成功或失敗通知中的「劇本」字眼改為「測試案例」（例如「測試劇本建立成功」改為「測試案例建立成功」）。
- **完全保留後端與 API Model**：保持後端及資料模型中的英文命名（`Testcase`、`testcaseCount`、`api.createTestcase` 等）不變，以確保沒有 runtime 系統風險。

## Capabilities

### New Capabilities
- 無

### Modified Capabilities
- `e2e-web-dashboard`: 修改前端頁面（WelcomeView, ProjectsView, ProjectDetailView, TestCaseDetailView, SSEConsoleView）與 GroupTreeNode 元件，將 UI 呈現的中文「劇本」替換為「測試案例」，以契合原有的 `testcase` 命名空間與業界標準。

## Impact

- **Affected Front-end Views**: `ProjectsView.tsx`, `ProjectDetailView.tsx`, `TestCaseDetailView.tsx`, `SSEConsoleView.tsx`, `WelcomeView.tsx`
- **Affected Components**: `GroupTreeNode.tsx`
- **Affected Hooks**: `useTestcaseData.ts`
