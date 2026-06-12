## Context

後端自動化測試引擎在執行測試時，一個劇本步驟（具有相同的 `stepIdx`）可能會因為包含多個 Playwright 工具調用或重試，而在資料庫中產生多筆 `TestLog`。同時，為節省資料庫容量，只有該步驟的最後一筆日誌會包含二進位截圖數據（`screenshotData`）。
目前前端在 `SSEConsoleView.tsx` 的 Console 時間軸及測試歷史詳細頁面中，均是將這些日誌平鋪列出，這在包含大量操作或重試時會使介面極為冗長難讀，且截圖散落各處。
本設計旨在前端引入步驟分群（Group by Step）與折疊式 Timeline 排版，提升日誌報告的易讀性。

## Goals / Non-Goals

**Goals:**
- **步驟分群數據處理**：在前端將日誌數據以 `stepIdx` 為維度，聚合為包含該步驟描述、子日誌列表以及最終步驟截圖的結構化對象。
- **即時日誌流（SSE）動態聚合**：使 `SSEConsoleView.tsx` 在接收實時日誌事件時，能夠動態更新對應的步驟區塊，而非簡單的尾部追加。
- **Bento 折疊式 UI 設計**：
  - 每一步驟對應一個 Accordion 折疊區塊。
  - 展開面板後，以時序時間軸呈現該步驟的所有 Tool 調用動作（例如 `fill_input`）。
  - 當該步驟的最後一筆日誌附帶截圖時，在該 Accordion 底部或側邊呈現大圖預覽，並支援滑鼠 hover 懸停放大。

**Non-Goals:**
- 不修改後端 API 結構，完全在前端利用現有 API 回傳的 `TestLog[]` 進行數據結構轉換與即時動態歸類。

## Decisions

### 1. 前端數據結構轉換
我們將透過一個 Utility 函式，將扁平的 `TestLog[]` 轉換為以步驟為單位的聚合陣列 `GroupedStep[]`。
其定義結構如下：
```typescript
interface GroupedStep {
  stepIdx: number;
  stepDescription: string;
  logs: {
    id: string;
    action?: string;
    result?: string;
    aiResponse?: string;
    createdAt: string;
  }[];
  screenshotLogId?: string; // 帶有截圖的最後一筆日誌 ID (用來向後端請求圖片 Blob)
}
```

### 2. 即時日誌流（SSE）的動態歸類邏輯
在 `SSEConsoleView.tsx` 監聽 EventSource 接收到 `log` 事件時，不直接平鋪 push，而是採取以下狀態更新策略：
1. 讀取目前的 `groupedSteps` 陣列。
2. 檢查新進 log 的 `stepIdx` 是否已在陣列中：
   - **若已存在**：將此 log 的 action/result 追加到該步驟的 `logs` 陣列中，且若此 log 帶有截圖標記（或為完成狀態），更新該步驟的 `screenshotLogId`。
   - **若不存在**：在 `groupedSteps` 陣列末尾新建一個步驟物件。
3. 觸發 React state 變更進行重新渲染。

### 3. UI 佈局與 Timeline 動效
- **外觀風格**：採用暗色 Bento Panel 卡片，每個步驟為一個卡片，提供滑順的折疊與展開動畫。
- **內部 Timeline**：展開面板後，左側以一條細線串起該步驟的所有動作（如：`鍵入 "gemini"` ➔ `點擊 "送出"`），並附帶詳細的時間與 AI 回應（`aiResponse`）。
- **截圖展示**：若步驟包含 `screenshotLogId`，則在 Timeline 下方或右方渲染一張高質感的預覽圖。因為後端 API（如 `/api/logs/:logId/screenshot`）可直接以 logId 請求截圖 Blob，因此只要步驟包含該 logId 便可直接渲染圖片。
