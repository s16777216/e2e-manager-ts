import { useState, useEffect } from "react"
import { useParams, useOutletContext } from "react-router-dom"
import { useProjectData } from "../hooks/useProjectData"
import { useGroupData } from "../hooks/useGroupData"
import { GroupTreeNode, type FlatTreeRow } from "../components/custom/GroupTreeNode"
import { NewSubgroupDialog } from "../components/custom/NewSubgroupDialog"
import { api } from "../lib/api"
import { Plus, Sparkles, Trash2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

import type { TestGroup, Testcase } from "../types/api"

interface BreadcrumbItemType {
  label: string
  to?: string
}

interface OutletContextType {
  setBreadcrumbs: (crumbs: BreadcrumbItemType[]) => void
}

export default function ProjectDetailView() {
  const { projectId } = useParams()

  // 專案資訊
  const { projects } = useProjectData()
  const activeProject = projects.find((p) => p.id === projectId)

  const { setBreadcrumbs } = useOutletContext<OutletContextType>()

  useEffect(() => {
    if (activeProject) {
      Promise.resolve().then(() => {
        setBreadcrumbs([
          { label: "專案列表", to: "/project" },
          { label: activeProject.name }
        ])
      })
    } else {
      Promise.resolve().then(() => {
        setBreadcrumbs([
          { label: "專案列表", to: "/project" },
          { label: "載入中..." }
        ])
      })
    }
    return () => {
      Promise.resolve().then(() => {
        setBreadcrumbs([])
      })
    }
  }, [activeProject, setBreadcrumbs])

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

  // 懶加載測試案例快取與載入狀態
  const [testcasesMap, setTestcasesMap] = useState<Record<string, Testcase[]>>({})
  const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({})

  // 1. 新增群組彈窗狀態
  const [showNewGroupModal, setShowNewGroupModal] = useState(false)
  const [newGroupParentId, setNewGroupParentId] = useState<string | null>(null)

  // 2. 新增測試案例彈窗狀態
  const [showNewTestCaseModal, setShowNewTestCaseModal] = useState(false)
  const [tcName, setTcName] = useState("")
  const [tcSteps, setTcSteps] = useState<string[]>([""])
  const [tcExpected, setTcExpected] = useState("")
  const [targetGroupId, setTargetGroupId] = useState("")
  const [isSavingTestCase, setIsSavingTestCase] = useState(false)

  // 專案改變時清空狀態與展開
  useEffect(() => {
    Promise.resolve().then(() => {
      setTestcasesMap({})
      setLoadingMap({})
      setExpandedGroups({})
      setSelectedGroupId("")
    })
  }, [projectId, setExpandedGroups])

  // 當 selectedGroupId 改變時，同步預選 targetGroupId
  const [prevSelectedGroupId, setPrevSelectedGroupId] = useState(selectedGroupId)
  if (selectedGroupId !== prevSelectedGroupId) {
    setPrevSelectedGroupId(selectedGroupId)
    if (selectedGroupId) {
      setTargetGroupId(selectedGroupId)
    }
  }

  // 當 refreshTrigger 改變時重新獲取當前已展開群組的測試案例 (以即時更新最新建立的測試案例)
  useEffect(() => {
    if (!projectId) return

    const reloadActiveTestcases = async () => {
      const activeGroupIds = Object.keys(expandedGroups).filter(id => expandedGroups[id])
      if (activeGroupIds.length === 0) return

      for (const groupId of activeGroupIds) {
        try {
          const data = await api.getTestcases(groupId)
          setTestcasesMap(prev => ({ ...prev, [groupId]: data }))
        } catch (err) {
          console.error(`重新整理群組 ${groupId} 的測試案例失敗:`, err)
        }
      }
    }

    reloadActiveTestcases()
  }, [refreshTrigger, projectId, expandedGroups])

  // 處理群組展開與收合 (附帶 lazy loading)
  const handleToggleExpand = async (groupId: string) => {
    const isCurrentlyExpanded = expandedGroups[groupId] || false
    const nextExpanded = !isCurrentlyExpanded

    setExpandedGroups({
      ...expandedGroups,
      [groupId]: nextExpanded
    })

    if (nextExpanded && !testcasesMap[groupId] && !loadingMap[groupId]) {
      setLoadingMap((prev) => ({ ...prev, [groupId]: true }))
      try {
        const data = await api.getTestcases(groupId)
        setTestcasesMap((prev) => ({ ...prev, [groupId]: data }))
      } catch (err) {
        console.error(`載入群組 ${groupId} 的測試案例失敗:`, err)
      } finally {
        setLoadingMap((prev) => ({ ...prev, [groupId]: false }))
      }
    }
  }

  // 建立 Flat Rows 用於 Tree Table 一維渲染
  const buildFlatRows = (nodes: TestGroup[], depth = 0): FlatTreeRow[] => {
    let list: FlatTreeRow[] = []
    nodes.forEach((node) => {
      const isExpanded = expandedGroups[node.id] || false
      const tcs = testcasesMap[node.id] || []
      const isLoading = loadingMap[node.id] || false

      const subGroupsCount = node.children?.length || 0
      const tcCount = tcs.length
      const groupItemCount = subGroupsCount + tcCount

      const hasChildren = subGroupsCount > 0 || tcCount > 0 || !testcasesMap[node.id]

      list.push({
        id: node.id,
        name: node.name,
        type: "group",
        depth,
        isExpanded,
        hasChildren,
        itemCount: groupItemCount,
        parentId: node.parentId || null
      })

      if (isExpanded) {
        if (isLoading && tcs.length === 0) {
          list.push({
            id: `loading-${node.id}`,
            name: "載入中...",
            type: "loading",
            depth: depth + 1,
            isExpanded: false,
            hasChildren: false,
            itemCount: 0,
            parentId: node.id
          })
        }

        if (node.children && node.children.length > 0) {
          list = list.concat(buildFlatRows(node.children, depth + 1))
        }

        tcs.forEach((tc) => {
          const lastRun = tc.runs && tc.runs.length > 0 ? tc.runs[tc.runs.length - 1] : undefined
          list.push({
            id: tc.id,
            name: tc.name,
            type: "testcase",
            depth: depth + 1,
            isExpanded: false,
            hasChildren: false,
            itemCount: tc.steps?.length || 0,
            lastStatus: lastRun?.status,
            parentId: node.id
          })
        })
      }
    })
    return list
  }

  const flatRows = buildFlatRows(groupTree)

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

  // 測試案例步驟表單增減
  const handleAddStepInput = () => {
    setTcSteps([...tcSteps, ""])
  }

  const handleRemoveStepInput = (index: number) => {
    if (tcSteps.length === 1) return
    const newSteps = [...tcSteps]
    newSteps.splice(index, 1)
    setTcSteps(newSteps)
  }

  const handleStepValueChange = (index: number, val: string) => {
    const newSteps = [...tcSteps]
    newSteps[index] = val
    setTcSteps(newSteps)
  }

  // 儲存新測試案例
  const handleSaveTestCase = async () => {
    if (!targetGroupId) {
      toast.error("請選擇所屬群組！")
      return
    }
    if (!tcName.trim() || tcSteps.some((s) => !s.trim()) || !tcExpected.trim()) {
      toast.error("請填寫所有必填欄位，且步驟不可為空！")
      return
    }

    setIsSavingTestCase(true)
    try {
      await api.createTestcase(targetGroupId, {
        name: tcName.trim(),
        steps: tcSteps.map((s) => s.trim()),
        expected: tcExpected.trim()
      })
      toast.success("測試案例建立成功！")
      
      // 重置 Form 狀態
      setTcName("")
      setTcSteps([""])
      setTcExpected("")
      setShowNewTestCaseModal(false)

      // 重新整理
      setRefreshTrigger((prev) => prev + 1)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      toast.error("建立測試案例失敗：" + msg)
    } finally {
      setIsSavingTestCase(false)
    }
  }

  return (
    <div className="flex-1 flex flex-col bg-zinc-950 text-foreground overflow-y-auto select-none p-8">
      
      {/* 頂部 Header & 麵包屑已移至全域 */}
      <div className="max-w-6xl w-full mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-10">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-zinc-100 via-zinc-300 to-zinc-500 bg-clip-text text-transparent flex items-center gap-2">
            <Sparkles size={20} className="text-primary animate-pulse" />
            {activeProject ? activeProject.name : "載入專案中..."}
          </h2>
          <p className="text-zinc-400 text-sm mt-1.5 leading-relaxed">
            {activeProject?.description || "選擇下方測試案例開始視覺測試，或建立新的測試群組與案例。"}
          </p>
        </div>

        {/* 頂部操作按鈕 */}
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => triggerAddGroup(selectedGroupId || null)}
            className="border-zinc-800 hover:bg-zinc-900 text-zinc-300 hover:text-zinc-100 transition-all font-semibold flex items-center gap-2 px-4 py-5"
          >
            <Plus size={14} /> 建立新群組
          </Button>
          <Button
            onClick={() => {
              if (selectedGroupId) {
                setTargetGroupId(selectedGroupId)
              }
              setShowNewTestCaseModal(true)
            }}
            className="bg-zinc-100 text-zinc-950 hover:bg-zinc-200 transition-all font-semibold flex items-center gap-2 px-5 py-5 shadow-lg shadow-zinc-100/10"
          >
            <Plus size={14} /> 建立測試案例
          </Button>
        </div>
      </div>

      {/* 測試案例樹狀表格目錄 */}
      <div className="max-w-6xl w-full mx-auto flex-1 flex flex-col">

        <div className="border border-zinc-850 bg-zinc-900/30 backdrop-blur-md rounded-2xl overflow-hidden shadow-2xl">
          {loadingGroups ? (
            <div className="text-center py-20 text-sm text-zinc-500 italic">
              載入專案目錄中...
            </div>
          ) : groupTree.length === 0 ? (
            <div className="text-center py-20 text-sm text-zinc-500 italic">
              目前專案暫無群組，請點擊右上方「建立新群組」開始管理。
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-zinc-300">
                <thead>
                  <tr className="border-b border-zinc-850 bg-zinc-950/40 text-xs font-bold text-zinc-400 uppercase tracking-wider">
                    <th className="px-6 py-4 w-[50%]">名稱</th>
                    <th className="px-6 py-4 w-[15%]">類型</th>
                    <th className="px-6 py-4 w-[15%] text-center">子項目/步驟數</th>
                    <th className="px-6 py-4 w-[20%] text-right">最後執行狀態</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-850/50 text-sm">
                  {flatRows.map((row) => (
                    <GroupTreeNode
                      key={row.id}
                      row={row}
                      selectedGroupId={selectedGroupId}
                      setSelectedGroupId={setSelectedGroupId}
                      activeTestCaseId=""
                      onToggleExpand={handleToggleExpand}
                      onAddSubgroup={(parentId) => triggerAddGroup(parentId)}
                      onDeleteGroup={handleDeleteGroup}
                      projectId={projectId || ""}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
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

      {/* 新測試案例彈窗 */}
      <Dialog open={showNewTestCaseModal} onOpenChange={setShowNewTestCaseModal}>
        <DialogContent className="max-w-2xl bg-zinc-900 border-zinc-800 text-zinc-100">
          <DialogHeader>
            <DialogTitle>建立全新測試案例</DialogTitle>
            <DialogDescription className="text-zinc-400 text-xs">
              在選定的群組下建立測試案例，並提供以自然語言描述的視覺測試步驟。
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 my-2">
            
            {/* 測試案例名稱 */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                測試案例名稱 <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                value={tcName}
                onChange={(e) => setTcName(e.target.value)}
                placeholder="例如: Wikipedia 搜尋 Gemini 測試"
                className="bg-zinc-950 border-zinc-800 text-zinc-100"
              />
            </div>

            {/* 所屬群組 Select */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                所屬群組 <span className="text-red-500">*</span>
              </label>
              <Select value={targetGroupId} onValueChange={setTargetGroupId}>
                <SelectTrigger className="w-full bg-zinc-950 border-zinc-800 text-zinc-300">
                  <SelectValue placeholder="選擇群組" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-300">
                  {flatGroups.map((g) => (
                    <SelectItem key={g.id} value={g.id}>
                      {"\u00A0\u00A0".repeat(g.depth)} {g.depth > 0 ? "├─ " : ""}{g.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 測試步驟 */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                測試步驟 (自然語言描述) <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
                {tcSteps.map((step, idx) => (
                  <div key={idx} className="flex gap-2">
                    <span className="flex items-center justify-center bg-zinc-950 border border-zinc-800 text-[10px] text-zinc-400 rounded px-2 w-7 font-mono shrink-0">
                      {idx + 1}
                    </span>
                    <Input
                      type="text"
                      value={step}
                      onChange={(e) => handleStepValueChange(idx, e.target.value)}
                      placeholder="例如: 進入 https://zh.wikipedia.org/"
                      className="flex-1 bg-zinc-950 border-zinc-800 text-zinc-100"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleRemoveStepInput(idx)}
                      className="border-zinc-800 hover:bg-red-500/10 text-zinc-400 hover:text-red-400 flex-shrink-0"
                    >
                      <Trash2 size={12} />
                    </Button>
                  </div>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddStepInput}
                className="self-start text-[10px] border-zinc-850 mt-1"
              >
                <Plus size={10} /> 新增下一步
              </Button>
            </div>

            {/* 預期結果 */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                預期結果 <span className="text-red-500">*</span>
              </label>
              <Textarea
                value={tcExpected}
                onChange={(e) => setTcExpected(e.target.value)}
                placeholder="例如: 成功搜尋到維基百科上的 Gemini 相關資料"
                rows={2}
                className="resize-none bg-zinc-950 border-zinc-800 text-zinc-100"
              />
            </div>

          </div>

          <DialogFooter className="border-t border-zinc-850 pt-3">
            <Button
              variant="outline"
              onClick={() => setShowNewTestCaseModal(false)}
              className="border-zinc-800 text-zinc-300 hover:bg-zinc-950"
            >
              取消
            </Button>
            <Button
              onClick={handleSaveTestCase}
              disabled={isSavingTestCase}
              className="bg-zinc-100 text-zinc-950 hover:bg-zinc-200"
            >
              {isSavingTestCase ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                "儲存測試案例"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
