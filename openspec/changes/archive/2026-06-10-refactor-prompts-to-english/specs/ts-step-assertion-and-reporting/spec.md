## MODIFIED Requirements

### Requirement: TS Visual Expected Result Assertion
系統 MUST 在所有步驟執行完畢後，將最後一個步驟的網頁截圖與預期結果（Expected）描述發送給 Gemini LLM，並使用 Zod 強制要求其輸出結構化的 PASS/FAIL 視覺斷言判定與詳細理由。系統發送視覺斷言提示詞時，MUST 使用結構化全英文的 System Prompt (English Core) 進行判定規則引導，以確保結構化輸出判定的精準性。

#### Scenario: Final TS assertion pass
- **WHEN** 網頁最終截圖與狀態符合 Expected 描述
- **THEN** Gemini LLM 透過 Zod 結構化輸出判定該測試案例結果為 PASS
