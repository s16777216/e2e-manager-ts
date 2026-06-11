import { useState } from "react"
import { Outlet, useNavigate, useParams } from "react-router-dom"
import { FolderPlus, Settings, Activity, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useProjectData } from "../hooks/useProjectData"
import { useGroupData } from "../hooks/useGroupData"
import { GroupTreeNode } from "../components/custom/GroupTreeNode"
import { NewProjectDialog } from "../components/custom/NewProjectDialog"
import { NewSubgroupDialog } from "../components/custom/NewSubgroupDialog"

export default function RootLayout() {
  const navigate = useNavigate()
  const { projectId, groupId } = useParams()

  // 專案與連線狀態
  const { projects, isOnline, handleCreateProject } = useProjectData()

  // 群組樹狀態
  const {
    groups,
    groupTree,
    expandedGroups,
    setExpandedGroups,
    handleCreateSubgroup,
    handleDeleteGroup
  } = useGroupData(projectId)

  // 彈窗狀態
  const [showNewProjectModal, setShowNewProjectModal] = useState(false)
  const [showNewSubgroupModal, setShowNewSubgroupModal] = useState(false)
  const [newSubgroupParentId, setNewSubgroupParentId] = useState<string | null>(null)

  // 處理專案切換
  const handleProjectChange = (id: string) => {
    navigate(`/projects/${id}`)
  }

  // 處理群組選取
  const handleGroupSelect = (id: string) => {
    if (projectId) {
      navigate(`/projects/${projectId}/groups/${id}`)
    }
  }

  // 處理新增子群組觸發
  const triggerAddSubgroup = (parentId: string | null) => {
    setNewSubgroupParentId(parentId)
    setShowNewSubgroupModal(true)
  }

  return (
    <div className="flex h-screen w-screen bg-background text-foreground overflow-hidden font-sans">
      
      {/* 1. 左側側邊欄 (Sidebar) */}
      <aside className="w-80 border-r bg-card flex flex-col justify-between flex-shrink-0 select-none">
        <div className="flex flex-col flex-1 overflow-hidden p-4 gap-4">
          
          {/* 系統 LOGO */}
          <div className="flex items-center gap-2.5 px-1 pb-2 border-b cursor-pointer" onClick={() => navigate("/")}>
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

          {/* 專案選擇與新增 */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-muted-foreground tracking-wider uppercase px-1">
              專案 (Project)
            </label>
            <div className="flex gap-2">
              <Select
                value={projectId || ""}
                onValueChange={handleProjectChange}
              >
                <SelectTrigger className="flex-1 text-sm bg-zinc-900 border-zinc-800">
                  <SelectValue placeholder="選擇專案" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowNewProjectModal(true)}
                title="新增專案"
                className="bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-100"
              >
                <FolderPlus size={16} />
              </Button>
            </div>
          </div>

          {/* 群組樹狀導航 (Group Tree) */}
          <div className="flex flex-col flex-1 gap-2 min-h-0">
            <div className="flex items-center justify-between px-1">
              <span className="text-[10px] font-bold text-muted-foreground tracking-wider uppercase">
                群組樹狀導航 (Groups)
              </span>
              <Button
                variant="ghost"
                size="icon"
                disabled={!projectId}
                onClick={() => triggerAddSubgroup(null)}
                className="h-6 w-6 text-muted-foreground hover:text-foreground"
              >
                <Plus size={14} />
              </Button>
            </div>

            <ScrollArea className="flex-1 min-h-0 pr-1">
              {!projectId ? (
                <div className="text-center py-8 text-xs text-muted-foreground italic">
                  請先選擇一個專案以載入群組
                </div>
              ) : groupTree.length === 0 ? (
                <div className="text-center py-8 text-xs text-muted-foreground italic">
                  暫無群組，請點擊上方 + 建立
                </div>
              ) : (
                groupTree.map((rootNode) => (
                  <GroupTreeNode
                    key={rootNode.id}
                    node={rootNode}
                    selectedGroupId={groupId || ""}
                    setSelectedGroupId={handleGroupSelect}
                    expandedGroups={expandedGroups}
                    setExpandedGroups={setExpandedGroups}
                    onAddSubgroup={triggerAddSubgroup}
                    onDeleteGroup={handleDeleteGroup}
                  />
                ))
              )}
            </ScrollArea>
          </div>

        </div>

        {/* 側邊欄底部狀態 */}
        <div className="p-4 border-t bg-zinc-950/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${isOnline ? "bg-emerald-500 shadow-md shadow-emerald-500/20" : "bg-red-500 animate-ping"}`} />
            <span className="text-xs text-muted-foreground">{isOnline ? "連線正常 (Online)" : "伺服器斷線"}</span>
          </div>
          <Settings size={14} className="text-muted-foreground hover:text-foreground cursor-pointer transition-colors" />
        </div>
      </aside>

      {/* 2. 右側主要工作區 (Workspace) */}
      <main className="flex-1 flex flex-col min-w-0 bg-background relative">
        <Outlet context={{ groups }} />
      </main>

      {/* 對話框彈窗 */}
      <NewProjectDialog
        open={showNewProjectModal}
        onOpenChange={setShowNewProjectModal}
        onCreateProject={async (name) => {
          const p = await handleCreateProject(name)
          if (p) {
            navigate(`/projects/${p.id}`)
          }
        }}
      />

      <NewSubgroupDialog
        open={showNewSubgroupModal}
        onOpenChange={setShowNewSubgroupModal}
        parentId={newSubgroupParentId}
        onCreateGroup={handleCreateSubgroup}
      />
    </div>
  )
}
