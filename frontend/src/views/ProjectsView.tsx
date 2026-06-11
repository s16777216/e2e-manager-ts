import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useProjectData } from "../hooks/useProjectData"
import { NewProjectDialog } from "../components/custom/NewProjectDialog"
import { Folder, Plus, ArrowRight, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ProjectsView() {
  const navigate = useNavigate()
  const { projects, handleCreateProject, isLoading } = useProjectData()
  const [showNewProjectModal, setShowNewProjectModal] = useState(false)

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-zinc-950 p-8 select-none">
      
      {/* 頂部 Bento 標題與新增按鈕 */}
      <div className="max-w-6xl w-full mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-10">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-zinc-100 via-zinc-300 to-zinc-500 bg-clip-text text-transparent">
            E2E 劇本專案管理
          </h2>
          <p className="text-zinc-400 text-sm mt-1.5 leading-relaxed">
            選擇一個測試專案進入工作區，或在右側建立一個全新專案來開始進行群組與步驟管理。
          </p>
        </div>
        
        <Button
          onClick={() => setShowNewProjectModal(true)}
          className="bg-zinc-100 text-zinc-950 hover:bg-zinc-200 transition-all font-semibold flex items-center gap-2 px-5 py-5 shadow-lg shadow-zinc-100/10"
        >
          <Plus size={16} /> 建立新專案
        </Button>
      </div>

      {/* Bento Grid 專案列表 */}
      <div className="max-w-6xl w-full mx-auto flex-1">
        {isLoading ? (
          <div className="text-center py-20 text-sm text-zinc-500 italic">
            載入專案列表中...
          </div>
        ) : projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 border border-dashed border-zinc-800 rounded-2xl max-w-md mx-auto gap-4">
            <div className="h-12 w-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400">
              <Folder size={24} />
            </div>
            <div className="text-center">
              <h3 className="text-sm font-bold text-zinc-200">無現存專案</h3>
              <p className="text-xs text-zinc-500 mt-1">目前暫時沒有建立任何專案，點選上方按鈕新增一個吧！</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((proj) => (
              <div
                key={proj.id}
                onClick={() => navigate(`/project/${proj.id}`)}
                className="group relative bg-zinc-900/50 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-6 cursor-pointer hover:border-zinc-700/80 transition-all duration-300 hover:shadow-2xl hover:shadow-zinc-100/5 hover:-translate-y-1 flex flex-col justify-between h-48 overflow-hidden"
              >
                {/* 背景發光小動畫 */}
                <div className="absolute -right-8 -bottom-8 h-24 w-24 bg-zinc-800 rounded-full blur-2xl opacity-0 group-hover:opacity-40 transition-opacity duration-300" />
                
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="h-9 w-9 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-zinc-100 group-hover:border-zinc-700 transition-colors">
                      <Folder size={18} />
                    </div>
                    <h4 className="text-lg font-bold text-zinc-200 group-hover:text-zinc-100 transition-colors truncate">
                      {proj.name}
                    </h4>
                  </div>
                  <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed mt-1">
                    {proj.description || "暫無專案描述，可用於進行 E2E 視覺斷言測試。"}
                  </p>
                </div>

                <div className="flex items-center justify-between border-t border-zinc-800/50 pt-4 mt-2">
                  <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 font-mono">
                    <Calendar size={12} />
                    <span>{new Date(proj.createdAt).toLocaleDateString()}</span>
                  </div>
                  <span className="flex items-center gap-1 text-xs font-bold text-zinc-400 group-hover:text-zinc-100 transition-colors">
                    進入專案 <ArrowRight size={12} className="transform group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 新專案彈窗 */}
      <NewProjectDialog
        open={showNewProjectModal}
        onOpenChange={setShowNewProjectModal}
        onCreateProject={async (name) => {
          const p = await handleCreateProject(name)
          if (p) {
            navigate(`/project/${p.id}`)
          }
        }}
      />
    </div>
  )
}
