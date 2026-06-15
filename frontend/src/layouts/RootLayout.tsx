import { useState } from "react";
import { Outlet, useLocation, Link } from "react-router-dom";
import Topbar from "./Topbar";
import SidebarHeader from "./SidebarHeader";
import { Home, Folder, Clock, Settings } from "lucide-react";
import { useProjectData } from "../hooks/useProjectData";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";

export interface BreadcrumbItem {
  label: string;
  to?: string;
}

export default function RootLayout() {
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([]);
  const location = useLocation();
  const { isOnline } = useProjectData();

  // 判斷選單啟動狀態
  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <SidebarProvider>
      {/* <div className="flex h-screen w-screen bg-background text-foreground overflow-hidden font-sans"> */}
      {/* 1. 左側側邊欄 (Sidebar) */}
      <Sidebar className="border-r bg-card select-none" variant="inset">
        {/* 使用自訂的 SidebarHeader */}
        <SidebarHeader />

        {/* 側邊欄主要內容區與選單 */}
        <SidebarContent className="p-4 gap-6">
          <SidebarGroup className="p-0">
            <SidebarGroupContent>
              <SidebarMenu className="gap-1.5">
                {/* 首頁 */}
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={isActive("/")}>
                    <Link
                      to="/"
                      className="flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-lg"
                    >
                      <Home size={16} />
                      <span>首頁</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                {/* 專案列表 */}
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={isActive("/project")}>
                    <Link
                      to="/project"
                      className="flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-lg"
                    >
                      <Folder size={16} />
                      <span>專案列表 (Projects)</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                {/* 執行紀錄 */}
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={isActive("/tasks")}>
                    <Link
                      to="/tasks"
                      className="flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-lg"
                    >
                      <Clock size={16} />
                      <span>執行紀錄 (History)</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        {/* 側邊欄底部狀態 */}
        <SidebarFooter className="p-4 border-t bg-zinc-950/40 flex items-center justify-between flex-row">
          <div className="flex items-center gap-2">
            <span
              className={`h-2 w-2 rounded-full ${isOnline ? "bg-emerald-500 shadow-md shadow-emerald-500/20" : "bg-red-500 animate-ping"}`}
            />
            <span className="text-xs text-muted-foreground">
              {isOnline ? "連線正常" : "伺服器斷線"}
            </span>
          </div>
          <Settings
            size={14}
            className="text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
          />
        </SidebarFooter>
      </Sidebar>

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
      {/* </div> */}
    </SidebarProvider>
  );
}
