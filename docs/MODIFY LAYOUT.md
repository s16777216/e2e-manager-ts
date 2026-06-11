## 專案內容頁面 /project/:projectId

1. 採用 nested router 結構，在 /project/:projectId 下再細分 /testCase/:testCaseId 和 /run/:runId

```
/project/:projectId
    /testCase/:testCaseId
    /run/:runId
```

2. 移除"右側資訊面板"

3. 採用 nested router 後, 將按鈕"建立群組"、"建立測試案例"、"編輯劇本"、"執行測試"從 topbar 移至主內容版區域中顯示。

4. 歷史執行紀錄中, 將同一個步驟的所有執行結果顯示在同一個 section 中。
