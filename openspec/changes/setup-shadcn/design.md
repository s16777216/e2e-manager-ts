## Context

目前前端 `components.json` 中的 aliases 配置使用了 `@/components` 等設定。由於專案主目錄的 `tsconfig.json` 僅設定了參考項目 (references) 而未直接定義 `paths` 別名對照，當執行 `npx shadcn add` 時，CLI 無法在根目錄正確解析該別名，進而直接建立了一個名為 `@` 的實體資料夾。

## Goals / Non-Goals

**Goals:**
- 修正 `components.json` 設定，使後續下載 shadcn 元件時能落入正確的 `frontend/src/components/ui/` 目錄下。
- 清除並刪除錯誤產生的 `frontend/@` 資料夾及其內部檔案。
- 重新將 `button` 元件下載至正確的路徑下，為後續元件化重構做好準備。

**Non-Goals:**
- 不進行整個網頁的 UI 重構，本次變更僅限於配置修正、髒檔案清理與基礎元件的正確下載。

## Decisions

### 1. 修改 `components.json` 的別名映射
- **決策**：將 `components.json` 中的 `aliases` 別名配置修正為相對於前端根目錄的 `src/...`：
  ```json
  "aliases": {
    "components": "src/components",
    "utils": "src/lib/utils",
    "ui": "src/components/ui"
  }
  ```
- **理由**：相較於在根目錄 `tsconfig.json` 加入複雜的別名映射，直接將 `components.json` 改為明確的實體路徑（`src/...`）能確保無論在何種 shell 或環境下執行 shadcn CLI，都能將元件正確輸出到指定資料夾，完全避免別名解析失敗的問題。

## Risks / Trade-offs

- **[Risk] 元件引用路徑問題**
  - *說明*：將 `components.json` 中配置改為 `src/...` 後，如果未來使用 `npx shadcn add` 時，新增的元件程式碼內部如果有 import 其他 shadcn 元件，可能會預設寫為實體路徑而非別名。
  - *對策*：Vite 的 path mapping 本身支援 `@/` 指向 `src/`，手動引用時仍可自由使用 `@/components/ui/button`。我們只需注意 shadcn 自動生成的 import 寫法即可。
