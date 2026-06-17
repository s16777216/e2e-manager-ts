import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.svg";

export default function SidebarHeader() {
  const navigate = useNavigate();
  return (
    <div
      className="h-16 flex items-center gap-2.5 px-5 border-b cursor-pointer flex-shrink-0"
      onClick={() => navigate("/")}
    >
      {/* 系統 LOGO - 固定 h-16 且帶有 border-b */}
      <div className="h-9 w-9">
        <img src={logo} />
      </div>
      <div>
        <h1 className="text-base font-bold tracking-tight bg-gradient-to-r from-zinc-100 to-zinc-400 bg-clip-text text-transparent">
          E2E Manager
        </h1>
        <p className="text-[10px] text-muted-foreground font-mono">
          STEP-BY-STEP RUNNER
        </p>
      </div>
    </div>
  );
}
