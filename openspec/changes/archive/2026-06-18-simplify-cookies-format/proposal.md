## Why

目前 `initCookies` 設計為 JSON 陣列格式，要求使用者手動填寫包含 name, value, domain, path 等完整屬性的物件陣列，導致設定極度繁複且容易出錯。改為統一以網域路徑為 Key 的 JSON 物件分組（Key-Value）格式，可大幅提升配置的可讀性與使用者體驗。

## What Changes

- **BREAKING**: 將前端的 `initCookies` 儲存與輸入格式從 `PlaywrightCookie[]` (JSON 陣列) 更改為以網域路徑為 Key 的 JSON 物件分組格式（如 `Record<string, Record<string, string>>`）。
- **BREAKING**: 後端將原本以唯一鍵 `name:domain:path` 為基礎的 Cookie 陣列合併邏輯，調整為支援網域物件的雙層深度合併（Deep Merge，同網域下的子層屬性覆蓋父層）。
- 後端於測試執行前，自動將該雙層 JSON 物件解析並還原為 Playwright 要求的 Cookie 格式進行注入。
- 前端 `JsonEditorAccordion` 統一將 Cookie 驗證規則調整為 JSON 物件，並更新 placeholder 為新格式範例。

## Capabilities

### New Capabilities

*(無)*

### Modified Capabilities

- `testcase-management`: 調整 `initCookies` 的規格定義，規定必須以網域路徑為 Key 且值為 Cookie 鍵值對的 JSON 物件形式進行宣告，並由系統進行二層深度合併與自動 Playwright 格式還原。

## Impact

- **前端 UI**:
  - [JsonEditorAccordion.tsx](file:///c:/works/e2e-manager-ts/frontend/src/components/custom/JsonEditorAccordion.tsx) 的 `validateCookies` 與 placeholder。
- **後端服務**:
  - [environmentService.ts](file:///c:/works/e2e-manager-ts/backend/src/services/environmentService.ts) 的 `mergeCookies` 合併規則。
  - [queue.ts](file:///c:/works/e2e-manager-ts/backend/src/queue.ts) 的 Playwright Cookie 解析還原與注入邏輯。
- **測試**:
  - [environmentService.test.ts](file:///c:/works/e2e-manager-ts/backend/tests/services/environmentService.test.ts) 中的單元測試案例。
