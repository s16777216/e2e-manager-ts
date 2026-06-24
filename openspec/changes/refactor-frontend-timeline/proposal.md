## Why

目前測試步驟執行紀錄中的 AI 動作日誌使用手寫 CSS 與絕對定位來模擬時間軸。這不僅導致 UI 維護不易、無法自動調整高度對齊，也與專案當前導入的 Bento/Nova 設計風格不一致。透過改用實體的組合式 `timeline-component-05` 元件，能實現元件高度複用，並大幅提升 UI 視覺質感與一致性。

## What Changes

- **擴充時間軸元件 (timeline-component-05.tsx)**：新增 `compact` 緊湊模式、`dot` 自訂圓點與 `isLast` 隱藏底部連接線等可選參數，使其在折疊面板內部等狹窄容器中也能完美運作，而不破壞原有元件的使用。
- **重構步驟展示卡片 (StepAccordion.tsx)**：使用 `<Timeline>` 與 `<TimelineItem>` 重構原本的手寫時間軸日誌渲染區塊，移除絕對定位的線條與圓點，直接傳入自訂的狀態圓點元件與日誌內容。

## Capabilities

### New Capabilities
- `frontend-timeline`: 前端步驟日誌時間軸元件能力，支援緊湊版面展示、客製化圓點狀態以及垂直連接線隱藏。

### Modified Capabilities
<!-- 無修改系統規格能力 -->

## Impact

- **Frontend Blocks**:
  - `frontend/src/components/shadcn-studio/blocks/timeline-component-05/timeline-component-05.tsx`: 擴充 `TimelineItemProps` 介面與其渲染邏輯，支援 `compact`、`dot` 與 `isLast` 屬性。
- **Frontend Components**:
  - `frontend/src/components/custom/StepAccordion.tsx`: 引入並套用 `Timeline` 元件重構日誌時間軸，實現 Bento 化與元件化。
