## Context

原先「批次任務執行歷史紀錄」是放置在個別「專案詳情頁（`ProjectDetailView.tsx`）」的底部。然而，隨着測試任務增長，將其混合在專案內使介面繁瑣。為了提供更清楚的跨專案全域監控，設計引入獨立的「執行紀錄」頁面。

## Goals / Non-Goals

**Goals:**
- 提供在左側側邊欄的全新導航入口「執行紀錄 (History)」，點擊導航至全域任務紀錄頁。
- 提供全新的 `HistoryView.tsx`，展示全域最近 100 筆測試執行任務，包含專案名稱、任務 ID、進度、狀態與時間。
- 於 `HistoryView.tsx` 整合 Bento 磨砂玻璃設計的統計指標，呈現全域測試量、成功率。
- 移除專案詳情頁底部的歷史紀錄，簡化其介面。
- 支援使用者點擊全域表格中任何一列，可無縫轉跳至該任務的監控詳情頁（`TaskDetailView`）。

**Non-Goals:**
- 本次設計不包含測試案例本身的歷史紀錄（Testcase run history）移出，該功能仍保留於 `TestCaseDetailView` 內。
- 本次不進行 Task 實體欄位（如資料庫表結構）的修改，保持原 Task 欄位不變。

## Decisions

### 1. 後端 `GET /api/tasks` 跨專案反查與聯表加載
* **決策**：不調整 `Task` 實體的表結構（亦即不新增 `projectId` 欄位），而是使用 TypeORM 的聯表查詢加載 `runs.testcase.group.project`。
* **原因**：雖然新增外鍵 `projectId` 可以讓查詢更直接，但這需要進行 DB Migration。既然 `runs` 中已經保存了 `testcase` 關係，而 `testcase` 與 `Project` 之間存在鏈路，因此利用 SQL 聯表能保證資料的一致性，且免去 migration 成本。
* **做法**：
  * 當 `scope === "project"`，其 `scopeId` 即為 `projectId`，我們從 Node.js 記憶體中全量載入 Project 做的 Map 進行快速反查名稱。
  * 當 `scope === "group"` 或 `"testcase"`，從聯表的 `runs[0].testcase.group.project` 解構取得專案名稱與 ID。

### 2. 前端篩選 (Filter) 的實作
* **決策**：在 `HistoryView.tsx` 獲取全局最近的 100 筆任務後，在前端記憶體中進行「專案」與「狀態」的篩選。
* **原因**：全域歷史通常不會在一次查看中超過數百筆，在前端進行 instant filtering 可以提供完全沒有延遲的即時互動體驗，不需要為每次篩選都發送 HTTP Request 到後端。

---

## Risks / Trade-offs

- **[Risk]** 當 Task 中無任何 runs 時（例如異常初始化失敗的任務），如何顯示其所屬專案？
  - **Mitigation**：如果 runs 為空，且 `scope === "project"`，可以直接透過 `scopeId` 查出專案名稱。如果 `scope === "group"`，我們可以透過 `scopeId` 查出對應的 group，再聯表 group.project 取得。但通常，發起批次任務時一定會寫入 runs，若是極少數空 runs 且 scope 為 group/testcase，我們回傳 `未知專案` 作為防呆。
