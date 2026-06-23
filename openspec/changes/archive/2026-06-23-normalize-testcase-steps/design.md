## Context

目前測試案例的步驟以簡單的 `string[]` 格式儲存在 `Testcase` 實體的 `steps` 欄位（儲存為 `simple-json` 文字）。這使得我們無法對單個步驟做更多擴充（例如：步驟預期結果、步驟超時、像素對比參考圖）。
當 AI 執行無畫面變化的步驟時，常因缺乏「步驟預期結果」的指引，無法自我驗證而超限失敗。此外，前端 UI 也因為缺乏靜態步驟的對齊，在測試中斷時無法正確顯示後續未執行的步驟卡片。

## Goals / Non-Goals

**Goals:**
* 將測試案例的步驟定義抽離成獨立的 `TestcaseStep` 表，維護一對多關係，並支援 `expected` 欄位。
* 調整後端執行引擎（LangGraph）與系統 Prompt，實現基於步驟預期結果的「步步斷言」與無回饋步驟的「立即完成」決策。
* 實現伺服器啟動時的資料自動遷移（Data Migration），將現有 testcases 的 `simple-json` steps 轉換為 `TestcaseStep` 記錄，不遺失任何歷史測試資料。
* 在控制台 UI（執行中與歷史紀錄）實現靜態與動態步驟對齊，對未執行或略過的步驟展示灰色卡片。
* 更新測試案例編輯 UI，支援編輯每個步驟的操作描述與步驟預期結果。

**Non-Goals:**
* 實作步驟的拖曳排序功能（本階段僅在資料庫層面支援 `stepIdx` 排序，UI 拖曳排序留待後續優化）。
* 修改最終視覺斷言（Asserter）的整體邏輯（只優化 executorNode 單步執行的 finish_step 決策）。

## Decisions

### 1. 資料庫 Entity 設計與關聯
建立一個新的 `TestcaseStep` 實體，並與 `Testcase` 建立 One-to-Many 關聯。

* **TestcaseStep.ts**:
  ```typescript
  @Entity()
  export class TestcaseStep {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @ManyToOne(() => Testcase, testcase => testcase.steps, { onDelete: "CASCADE" })
    testcase!: Testcase;

    @Column("int")
    stepIdx!: number; // 0-based 順序

    @Column("text")
    action!: string; // 步驟操作描述

    @Column("text", { nullable: true })
    expected?: string; // 步驟預期結果（選填）

    @Column("boolean", { default: false })
    hasExpected!: boolean; // 是否啟用預期結果（預設為 false）

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
  }
  ```
* **Testcase.ts**:
  移除 `steps: string[]` 欄位，改為：
  ```typescript
  @OneToMany(() => TestcaseStep, step => step.testcase, { cascade: true })
  steps!: TestcaseStep[];
  ```

### 2. 自動資料遷移（Data Migration）
為了避免開發與生產環境的測試案例資料在欄位變更時遺失，我們將在後端啟動時執行自動遷移：
1. 連線資料庫後，使用 `QueryRunner` 檢查 `testcase` 表中是否依然存在 `steps` 欄位。
2. 若存在，則查詢所有 testcase 的舊資料。
3. 對於每筆舊 testcase，將其 `steps`（`string[]`）依序拆分為 `TestcaseStep` 實體，並保存至資料表。
4. 遷移完成後，在資料庫中將舊有的 `testcase.steps` 欄位 Drop 掉。

### 3. LangGraph 狀態與 Prompt 整合
* 在 `TestState` 狀態機中，除了 `steps` 之外，新增 `step_expecteds` 狀態（與 steps 陣列長度相同）。
* 在 `executorNode` 執行時，同時讀取 `state.steps[idx]` (作為 action) 與 `state.step_expecteds[idx]` (作為 expected)。
* **Prompt 微調**：調整 `buildExecutorSystemPrompt`，在限制條件中明確指出：
  * *「若當前步驟的 Expected Result 指明無畫面變化或直接結束，請在工具執行成功後立即呼叫 'finish_step'，無須等待或重試。」*
  * *「若 Expected Result 有具體要求，請在確認畫面/DOM 滿足該預期後，才呼叫 'finish_step'。」*

### 4. 前端控制台動靜態對齊
* 前端進入控制台頁面（`SSEConsoleView`）時，同時獲取該測試案例的靜態 `testcase.steps` 定義（包含 id、action、expected）。
* 渲染時，將動態接收到的 `TestRunStep`（以 `stepIdx` 對照）填入靜態步驟中。
* 如果某步驟還沒有動態的 `TestRunStep` 紀錄，則在畫面上渲染為灰色不可展開的 **「未執行 / 略過 (Pending / Skipped)」** 狀態，以補齊控制台的視覺完整度。

### 5. 獨立欄位 hasExpected 與 Switch UX 交互設計
* **暫存優化 (Local Buffer)**：當使用者在前端編輯測試步驟時，每個步驟卡片都有一個 `<Switch>` 元件來啟用或關閉該步驟的「預期結果」。
* **顯示與隱藏**：若 `hasExpected` 為 `true`，顯示預期結果輸入框；若為 `false`，則將輸入框隱藏，但仍保留前端變數中 `expected` 的輸入內容，以防使用者不小心關閉後再次開啟時需要重新輸入。
* **儲存邏輯 (Persistence)**：在呼叫後端 API 儲存或更新測試案例時，若 `hasExpected` 為 `false`，則強制將 `expected` 欄位設為空字串或 `undefined` 送至後端，以確保資料庫中不會殘留已關閉的預期結果文字，而當 `hasExpected` 為 `true` 時則會提交經過 trim 處理的預期結果文字。

## Risks / Trade-offs

* **[Risk]**：舊資料遷移失敗或遺失。
  * **Mitigation**：在執行迁移前，使用 Transaction 處理；若出現異常則立即 Rollback，且伺服器啟動報錯以防止資料損毀。同時保留完整的 Try-Catch 日誌。
* **[Risk]**：AI Agent 對於預期結果的描述解析過於死板或誤判。
  * **Mitigation**：在 System Prompt 中明確給出 Expected Result 的解析指導，說明「若寫明無畫面變更或直接完成，應立即呼叫 finish_step」。若使用者沒有設定 `expected`，則 AI 回退到預設的通用推斷邏輯。
