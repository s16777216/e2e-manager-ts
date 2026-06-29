import { Outlet } from "react-router-dom";
import Topbar from "./Topbar";
import SidebarHeader from "./SidebarHeader";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import SidebarContainer from "./SidebarContainer";
import SidebarItem from "./SidebarItem";
import { ScrollArea } from "@/components/ui/scroll-area";
import SidebarFooter from "./SidebarFooter";
import { sidebarMenuItems } from "@/config/menu";

export default function RootLayout() {
  return (
    <SidebarProvider className="h-svh overflow-hidden">
      <SidebarContainer header={<SidebarHeader />} footer={<SidebarFooter />}>
        {sidebarMenuItems.map((item) => (
          <SidebarItem key={item.path} iconNode={item.iconNode} path={item.path}>
            {item.title}
          </SidebarItem>
        ))}
      </SidebarContainer>

      {/* 右側主要工作區 (Workspace) */}
      <SidebarInset className="m-0! p-2 h-full overflow-hidden">
        <div className="flex-1 flex flex-col min-w-0 bg-background relative">
          {/* Header 區塊：水平排列 SidebarTrigger 與全域麵包屑 */}
          <Topbar />

          {/* 內容獨立渲染區 */}
          <ScrollArea className="flex-1 w-full min-h-0 max-h-[calc(100vh-80px)]">
            <div className="flex-1 min-h-0 flex flex-col min-w-0">
              <Outlet />
            </div>
          </ScrollArea>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
