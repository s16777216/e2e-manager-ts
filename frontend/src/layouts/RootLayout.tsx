import { useState } from "react"
import { Outlet, useNavigate, useLocation } from "react-router-dom"
import { Settings, Activity, Folder, Home, ChevronRight } from "lucide-react"
import { useProjectData } from "../hooks/useProjectData"

export interface BreadcrumbItem {
  label: string
  to?: string
}

export default function RootLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { isOnline } = useProjectData()
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([])

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/"
    }
    return location.pathname.startsWith(path)
  }

  return (
    <div className="flex h-screen w-screen bg-background text-foreground overflow-hidden font-sans">
      
      {/* 1. 左側側邊欄 (Sidebar) */}
      <aside className="w-64 border-r bg-card flex flex-col justify-between flex-shrink-0 select-none">
        
        {/* 系統 LOGO - 固定 h-16 且帶有 border-b */}
        <div 
          className="h-16 flex items-center gap-2.5 px-5 border-b cursor-pointer flex-shrink-0" 
          onClick={() => navigate("/")}
        >
          <div className="h-9 w-9 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center shadow-md">
            <Activity size={20} className="text-zinc-100 animate-pulse" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight bg-gradient-to-r from-zinc-100 to-zinc-400 bg-clip-text text-transparent">
              Antigravity E2E
            </h1>
            <p className="text-[10px] text-muted-foreground font-mono">STEP-BY-STEP RUNNER</p>
          </div>
        </div>

        {/* 導航內容與選單 */}
        <div className="flex flex-col flex-1 overflow-hidden p-4 gap-6">
          {/* 導航選單 */}
          <nav className="flex flex-col gap-1.5">
            <button
              onClick={() => navigate("/")}
              className={`flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                isActive("/")
                  ? "bg-accent text-accent-foreground border-l-2 border-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Home size={16} />
              <span>首頁</span>
            </button>
            <button
              onClick={() => navigate("/project")}
              className={`flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                isActive("/project")
                  ? "bg-accent text-accent-foreground border-l-2 border-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Folder size={16} />
              <span>專案列表 (Projects)</span>
            </button>
          </nav>
        </div>

        {/* 側邊欄底部狀態 */}
        <div className="p-4 border-t bg-zinc-950/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${isOnline ? "bg-emerald-500 shadow-md shadow-emerald-500/20" : "bg-red-500 animate-ping"}`} />
            <span className="text-xs text-muted-foreground">{isOnline ? "連線正常" : "伺服器斷線"}</span>
          </div>
          <Settings size={14} className="text-muted-foreground hover:text-foreground cursor-pointer transition-colors" />
        </div>
      </aside>

      {/* 2. 右側主要工作區 (Workspace) */}
      <main className="flex-1 flex flex-col min-w-0 bg-background relative">
        {/* 全域麵包屑 Header - 固定 h-16 且帶有 border-b */}
        <header className="h-16 flex items-center border-b px-6 flex-shrink-0 bg-zinc-950/20 backdrop-blur-md gap-2 select-none">
          {breadcrumbs.length > 0 ? (
            <nav className="flex items-center gap-2 text-sm text-muted-foreground">
              {breadcrumbs.map((item, idx) => {
                const isLast = idx === breadcrumbs.length - 1
                return (
                  <div key={idx} className="flex items-center gap-2">
                    {idx > 0 && <ChevronRight size={14} className="text-zinc-600" />}
                    {item.to && !isLast ? (
                      <button
                        onClick={() => navigate(item.to!)}
                        className="hover:text-foreground font-medium transition-colors"
                      >
                        {item.label}
                      </button>
                    ) : (
                      <span className={isLast ? "text-foreground font-semibold" : "font-medium"}>
                        {item.label}
                      </span>
                    )}
                  </div>
                )
              })}
            </nav>
          ) : (
            <span className="text-sm font-semibold text-foreground">首頁</span>
          )}
        </header>

        {/* 內容渲染區域 */}
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
          <Outlet context={{ setBreadcrumbs }} />
        </div>
      </main>
    </div>
  )
}

