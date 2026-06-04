## Context

目前 E2E 測試管理器使用中文作為內置 System Prompts (定義於 `src/graph.ts` 中)。在實際測試中，中文提示詞對於 LLM (如 Gemini 3.1 Flash Lite) 的強制性約束表現不夠完美，容易導致 AI 代理在單一步驟中多執行重複的工具調用，或者未能在目標達成時立即終止步驟。本設計將重構這兩個節點的 System Prompts，採用結構化的英文以提升 AI 行為的精準度與指令遵循率。

## Goals / Non-Goals

**Goals:**
- 將 `executorNode` 節點的 System Prompt 翻譯並重構為全英文，明確劃分角色、任務目標、網頁上下文與強制約束（Constraints）。
- 在英文提示詞中加入明確的防重複工具調用約束（如 `DO NOT call the same tool multiple times in a single turn`、`Immediately invoke finish_step when the objective is met`）。
- 將 `asserterNode` 節點的 System Prompt 翻譯並重構為全英文，以強化視覺斷言的準確性。
- 透過本地維基百科搜尋劇本（`search_test.json`）進行驗證，確保 Prompt 重構後測試能順利執行且結果正確。

**Non-Goals:**
- 不修改任何 Graph 的架構、Node 邏輯或與資料庫/API 伺服器有關的代碼，此變更僅專注於提示詞優化。
- 不變更使用者輸入測試劇本的語言（劇本仍保持為中文，模型需自主做跨語言比對與推理）。

## Decisions

### 1. 提示詞語系決策：全英文核心 (English Core)
- **決策：** 使用全英文重構 `executorNode` 與 `asserterNode` 的 System Prompts。
- **理由：** Gemini 系列模型在英文語料上的指令遵循率（Instruction-following）最高，使用 `You MUST...`、`DO NOT...` 等英文強烈字眼能極大化模型對約束條件的重視程度，減少幻覺。

### 2. 結構化 Prompt 排版：Markdown 與大寫約束字
- **決策：** 採用 Markdown 的 `##` 標題、條列式清單（bullet points）以及全大寫約束字（`MUST`, `MUST NOT`, `CRITICAL`）來編排 System Prompts。
- **理由：** 結構化的排版能幫助多模態模型更好地區分「規則定義」、「當前瀏覽器狀態」與「簡化 DOM 結構」這三個不同區塊，提高閱讀解析度。

---

## Risks / Trade-offs

- **[Risk] 跨語言推理偏差 (Cross-lingual Reasoning Bias)**
  - *說明*：英文 System Prompt 需要對照中文測試劇本與中文網頁，可能會增加模型的推理負擔。
  - *對策*：Gemini (Flash/Pro) 的跨語言對照能力已極其優異。我們在 System Prompt 中會特別聲明：`The test scenarios and webpage content may be in Chinese; map your actions accordingly.` 以引導模型正確對照。
- **[Risk] Token 變動**
  - *說明*：雖然英文提示詞一般比中文佔用較少 Token，但更詳盡的約束條款可能會抵消此優勢。
  - *對策*：保持 Prompt 精簡扼要，避免囉唆的敘述，著重於規則定義。
