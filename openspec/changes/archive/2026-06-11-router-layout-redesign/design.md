## Context

當前 `e2e-manager-ts` 的側邊欄與路由結構已不敷使用，當測試群組與劇本數量增加時，左側側邊欄狀態變的異常臃腫且難以維護。為了使 IDE 更具擴展性、介面更加美觀，需要進行路由架構重構與版面簡化。

## Goals / Non-Goals

**Goals:**
- 將群組樹與測試案例樹移出 Sidebar，簡化 `RootLayout` 側邊欄。
- 引入獨立的專案列表頁、專案詳情頁與測試案例步驟與歷史紀錄頁。
- 前端群組樹採用「懶加載」機制：在展開群組節點時動態加載其底下的測試案例，減少後端 API 修改幅度。
- 優化執行監控（SSE Console）的路由歸屬，點擊返回能正確回到特定測試案例詳情頁。
- 提供符合 Bento 設計系統之精美 UI 設計與 Hover 微動畫。

**Non-Goals:**
- 不對測試執行的底層 Queue 或 SSE 串流協議本身進行重構。
- 不修改與 E2E 視覺測試無關的前端其他次要設定面板。
- 不修改後端的群組 API（不改動 `GET /projects/:projectId/groups` 路由）。

## Decisions

### 1. 前端懶加載測試案例 (Lazy Loading)
- **決策**：前端在展開群組樹節點時，動態發送現有的 `GET /groups/:groupId/testcases` 請求來獲取測試案例，並快取在前端的 state 中。
- **理由**：這使得我們**完全不需要修改後端的群組 API**。後端只維持既有的資料庫結構與 API 定義，前端能在展開時按需載入，大幅降低後端代碼改動帶來的風險。
- **替代方案**：後端修改 `GET /projects/:projectId/groups` 載入 testcases 關係，並回傳完整的樹。這需要更改 SQL 查詢與後端實體映射組裝，在群組數量極多時也會有一次性載入過多資料的效能負擔。

### 2. 淘汰 GroupDashboardView，點擊群組節點僅展開/收合
- **決策**：當使用者在樹狀圖中點選「群組」名稱時，僅更新 `selectedGroupId` 供表單新增預設值使用，並觸發該群組節點的展開/收合狀態，不跳轉路由。
- **理由**：測試案例的管理已經有獨立的 `/project/:projectId/testCase/:testCaseId` 路由，不再需要舊的 `GroupDashboardView` 來列出劇本，將點選群組改為僅展開/收合，符合常見 IDE 檔案目錄的直覺操作。
- **替代方案**：點選群組仍跳轉路由。這在重構後變得冗餘，因為群組底下沒有其他特定頁面需要管理。

### 3. 全域新增按鈕與 Pre-selected 狀態的互動
- **決策**：前端維護當前被選取的群組 ID `selectedGroupId`。
  - 當點選樹中群組時，更新 `selectedGroupId`。
  - `+ 建立群組`：若 `selectedGroupId` 存在則做為預設 parentId；若否，預設為「根群組」(null)。
  - `+ 建立測試案例`：Dialog 的群組選擇欄位為必填。若 `selectedGroupId` 存在則做為預設預選值；若否，欄位留白並強制使用者手動選擇群組。
- **理由**：測試案例在資料庫實體中與群組為強關聯（必須要有 group 外鍵），因此強制要求選擇群組以防資料庫報錯。而群組的 parentId 可以為 null（代表根群組），故允許留白。
- **替代方案**：不提供全域按鈕，僅在樹狀圖節點 hover 時提供快捷新增按鈕。這會使介面太過隱蔽，初次使用者不易發現新增入口。

## Risks / Trade-offs

- **[Risk] 展開群組時延遲 (Lazy Load)** ➡️ 由於測試案例是懶加載，使用者展開群組時會有些微等待載入的時間。
  - *Mitigation*：前端使用小型的載入圖示 (Spinner) 提供流暢的視覺回饋。同時已加載過的群組會快取在前端 state 中，再次展開時能即時呈現，避免重複呼叫 API。
- **[Risk] 舊路由的相容性** ➡️ 原本的 `/projects/:projectId` 與 `/runs/:runId` 路由將失效。
  - *Mitigation*：前端 React Router 使用 `Navigate` 進行全域相容跳轉，或將未知路由全數導回首頁，避免使用者重新整理時出現空白頁。
