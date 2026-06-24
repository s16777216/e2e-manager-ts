## 1. 元件擴充與實作 (Component Extension)

- [ ] 1.1 於 `timeline-component-05.tsx` 中修改 `TimelineItemProps`，使 `version` 與 `date` 設為可選，並新增 `compact`、`dot` 與 `isLast` 屬性。
- [ ] 1.2 依據傳入屬性調整 `TimelineItem` 佈局：`compact` 時靠左且收合、自訂 `dot` 渲染、以及 `isLast` 時隱藏線條。

## 2. 步驟展示元件重構 (StepAccordion Refactoring)

- [ ] 2.1 於 `StepAccordion.tsx` 導入 `Timeline` 與 `TimelineItem`。
- [ ] 2.2 替換原先手寫的 CSS 與 `absolute` 定位時間軸，使用 `<Timeline>` 重構日誌輸出，並傳入 Bento 狀態圓點。

## 3. 編譯與手動驗證 (Verification and Build)

- [ ] 3.1 於 `frontend` 目錄下執行前端編譯 `npm run build`，確認無語法與型別錯誤。
- [ ] 3.2 於瀏覽器中執行 E2E 測試，檢視步驟日誌展開後的時間軸視覺、間距與連線樣式是否完全正確。
