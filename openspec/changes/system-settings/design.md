## Context

目前 Playwright 的 headless、slowMo、viewport 等調試與瀏覽器參數皆硬編碼於 `browser.ts` 的 `BrowserManager` 類別中，不利於開發者在 headed 模式下檢視 AI 執行的操作軌跡，或針對網頁渲染速度調整延遲。
為了建立靈活的調試手段，並提供資料庫歷史清除機制，本變更案將實作系統全域設定的 API 管道、後端 JSON 檔案持久化，以及前端 Bento 風格的設定面板。

## Goals / Non-Goals

**Goals:**
- 後端建立 `settings.json` 讀寫配置模組，並提供 `GET /api/settings` 與 `POST /api/settings` API。
- 後端提供 `DELETE /api/settings/history` API，一鍵清除資料庫中的所有測試執行歷史與步驟截圖，防止 PostgreSQL 空間爆滿。
- 重構 `BrowserManager`，在 `initBrowser` 啟動 Playwright 瀏覽器時動態加載 `settings.json` 中的 `headless`、`slowMo`、`defaultTimeout`、`viewportWidth`、`viewportHeight` 配置。
- 前端調整側邊欄導航，使底部設定圖示連結導向 `/settings` 路由。
- 前端實作 `SettingsView.tsx`，以 Bento 排版提供 Playwright 參數調整表單與具備防誤點二次確認彈窗的「清除歷史紀錄」按鈕。

**Non-Goals:**
- 本變更案不包含對模型提供者（LLM Provider）的切換或 OpenAI 相容格式支援。該功能將留待下一階段的獨立變更案（`support-openai-models`）實作。
- 不包含設定多使用者權限，所有操作者皆共用此全域設定。

## Decisions

### 1. 採用 JSON 檔案（`settings.json`）進行設定持久化
- **決策說明**：將設定以 JSON 檔案的形式保存在後端專案目錄下，而非在 PostgreSQL 中建立資料表。
- **理由**：設定值均為全域單一的 Key-Value 結構。直接讀寫 JSON 檔案開發效率極高，能避免編寫 SQL Migration 及在 PostgreSQL 新增無關聯的配置表，保持程式碼精簡度。

### 2. 歷史紀錄清除利用 PostgreSQL 外鍵 Cascade 機制
- **決策說明**：在清除執行歷史時，直接清除 `TestRun` 資料表。
- **理由**：在 `TestLog.ts` 實體中，與 `TestRun` 的關係已宣告 `{ onDelete: "CASCADE" }`。因此，直接從 `TestRun` 表進行清空刪除時，PostgreSQL 會自動 Cascade 級聯清空關聯的所有步驟日誌及二進位截圖數據，這不僅速度極快，也能防止資料庫產生孤立的髒數據。

### 3. CI/CD 環境下強制 Headless 的安全覆寫
- **決策說明**：當在 `BrowserManager` 載入設定時，加入環境變數檢查。
- **理由**：雖然使用者可能在設定頁面將 `headless` 設為 `false`（以便本地調試），但若該專案未來於無圖形介面的 CI/CD 環境中（例如 GitHub Actions、Process 沒有 DISPLAY）執行，Playwright 開啟 headed 瀏覽器將會直接崩潰。因此，若偵測到 `process.env.CI` 或 `process.env.HEADLESS_FORCE` 時，將強制覆寫為 `headless = true` 以確保安全。

## Risks / Trade-offs

- **[風險]**: 使用者將 `slowMo` 動作延遲設定過高，導致整個測試案例大幅拉長並超出預設等待時間。
  - **[對策]**: 前端表單輸入時限制最大毫秒值（例如 `slowMo` 上限 3000ms），並在 Timeout 輸入框增加合理範圍提示。
- **[風險]**: 本地設定檔 `settings.json` 被手動損壞。
  - **[對策]**: 讀取設定檔時加入 Try-Catch 區塊，若發生 JSON 解析錯誤，會自動備份損壞檔案，並使用預設配置重建 `settings.json`。
