import { useState } from "react";
import { Outlet } from "react-router-dom";
import Topbar from "./Topbar";
import SidebarHeader from "./SidebarHeader";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import SidebarContainer from "./SidebarContainer";
import SidebarItem from "./SidebarItem";
import { ScrollArea } from "@/components/ui/scroll-area";
import SidebarFooter from "./SidebarFooter";

export interface BreadcrumbItem {
  label: string;
  to?: string;
}

export default function RootLayout() {
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([]);

  return (
    <SidebarProvider className="h-svh overflow-hidden">
      <SidebarContainer header={<SidebarHeader />} footer={<SidebarFooter />}>
        <SidebarItem icon="home" path="/">
          首頁
        </SidebarItem>
        <SidebarItem icon="folder" path="/project">
          專案管理
        </SidebarItem>
        <SidebarItem icon="clock" path="/tasks">
          執行紀錄
        </SidebarItem>
      </SidebarContainer>

      {/* 右側主要工作區 (Workspace) */}
      <SidebarInset className="m-0! p-2 h-full overflow-hidden">
        <div className="flex-1 flex flex-col min-w-0 bg-background relative">
          {/* Header 區塊：水平排列 SidebarTrigger 與全域麵包屑 */}
          <Topbar breadcrumbs={breadcrumbs} />

          {/* 內容獨立渲染區 */}
          <ScrollArea className="flex-1 w-full min-h-0 max-h-[calc(100vh-80px)]">
            <div className="flex-1 min-h-0 flex flex-col min-w-0">
              <Outlet context={{ setBreadcrumbs }} />
            </div>
          </ScrollArea>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
