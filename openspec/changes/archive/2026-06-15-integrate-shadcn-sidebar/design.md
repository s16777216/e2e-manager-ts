## Context

前端專案正在引入 Shadcn Sidebar。但因為部分樣式丟失與元件關係不當，導致排版混亂與重疊。本設計目的在於提供對 `<main>` 的樣式還原，在側邊欄內容區插入正確的選單，並重構 `SidebarTrigger` 的位置使它與麵包屑 Topbar 可以和諧共存。

## Goals / Non-Goals

**Goals:**
- 將 `<SidebarTrigger>` 與 `Topbar.tsx` 水平整合於同一個 Header，以解決按鈕被側邊欄頂部 Header 壓住、遮擋而無法點選的問題。
- 還原主要工作區 `<main>` 的 Layout Class，使主要內容與側邊欄能藉由 Flex 機制正常伸縮，避免彼此重疊。
- 在 `<SidebarContent>` 底下引入 `<SidebarMenu>` 與 Link 做導航路由按鈕，讓側邊欄擁有完整的選項。

**Non-Goals:**
- 本次設計不包含 sidebar 具體配色風格的變更，僅著重於排版與收合行為。

## Decisions

### 1. `SidebarTrigger` 與 Topbar 的整合方式
* **決策**：在 `RootLayout.tsx` 的 `<main>` 頂部引入一個 Flex 容器，並將 `SidebarTrigger` 與 `Topbar` 水平排在一列。
* **原因**：如果將 `SidebarTrigger` 固定定位於螢幕最左上角，極易被 `Sidebar` 本身的固定 Header 遮住。將其放進主要工作區的頂部 Header 的最左側，既可以完美融入 UI 流程，又可以防範遮擋問題。

### 2. 主要工作區的伸縮機制
* **決策**：還原 `<main className="flex-1 flex flex-col min-w-0 bg-background relative">`。
* **原因**：Shadcn 的 `SidebarProvider` 內部是一個 Row 排列的 Flex 容器。如果右側主區不設置 `flex-1` 與 `min-w-0`，其寬度將不會自適應，且會造成與 fixed 定位的 `<Sidebar>` 高度重疊。

---

## Risks / Trade-offs

- **[Risk]** 在行動裝置下（Vite viewport 縮小時），側邊欄的收合是採用 Sheet (抽屜) 來展示。如果 `SidebarTrigger` 放置在 Header，它會怎麼表現？
  - **Mitigation**：Shadcn 的 `SidebarTrigger` 內建會調用 `toggleSidebar()`。在 Mobile 下它會觸發 Sheet 開啟，並且由於 `main` 頂端仍有 Header，使用者在 Mobile 也能點到觸發按鈕，排版完美適應。
