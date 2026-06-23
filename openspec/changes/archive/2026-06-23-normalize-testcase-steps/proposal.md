## Why

目前測試案例的步驟儲存在 `Testcase.steps` 的 JSON 陣列中，這限制了對步驟級別做更精細的控制。這帶來兩個主要問題：
1. **AI Agent 執行無回饋步驟易失敗**：由於無法為單一步驟定義「步驟預期結果」，當執行無明顯視覺變化或 DOM 變更的步驟（例如：點擊背景儲存按鈕）時，AI 會因為無法「自我驗證」點擊是否成功，在「想要重試」與「防死循環重複點擊」之間卡住，最終因步驟重試超限（5次）而失敗。
2. **控制台 UI/UX 不足（未執行步驟消失）**：因為動態執行紀錄（`TestRunStep`）只在步驟開始執行後才建立，一旦測試在前半段（例如步驟 2）失敗，後半段未執行的步驟就不會在資料庫留下紀錄，導致前端 UI 無法預知後續步驟，直接將它們從畫面隱藏，使用者體驗不佳。

## What Changes

1. **資料結構正規化**：
   - 新增靜態測試步驟實體表 `TestcaseStep`，儲存各步的操作描述 (`action`)、預期結果 (`expected`，選填)、是否啟用預期結果 (`hasExpected`) 與順序索引 (`stepIdx`)。
   - 將 `Testcase.steps` 從 `simple-json` 欄位重構為與 `TestcaseStep` 關聯的一對多關係。
   - 提供伺服器啟動時的自動資料遷移 (Migration) 機制，確保舊 `simple-json` 資料無痛轉換到新表。
2. **AI Agent 執行機制升級 (步步斷言)**：
   - 調整後端 LangGraph 與系統 Prompt，將「步驟預期結果」傳給 AI。
   - 當預期結果明確指明「無畫面變化」時，AI 工具執行完畢後立即呼叫 `finish_step`；否則必須在滿足「步驟預期結果」後才進入下一步，避免盲目重試。
3. **控制台動靜態步驟對齊**：
   - 前端控制台整合 `TestcaseStep` (定義) 與 `TestRunStep` (執行紀錄)，對未執行、略過或未完成的步驟，於 UI 渲染為灰色 Pending/Skipped 狀態，不再直接消失。
4. **測試案例編輯器更新**：
   - 更新測試案例的建立與編輯介面，在每個步驟配置「步驟操作描述」與以 `Switch` 控制顯示/隱藏的「步驟預期結果」輸入框，支援輸入暫存。

## Capabilities

### New Capabilities
- `step-assertion-and-alignment`: 支援測試步驟預期結果（選填）之配置，以及執行控制台中動靜態步驟對齊與 Pending 狀態渲染。

### Modified Capabilities
*無*

## Impact

* **Entity/Database**:
  * [NEW] `backend/src/entities/TestcaseStep.ts`
  * [MODIFY] `backend/src/entities/Testcase.ts`
  * [MODIFY] `backend/src/db.ts`
* **Agent Logic**:
  * [MODIFY] `backend/src/graph.ts`
  * [MODIFY] `backend/src/graph/prompt.ts`
* **API Routes**:
  * [MODIFY] `backend/src/routes/testcases.ts` (或相關建立/取得路由)
  * [MODIFY] `backend/src/routes/run.ts`
* **Frontend**:
  * [MODIFY] `frontend/src/views/SSEConsoleView.tsx` 與相關元件
  * [MODIFY] 測試案例建立/編輯頁面之 UI
