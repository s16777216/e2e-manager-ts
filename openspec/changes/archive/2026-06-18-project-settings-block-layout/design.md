## Context

專案已改為獨立的路由頁面（`/project/new` 與 `/project/:projectId/edit`），不再受到 Dialog 容器的高度限制。
為此，我們在佈局上應以 GitHub 設定頁面的平鋪風格為主。不再將 Cookies 與 LocalStorage 欄位折疊收納於 Accordion 面板中，而是直接展開平鋪於大表單中。
專案的建立與編輯保持高一致性，皆為單一表單統一提交，唯一差別在於編輯模式下，表單底部會多出一個危險區域與刪除專案的 Dialog 確認。

## Goals / Non-Goals

**Goals:**
- 在 `ProjectForm` 中移除 `JsonEditorAccordion`。
- 直接在表單中將 Cookies JSON 編輯框與 LocalStorage JSON 編輯框展開平鋪。
- 統一採用單一表單與統一的儲存按鈕進行提交（編輯頁面為「儲存修改」，建立頁面為「建立專案」）。
- 編輯模式下表單底部展示「危險區域」，點選刪除時於元件內部彈出 `BaseDialog` 二次確認彈窗。

**Non-Goals:**
- 不進行卡片式的局部更新，亦不提供各欄位就近儲存的按鈕。

## Decisions

### 1. 廢除 Accordion 折疊，平鋪展開進階設定

專案新增與編輯皆採用寬敞的平鋪佈局，將 Cookies 與 LocalStorage 編輯區塊直接在大表單中展開呈現，提升設定的直觀度。
進階設定的即時 JSON 驗證與格式狀態標記依然保留，若格式錯誤則禁用表單統一儲存按鈕。

### 2. 統一提交與內置刪除 Dialog

`ProjectForm.tsx` 作為建立與編輯的共同載體，當提供 `onDelete` 與 `initialData` 時，表單底部渲染「危險區域」，點選「刪除專案」時，會開啟 `BaseDialog` 二次確認彈窗。

## Risks / Trade-offs

*(無)*
