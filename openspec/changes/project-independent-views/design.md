## Context

原本在 UI 中採用 `NewProjectDialog` 與 `EditProjectDialog` 來建立和編輯專案。隨著專案級環境變數、Cookie、LocalStorage 的功能增加，在 Dialog 內堆疊多個複雜編輯器會造成不良的使用體驗。為了讓使用者能更舒適地配置環境變數，本設計提出使用獨立頁面與雙欄式排版來實現這兩個功能。

## Goals / Non-Goals

**Goals:**
- 新建 `/project/new`（專案建立頁）與 `/project/:projectId/edit`（專案編輯頁）兩個獨立頁面。
- 抽離出一個可重用的 `ProjectForm.tsx` 元件，將表單輸入、JSON 語意驗證（CookiesData / LocalStorageData）集中管理。
- 在 `ProjectsView` 中，將建立新專案按鈕連結至新路由頁面。
- 在 `ProjectDetailView` 中，將專案資訊編輯鉛筆按鈕連結至編輯路由頁面。
- 刪除舊有的 `NewProjectDialog.tsx` 與 `EditProjectDialog.tsx`。

**Non-Goals:**
- 不涉及後端 API 的變動，全面重用原有的 `POST /api/projects`、`PATCH /api/projects/:id`、與 `DELETE /api/projects/:id` 端點。
- 不修改群組與測試案例的彈窗，保持其原本 Dialog 運作方式。

## Decisions

### 1. 抽離 `ProjectForm.tsx` 共用元件
為確保程式碼的 DRY 特性，將專案的表單內容（名稱、描述、JSON 進階設定 Accordion）抽取出來：
* **Props 設計**：
  ```typescript
  interface ProjectFormProps {
    initialData?: {
      name: string;
      description: string;
      initCookies: CookiesData | null;
      initLocalStorage: LocalStorageData | null;
    };
    submitLabel: string;
    isSubmitting: boolean;
    onSubmit: (name: string, description: string, initCookies: CookiesData | null, initLocalStorage: LocalStorageData | null) => Promise<void>;
    onCancel: () => void;
    onDelete?: () => Promise<void>; // 只有傳入此屬性時才顯示危險刪除區域
  }
  ```

### 2. 單欄式上下堆疊結構
在獨立頁面中，維持簡潔的單欄上下堆疊結構。因移除了 Dialog 容器的高度與滾動限制，元件可以獲得更自然的排版延伸空間：
* **上方**：基本資訊表單（專案名稱、專案描述）。
* **中間**：進階環境設定（`JsonEditorAccordion`）。
* **下方**：按鈕操作列（如果是編輯頁面，最下方將包含紅色警告的「危險刪除區域」）。

### 3. 路由安全排序
在 `routes.tsx` 中將 `/project/new` 明確排序在 `/project/:projectId` 之上，確保 React Router v6 不會將 `new` 當作專案 ID 誤解析。

## Risks / Trade-offs

- **[Risk] 頁面切換造成的載入感知**
  - **Mitigation**：利用 React Router 的狀態保持，在資料載入時呈現微光骨架屏（Skeleton）或載入轉圈動畫，保持滑順的過場體驗。
