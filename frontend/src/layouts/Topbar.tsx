import { Separator } from "@/components/ui/separator";
import { ChevronRight } from "lucide-react";
import { useNavigate, useMatches } from "react-router-dom";
import CustomSidebarTrigger from "./CustomSidebarTrigger";
import { isRouteHandle } from "@/types/breadcrumb";
import type { RouteHandle } from "@/types/breadcrumb";
import { DynamicIcon } from "lucide-react/dynamic";
import React from "react";

export default function Topbar() {
  const navigate = useNavigate();
  const matches = useMatches();

  // 從匹配的路由中派生宣告式麵包屑
  const breadcrumbs = matches
    .filter((m) => isRouteHandle(m.handle))
    .flatMap((m) => {
      const handle = m.handle as RouteHandle;
      return handle.crumb(m.loaderData, m.params);
    });

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
      <CustomSidebarTrigger className="-ml-1" />
      <Separator
        orientation="vertical"
        className="mr-2 data-[orientation=vertical]:h-4 self-center!"
      />
      {/* 全域麵包屑 Header - 固定 h-16 且帶有 border-b */}
      {breadcrumbs.length > 0 ? (
        <nav className="flex items-center gap-2 text-sm text-muted-foreground">
          {breadcrumbs.map((item, idx) => {
            const isLast = idx === breadcrumbs.length - 1;
            return (
              <div key={idx} className="flex items-center gap-2">
                {idx > 0 && (
                  <ChevronRight size={14} className="text-zinc-600" />
                )}
                {item.to && !isLast ? (
                  <button
                    onClick={() => navigate(item.to!)}
                    className="hover:text-foreground font-medium transition-colors flex items-center gap-1.5"
                  >
                    {React.isValidElement(item.iconNode) ? (
                      <>{item.iconNode}</>
                    ) : item.icon ? (
                      <DynamicIcon
                        size={14}
                        name={item.icon}
                        className={isLast ? "text-zinc-400" : "text-zinc-500"}
                      />
                    ) : null}
                    <span>{item.label}</span>
                  </button>
                ) : (
                  <span
                    className={`flex items-center gap-1.5 ${
                      isLast ? "text-foreground font-semibold" : "font-medium"
                    }`}
                  >
                    {React.isValidElement(item.iconNode) ? (
                      <>{item.iconNode}</>
                    ) : item.icon ? (
                      <DynamicIcon
                        size={14}
                        name={item.icon}
                        className={isLast ? "text-zinc-400" : "text-zinc-500"}
                      />
                    ) : null}
                    <span>{item.label}</span>
                  </span>
                )}
              </div>
            );
          })}
        </nav>
      ) : (
        <span className="text-sm font-semibold text-foreground">首頁</span>
      )}
    </header>
  );
}
