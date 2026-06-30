## Context

目前全站頁面大多採用靜態匯入標準的 `lucide-react`。為了在不改動任何頁面程式碼的情況下，讓現有（以及未來新增）的客製化動畫圖示自動在全站生效，我們需要設計一套零侵入式的編譯期攔截機制。

這套機制的核心在於：將所有的 `import { ... } from "lucide-react"` 攔截並重定向至我們自建的 `lucide-proxy.tsx` 代理入口。同時，代理入口需要能夠「降級 re-export」所有未實作動畫的原生圖示，且避開別名循環。

## Goals / Non-Goals

**Goals:**
* 在不改動任何頁面 `import` 程式碼的情況下，全站靜態使用 `Folders`、`FolderPlus`、`History`、`Settings`、`FileText`、`Home` 等圖示自動替換為客製動畫版。
* 當動畫版未提供時，自動且無縫地降級至標準的 Lucide 原生圖示。
* 保持開發工具（VSCode/Cursor）在代碼編寫時，對 `lucide-react` 匯入的強型別與 API 自動補完支援。

**Non-Goals:**
* 不修改任何 View 元件檔案中的 icon 元件名稱。
* 不影響 `DynamicIcon` 這種基於 runtime 的字串動態載入元件（該元件已在 nested-routing 中做過統一代理）。

## Decisions

### 1. 採用 Vite RegExp Alias 進行精確路徑攔截
* **決策**：在 `vite.config.ts` 的別名配置中，使用精確正則別名 `find: /^lucide-react$/` 指向 `src/lib/lucide-proxy.tsx`。
* **理由**：這能確保別名僅對 `import ... from "lucide-react"` 生效，而當我們在代理層中引用 `lucide-react/dist/...` 時，將不會被此別名再次攔截，進而成功避開編譯期的死循環。

### 2. 繞過別名解析獲取原始庫
* **決策**：在 `src/lib/lucide-proxy.tsx` 中，使用 `export * from "lucide-react/dist/esm/lucide-react.js"` 來 re-export 原生庫。
* **理由**：Vite 在解析 ESM 子路徑時，會直接讀取該實體檔案位置，使其成為唯一安全、能完美導出所有 1000+ 個原生圖示且不發生循環依賴的出口。

### 3. TypeScript Paths 同步配置
* **決策**：在 `tsconfig.json` 的 `compilerOptions.paths` 配置中增加 `"lucide-react": ["./src/lib/lucide-proxy.tsx"]`。
* **理由**：IDE 與 TS 編譯器會依此路徑尋找 `lucide-react` 的導出定義，這使開發者在使用時能直接看見代理層所封裝的動畫圖示元件型別，保持完美的 DX。

## Risks / Trade-offs

* **[風險]** `lucide-react` 的 `dist/esm/lucide-react.js` 實體打包入口在未來 major 大版本更新時可能變更。
  * **[對策]** 專案目前 package.json 鎖定了 lucide 的依賴版本。若日後需要升級，也僅需在 `lucide-proxy.tsx` 中修改這一行底層 ESM 匯出路徑即可，維護成本極低。
* **[風險]** 覆蓋導出時產生重複匯出的編譯警告（Duplicate Exports）。
  * **[對策]** 在 `lucide-proxy.tsx` 中，優先使用具體命名的 `export { ... }` 導出動畫元件。大部分現代編譯器（如 esbuild、rollup）會優先採用具體命名導出，若產生警告，可透過優化 TS paths 設定來消除。
