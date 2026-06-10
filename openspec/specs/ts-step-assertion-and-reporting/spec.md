# ts-step-assertion-and-reporting Specification

## Purpose
TBD - created by archiving change init-typescript-e2e-runner. Update Purpose after archive.
## Requirements
### Requirement: TS Step Screenshot and Value Perception
系統 MUST 在每個測試步驟被判定執行完成時，自動捕捉當前瀏覽器的畫面截圖，並且在產生的簡化 DOM 中整合互動元素的 `value` 屬性，使得 Gemini LLM 能夠感知文字輸入框（包含隱碼密碼框）的當前狀態。

#### Scenario: Save TS screenshot after step
- **WHEN** 步驟 $n$ 被判定完成且 DOM 屬性包含對應 value 值
- **THEN** 系統於報告目錄儲存 `step_n_result.png` 截圖檔案並將 value 渲染於 DOM tag 中

### Requirement: TS Visual Expected Result Assertion
系統 MUST 在所有步驟執行完畢後，將最後一個步驟的網頁截圖與預期結果（Expected）描述發送給 Gemini LLM，並使用 Zod 強制要求其輸出結構化的 PASS/FAIL 視覺斷言判定與詳細理由。系統發送視覺斷言提示詞時，MUST 使用結構化全英文的 System Prompt (English Core) 進行判定規則引導，以確保結構化輸出判定的精準性。

#### Scenario: Final TS assertion pass
- **WHEN** 網頁最終截圖與狀態符合 Expected 描述
- **THEN** Gemini LLM 透過 Zod 結構化輸出判定該測試案例結果為 PASS

### Requirement: TS Markdown Report and Fail Screenshot
測試案例結束後，系統 MUST 產生一份 Markdown 格式的測試報告，內容包含步驟歷程與截圖連結。若測試中途重試超限或出錯中斷，系統 MUST 自動擷取最後的失敗畫面存檔為 `screenshot_fail.png` 並嵌入報告中。

#### Scenario: Generate TS final report with failure screenshot
- **WHEN** 測試中途因重試超次中斷
- **THEN** 系統於報告目錄儲存 `screenshot_fail.png` 並在 `report.md` 中呈現最終失敗畫面與理由

