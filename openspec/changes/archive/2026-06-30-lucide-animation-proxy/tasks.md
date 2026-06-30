## 1. 建立代理核心模組 (lucide-proxy.tsx)

- [x] 1.1 在 `frontend/src/lib/` 下建立全新的代理模組 `lucide-proxy.tsx`。
- [x] 1.2 在 `lucide-proxy.tsx` 中，具體匯入並命名對齊 Lucide 的動畫元件（包含 `Folders`、`FolderPlus`、`History`、`Settings`、`FileText`、`Home` 等）。
- [x] 1.3 利用 `export * from "lucide-react/dist/esm/lucide-react.js"` 來實現其他原生圖示的安全導出。

## 2. 編譯與型別配置別名 (Alias Settings)

- [x] 2.1 修改 `frontend/vite.config.ts`（或專案 vite 配置），在 `resolve.alias` 中新增針對 `^lucide-react$` 的正則別名，指向 `lucide-proxy.tsx`。
- [x] 2.2 調整型別配置（最終決定不在 tsconfig 內重定向，以便編譯器無感套用 node_modules 中 lucide-react 原始型別，並於 `lucide-proxy.tsx` 加上 `// @ts-nocheck`）。

## 3. 編譯驗證與執行測試

- [x] 3.1 執行 `npm run build -w frontend`，確保打包編譯成功，無循環依賴報錯與型別衝突。
- [x] 3.2 啟動開發伺服器，手動驗證頁面中的靜態 `lucide-react` 圖示（如設定、專案列表）是否已自動呈現 hover 動畫效果，且其他未動畫化的圖示能安全顯示。
