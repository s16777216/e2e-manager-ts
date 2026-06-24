## Context

在目前的測試執行詳細步驟卡片 ([StepAccordion.tsx](file:///c:/works/e2e-manager-ts/frontend/src/components/custom/StepAccordion.tsx)) 內部，AI 動作日誌是使用手寫 CSS 的 `absolute` 定位來模擬時間軸與圓點。這不僅導致元件代碼維護不易，在面對複雜的高度變化或多重日誌狀態時也缺乏彈性。

我們已安裝 Bento 風格的 [timeline-component-05.tsx](file:///c:/works/e2e-manager-ts/frontend/src/components/shadcn-studio/blocks/timeline-component-05/timeline-component-05.tsx) 元件，現在計畫將其擴充，使其支援緊湊的日誌面板顯示，並重構現有的模擬時間軸。

## Goals / Non-Goals

**Goals:**
- 對 `timeline-component-05.tsx` 進行通用化的屬性擴充，新增支援 `compact`、`dot` 與 `isLast` 屬性。
- 將 `StepAccordion.tsx` 的模擬 HTML 時間軸完全替換為擴充後的組合式 `Timeline` 與 `TimelineItem` 元件。
- 確保修改後的前端能夠順利編譯建置，且日誌時間軸視覺外觀能呈現更具質感、對齊完美的 Bento 設計風格。

**Non-Goals:**
- 修改後端回傳的日誌結構與數據格式。
- 修改除了日誌時間軸之外的其他步驟卡片佈局與排版。

## Decisions

### 1. 通用擴充 `TimelineItemProps`
* **決策**：在 `TimelineItemProps` 介面中，將 `version` 與 `date` 設為可選（Optional），並新增以下三個可選參數：
  - `compact?: boolean`: 當為 `true` 時，隱藏左側 `w-36` 區塊，使時間軸靠左對齊，適合折疊面板等狹窄容器。
  - `dot?: ReactNode`: 允許自訂渲染時間軸節點的圓點元件。
  - `isLast?: boolean`: 當為 `true` 時，隱藏該節點底部的垂直連接線。
* **Rationale**：這種客製化方式完全不破壞該 Block 元件原本的 API 與視覺表現，但極大地擴充了元件在全專案中的通用性，避免為了緊湊型日誌又另外手寫一個類似的時間軸元件。

### 2. 於 `StepAccordion.tsx` 使用雙層結構圓點
* **決策**：在 `StepAccordion.tsx` 呼叫 `TimelineItem` 時，傳入具備外層光環 (bg/20) 與內層核心點 (border + solid bg) 的雙層結構 ReactNode 作為 `dot`。
* **Rationale**：雙層結構的圓點相較於原本的單一小圓點更有 Bento 設計語意，且能完美整合原本的 Error (`rose-500`)、Pending (`emerald-500` + `animate-pulse`) 與 Success (`zinc-700`) 的色彩狀態回饋。

## Risks / Trade-offs

- **[Risk]**：在極窄的行動端螢幕上，由於移除了左側，右側的日誌內容可能會因為 Padding 而顯得擁擠。
  - *Mitigation*：當 `compact` 為 `true` 時，我們適度將 `TimelineItem` 右側內容的 padding-bottom 從預設的 `pb-11` 調降至 `pb-6`，並保留小螢幕的 `pl-3` 對齊，確保閱讀層次分明。
