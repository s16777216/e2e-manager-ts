import { useState } from "react";
import { Outlet } from "react-router-dom";
import SidebarItem from "./SidebarItem";
import Topbar from "./Topbar";
import SidebarHeader from "./SidebarHeader";
import SidebarContainer from "./SidebarContainer";

export interface BreadcrumbItem {
  label: string;
  to?: string;
}

export default function RootLayout() {
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([]);

  return (
    <div className="flex h-screen w-screen bg-background text-foreground overflow-hidden font-sans">
      {/* 1. 左側側邊欄 (Sidebar) */}
      <SidebarContainer header={<SidebarHeader />}>
        <SidebarItem icon="home" label="首頁" path="/" />
        <SidebarItem icon="folder" label="專案列表" path="/project" />
        <SidebarItem icon="clock" label="執行紀錄" path="/tasks" />
      </SidebarContainer>

      {/* 2. 右側主要工作區 (Workspace) */}
      <main className="flex-1 flex flex-col min-w-0 bg-background relative">
        <Topbar breadcrumbs={breadcrumbs} />

        {/* 內容渲染區域 */}
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
          <Outlet context={{ setBreadcrumbs }} />
        </div>
      </main>
    </div>
  );
}
