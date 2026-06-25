import { useProjectData } from "@/hooks/useProjectData";
import { Settings } from "lucide-react";
import { Link } from "react-router-dom";

export default function SidebarFooter() {
  const { isOnline } = useProjectData();
  return (
    <div className="flex items-center justify-between flex-row border-t p-4">
      <div className="flex items-center gap-2">
        <span
          className={`h-2 w-2 rounded-full ${isOnline ? "bg-emerald-500 shadow-md shadow-emerald-500/20" : "bg-red-500 animate-ping"}`}
        />
        <span className="text-xs text-muted-foreground">
          {isOnline ? "連線正常" : "伺服器斷線"}
        </span>
      </div>
      <Link to="/settings" className="flex items-center">
        <Settings
          size={14}
          className="text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
        />
      </Link>
    </div>
  );
}
