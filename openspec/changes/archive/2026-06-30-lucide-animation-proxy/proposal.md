## Why

專案中同時使用到 `lucide-react`（標準版靜態圖示）與 `frontend/src/components/icon` 中的客製化動畫版圖示。為了統一 UI 微互動體驗並確保開發的高效與一致性，我們希望能在不修改各 View 中既有 `import { ... } from "lucide-react"` 的前提下，讓編譯系統自動實施「優先引用動畫版，無則安全降級為標準版」的零侵入式代理機制。

## What Changes

* **零侵入式模組重定向**：利用 Vite 的 `alias` 別名攔截機制與 TS 的 `paths` 設定，將全站對 `"lucide-react"` 的引用重新定向至我們自建的代理層。
* **統一出口代理層**：建立 `src/lib/lucide-proxy.tsx` 檔案。對於已實作動畫版的圖示（如 `Settings`、`History`、`Folders` 等），導出動畫版元件；對於其他圖示，利用 `lucide-react` 的實體分發子路徑進行 re-export，以避開循環解析。

## Capabilities

### New Capabilities

- `lucide-animation-proxy`: 實作零侵入式的動畫圖示代理與靜態降級機制。

### Modified Capabilities

無

## Impact

* **編譯與開發配置**：
  * `vite.config.ts` (攔截 `^lucide-react$` 精確導入)
  * `tsconfig.json` (增加 `lucide-react` 的路徑對映以維持 IDE 型別解析)
* **核心代理模組**：
  * 新增 `frontend/src/lib/lucide-proxy.tsx` (動畫與降級圖示調度入口)
