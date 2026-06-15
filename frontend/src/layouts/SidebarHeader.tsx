import { useNavigate } from "react-router-dom";
import { Activity } from "lucide-react";

export default function SidebarHeader() {
  const navigate = useNavigate();
  return (
    <div
      className="h-16 flex items-center gap-2.5 px-5 border-b cursor-pointer flex-shrink-0"
      onClick={() => navigate("/")}
    >
      {/* 系統 LOGO - 固定 h-16 且帶有 border-b */}
      <div className="h-9 w-9 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center shadow-md">
        <Activity size={20} className="text-zinc-100 animate-pulse" />
      </div>
      <div>
        <h1 className="text-base font-bold tracking-tight bg-gradient-to-r from-zinc-100 to-zinc-400 bg-clip-text text-transparent">
          Antigravity E2E
        </h1>
        <p className="text-[10px] text-muted-foreground font-mono">
          STEP-BY-STEP RUNNER
        </p>
      </div>
    </div>
  );
}
