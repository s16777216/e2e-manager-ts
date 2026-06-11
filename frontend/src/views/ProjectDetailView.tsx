import { useState, useEffect } from "react"
import { useParams, Outlet, Link } from "react-router-dom"
import { useProjectData } from "../hooks/useProjectData"
import { useGroupData } from "../hooks/useGroupData"
import { GroupTreeNode } from "../components/custom/GroupTreeNode"
import { NewSubgroupDialog } from "../components/custom/NewSubgroupDialog"
import { api } from "../lib/api"
import { Plus, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

import type { TestGroup } from "../types/api"

import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "@/components/ui/breadcrumb"

export default function ProjectDetailView() {
  const { projectId, testCaseId, runId } = useParams()

  // 專案資訊
  const { projects } = useProjectData()
  const activeProject = projects.find((p) => p.id === projectId)

  // 群組樹狀態
  const {
    groupTree,
    expandedGroups,
    setExpandedGroups,
    handleCreateSubgroup,
    handleDeleteGroup,
    isLoading: loadingGroups
  } = useGroupData(projectId)

  // 本地狀態管理
  const [selectedGroupId, setSelectedGroupId] = useState<string>("")
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0)

  // 1. 新增群組彈窗狀態
  const [showNewGroupModal, setShowNewGroupModal] = useState(false)
  const [newGroupParentId, setNewGroupParentId] = useState<string | null>(null)

  // 扁平化群組列表 (供測試案例 Dialog 下拉選單使用)
  const flatGroups = (() => {
    const flatten = (nodes: TestGroup[], depth = 0): { id: string; name: string; depth: number }[] => {
      let list: { id: string; name: string; depth: number }[] = []
      nodes.forEach((node) => {
        list.push({ id: node.id, name: node.name, depth })
        if (node.children && node.children.length > 0) {
          list = list.concat(flatten(node.children, depth + 1))
        }
      })
      return list
    }
    return flatten(groupTree)
  })()

  // 處理新增群組觸發
  const triggerAddGroup = (parentId: string | null) => {
    setNewGroupParentId(parentId)
    setShowNewGroupModal(true)
  }
  // 麵包屑動態名稱快取
  const [tcName, setTcName] = useState<string>("")
  const [runCaseName, setRunCaseName] = useState<string>("")
  const [runCaseId, setRunCaseId] = useState<string>("")

  useEffect(() => {
    if (testCaseId) {
      api.getTestcaseDetail(testCaseId)
        .then((tc) => setTcName(tc.name))
        .catch(() => setTcName(""))
    } else {
      Promise.resolve().then(() => setTcName(""))
    }
  }, [testCaseId])

  useEffect(() => {
    if (runId) {
      api.getRunStatus(runId)
        .then(async (run) => {
          if (run.testcaseId) {
            setRunCaseId(run.testcaseId)
            const tc = await api.getTestcaseDetail(run.testcaseId)
            setRunCaseName(tc.name)
          } else {
            setRunCaseId("")
            setRunCaseName("")
          }
        })
        .catch(() => {
          setRunCaseId("")
          setRunCaseName("")
        })
    } else {
      Promise.resolve().then(() => {
        setRunCaseId("")
        setRunCaseName("")
      })
    }
  }, [runId])

  return (
    <div className="flex-1 flex bg-zinc-950 text-foreground overflow-hidden select-none">
      
      {/* 左側樹狀導航面板 (標準 Flex 側欄，非 fixed) */}
      <div className="w-80 flex flex-col border-r border-zinc-900 bg-zinc-950/40 flex-shrink-0">
        
        {/* Header */}
        <div className="p-4 border-b border-zinc-900 bg-zinc-950/20 flex items-center justify-between">
          <span className="text-xs font-bold text-zinc-400 tracking-wider uppercase flex items-center gap-1.5 whitespace-nowrap">
            <Sparkles size={12} className="text-primary" />
            劇本樹狀導航
          </span>
          <div className="flex items-center gap-2">
            {selectedGroupId && (
              <span className="text-[9px] text-zinc-500 font-mono">
                選定: {selectedGroupId.substring(0, 6)}...
              </span>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => triggerAddGroup(selectedGroupId || null)}
              className="h-7 w-7 border border-zinc-800 hover:bg-zinc-900 text-zinc-400 hover:text-zinc-100 rounded-md"
              title="建立群組"
            >
              <Plus size={14} />
            </Button>
          </div>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1 p-4">
          {loadingGroups ? (
            <div className="text-center py-20 text-xs text-zinc-500 italic">
              載入目錄中...
            </div>
          ) : groupTree.length === 0 ? (
            <div className="text-center py-16 text-xs text-zinc-500 italic">
              暫無群組
            </div>
          ) : (
            <div className="flex flex-col gap-0.5">
              {groupTree.map((rootNode) => (
                <GroupTreeNode
                  key={rootNode.id}
                  node={rootNode}
                  selectedGroupId={selectedGroupId}
                  setSelectedGroupId={setSelectedGroupId}
                  expandedGroups={expandedGroups}
                  setExpandedGroups={setExpandedGroups}
                  onAddSubgroup={(parentId) => triggerAddGroup(parentId)}
                  onDeleteGroup={handleDeleteGroup}
                  projectId={projectId || ""}
                  refreshTrigger={refreshTrigger}
                />
              ))}
            </div>
          )}
        </ScrollArea>

      </div>

      {/* 右側主內容區 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* Header 麵包屑導航 */}
        <header className="px-6 py-4 border-b border-zinc-900 bg-zinc-900/20 backdrop-blur-md flex items-center flex-shrink-0 animate-fadeIn">
          <Breadcrumb>
            <BreadcrumbList className="text-zinc-400">
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/project" className="hover:text-zinc-100">專案列表</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              
              <BreadcrumbSeparator className="text-zinc-600" />
              
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to={`/project/${projectId}`} className="hover:text-zinc-100">
                    {activeProject ? activeProject.name : "載入中..."}
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>

              {testCaseId && tcName && (
                <>
                  <BreadcrumbSeparator className="text-zinc-600" />
                  <BreadcrumbItem>
                    <BreadcrumbPage className="text-zinc-100 font-medium">{tcName}</BreadcrumbPage>
                  </BreadcrumbItem>
                </>
              )}

              {runId && (
                <>
                  <BreadcrumbSeparator className="text-zinc-600" />
                  {runCaseName && runCaseId && (
                    <>
                      <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                          <Link to={`/project/${projectId}/testCase/${runCaseId}`} className="hover:text-zinc-100">
                            {runCaseName}
                          </Link>
                        </BreadcrumbLink>
                      </BreadcrumbItem>
                      <BreadcrumbSeparator className="text-zinc-600" />
                    </>
                  )}
                  <BreadcrumbItem>
                    <BreadcrumbPage className="text-zinc-100 font-medium">
                      執行紀錄 ({runId.substring(0, 8)})
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                </>
              )}
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        {/* 右側子路由 Outlet 容器 */}
        <div className="flex-1 p-8 overflow-hidden flex gap-8">
          <Outlet
            context={{
              selectedGroupId,
              flatGroups,
              onTestCaseCreated: () => setRefreshTrigger((prev) => prev + 1)
            }}
          />
        </div>

      </div>

      {/* 新群組彈窗 */}
      <NewSubgroupDialog
        open={showNewGroupModal}
        onOpenChange={setShowNewGroupModal}
        parentId={newGroupParentId}
        onCreateGroup={async (name, parentId) => {
          const res = await handleCreateSubgroup(name, parentId)
          if (res) {
            setShowNewGroupModal(false)
          }
        }}
      />
    </div>
  )
}
