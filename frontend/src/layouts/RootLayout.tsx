import { useState } from "react";
import { Outlet } from "react-router-dom";
import Topbar from "./Topbar";
import SidebarHeader from "./SidebarHeader";
import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import SidebarContainer from "./SidebarContainer";
import SidebarItem from "./SidebarItem";
import SidebarFooter from "./SidebarFooter";

export interface BreadcrumbItem {
  label: string;
  to?: string;
}

export default function RootLayout() {
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([]);

  return (
    <SidebarProvider>
      <SidebarContainer header={<SidebarHeader />} footer={<SidebarFooter />}>
        <SidebarItem icon="home" path="/">
          首頁
        </SidebarItem>
        <SidebarItem icon="folder" path="/project">
          專案列表
        </SidebarItem>
        <SidebarItem icon="clock" path="/tasks">
          執行紀錄
        </SidebarItem>
      </SidebarContainer>

      {/* 2. 右側主要工作區 (Workspace) */}
      <SidebarInset className="m-0! p-2">
        <main className="flex-1 flex flex-col min-w-0 bg-background relative">
          {/* Header 區塊：水平排列 SidebarTrigger 與全域麵包屑 */}
          <div className="flex items-center border-b px-6 flex-shrink-0 bg-zinc-950/20 backdrop-blur-md">
            <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
            <div className="flex-1">
              <Topbar breadcrumbs={breadcrumbs} />
            </div>
          </div>

          {/* 內容獨立渲染區 */}
          <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
            <Outlet context={{ setBreadcrumbs }} />
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
