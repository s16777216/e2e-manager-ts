import { ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

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
    <header className="h-16 flex items-center border-b px-6 flex-shrink-0 bg-zinc-950/20 backdrop-blur-md gap-2 select-none">
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
