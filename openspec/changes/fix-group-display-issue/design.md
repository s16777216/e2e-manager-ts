## Context

目前系統在後端資料庫中使用 adjacency-list 儲存 `TestGroup` 的樹狀階層結構，並於 `GET /projects/:projectId/groups` 端點將其在後端組裝為包含 `children` 屬性的樹狀階層 JSON 陣列並返回給前端。
前端的 `useGroupData` Hook 目前在取得此樹狀資料後，使用 `buildGroupTree` 重新在前端組裝樹。然而：
1. `buildGroupTree` 假定傳入的是扁平的陣列，因此僅對第一層的根節點進行 `forEach`。
2. 它在重構時將各節點的 `children` 設為空陣列，導致所有子群組節點被丟棄。
3. `groups` 狀態直接被設為後端返回的樹狀結構（僅包含根節點的陣列），使得 `groups.find` 在編輯或操作子群組時無法正確找到目標。

## Goals / Non-Goals

**Goals:**
- 完整展示多層級（嵌套）子群組結構。
- 支援任意層級群組的編輯定位與刪除操作。
- 在建立子群組後，自動展開其父群組以改善使用者體驗 (UX)。

**Non-Goals:**
- 不修改後端 API 路由與返回格式。
- 不修改後端資料庫 Schema（維持 TypeORM `@Tree` 結構）。

## Decisions

### 1. 廢除前端 buildGroupTree，直接使用後端回傳樹狀資料
- **選擇**：廢除 `buildGroupTree` 函式，直接將後端回傳的樹狀結構儲存為 `groupTree`。
- **理由**：後端已經做了完整的樹狀組裝，前端二次組裝不僅多餘且容易出錯。
- **替代方案**：修改後端 API 使其返回扁平資料。但這會破壞現有的後端封裝，且增加網路資料傳輸量。

### 2. 在前端遞迴補齊 parentId 並生成扁平的 groups 陣列
- **選擇**：在 `useGroupData` 內增加 `processGroupTree` 遞迴函式。該函式在一次遍歷中完成兩項工作：
  1. 確保樹狀結構中的每個節點皆有明確的 `parentId`（提取 `parent.id`）。
  2. 將所有節點收集到一個扁平的 `flat` 陣列中，並將其設定為 `groups` 狀態。
- **理由**：這使得 `groups.find()` 可以繼續在扁平陣列中正常工作，而不必編寫複雜的樹狀遞迴尋找邏輯。

### 3. 主動展開新建子群組的父群組
- **選擇**：在 `ProjectDetailView.tsx` 中呼叫 `onCreateGroup` 成功後，若有 `parentId`，則自動在 `expandedGroups` 狀態中將該 `parentId` 設為 `true`。
- **理由**：直接反饋使用者的建立動作，免去使用者手動展開的困擾。

## Risks / Trade-offs

- **[Risk]** 遞迴處理樹狀結構在層級極深時可能導致效能問題或 Call Stack Overflow。
  - **Mitigation**：測試專案的群組階層實務上通常小於 5 層，資料規模極小（數百個節點以內），此處遞迴的效能開銷可忽略不計。
