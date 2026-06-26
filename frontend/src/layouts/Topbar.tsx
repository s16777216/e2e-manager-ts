import { Separator } from "@/components/ui/separator";
import { ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import CustomSidebarTrigger from "./CustomSidebarTrigger";

export interface BreadcrumbItem {
  label: string;
  to?: string;
}

interface TopbarProps {
  breadcrumbs: BreadcrumbItem[];
}

export default function Topbar(props: TopbarProps) {
  const { breadcrumbs } = props;
  const navigate = useNavigate();

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
                    className="hover:text-foreground font-medium transition-colors"
                  >
                    {item.label}
                  </button>
                ) : (
                  <span
                    className={
                      isLast ? "text-foreground font-semibold" : "font-medium"
                    }
                  >
                    {item.label}
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
