# step-assertion-and-reporting Specification

## Purpose
TBD - created by archiving change init-step-by-step-e2e. Update Purpose after archive.
## Requirements
### Requirement: Automatic Step Screenshot Saving
系統 MUST 在每個測試步驟 $n$ 被判定執行完成時，自動捕捉當前瀏覽器的畫面，並將其截圖儲存至本次測試的報告輸出目錄中。

#### Scenario: Save screenshot after step
- **WHEN** 步驟 $n$ 被判定完成
- **THEN** 系統於報告目錄儲存 `step_n_result.png` 截圖檔案

### Requirement: Visual expected result assertion
系統 MUST 在所有步驟執行完畢後，將所有步驟的截圖（或最後一個步驟的狀態）與預期結果（Expected）描述發送給 Gemini LLM，由 LLM 進行視覺比對與最終的 Pass/Fail 判定。

#### Scenario: Final assertion pass
- **WHEN** 網頁最終截圖與狀態符合 Expected 描述「跳轉到首頁，並顯示登入成功訊息」
- **THEN** Gemini LLM 判定該測試案例結果為 Pass

#### Scenario: Final assertion fail
- **WHEN** 網頁最終截圖仍停留在登入頁面或顯示登入失敗錯誤訊息
- **THEN** Gemini LLM 判定該測試案例結果為 Fail

### Requirement: Markdown test report generation
測試案例結束後，系統 MUST 產生一份 Markdown 格式的測試報告，內容包含：測試案例 ID、名稱、執行時間、各步驟描述、各步驟對應的截圖連結、最終判定結果（Pass/Fail）以及 LLM 判定結果的理由說明。

#### Scenario: Generate final report
- **WHEN** 測試案例結束且最終判定完成
- **THEN** 系統於報告目錄輸出 `report.md`，該檔案包含所有步驟詳情與對應的截圖檔案路徑

