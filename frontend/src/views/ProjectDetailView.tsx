import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useProjectData } from "../hooks/useProjectData"
import { useGroupData } from "../hooks/useGroupData"
import { GroupTreeNode } from "../components/custom/GroupTreeNode"
import { NewSubgroupDialog } from "../components/custom/NewSubgroupDialog"
import { api } from "../lib/api"
import { Plus, Trash2, ArrowLeft, Loader2, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import type { TestGroup } from "../types/api"

export default function ProjectDetailView() {
  const { projectId } = useParams()
  const navigate = useNavigate()

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

  // 2. 新增測試案例彈窗狀態
  const [showNewTestCaseModal, setShowNewTestCaseModal] = useState(false)
  const [tcName, setTcName] = useState("")
  const [tcSteps, setTcSteps] = useState<string[]>([""])
  const [tcExpected, setTcExpected] = useState("")
  const [targetGroupId, setTargetGroupId] = useState("")
  const [isSavingTestCase, setIsSavingTestCase] = useState(false)

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

  // 當 pre-selected 群組變動時，在 render 階段同步更新 Dialog 預選值，避免 useEffect 中同步 setState 造成 cascading renders
  const [prevSelectedGroupId, setPrevSelectedGroupId] = useState(selectedGroupId)
  if (selectedGroupId !== prevSelectedGroupId) {
    setPrevSelectedGroupId(selectedGroupId)
    if (selectedGroupId) {
      setTargetGroupId(selectedGroupId)
    }
  }

  // 處理新增群組觸發
  const triggerAddGroup = (parentId: string | null) => {
    setNewGroupParentId(parentId)
    setShowNewGroupModal(true)
  }

  // 處理測試案例步驟增減
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
      toast.success("測試劇本建立成功！")
      
      // 重置 Form 狀態
      setTcName("")
      setTcSteps([""])
      setTcExpected("")
      setShowNewTestCaseModal(false)

      // 累加刷新信號，通知對應的 GroupTreeNode 重新載入列表
      setRefreshTrigger((prev) => prev + 1)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      toast.error("建立測試案例失敗：" + msg)
    } finally {
      setIsSavingTestCase(false)
    }
  }

  return (
    <div className="flex-1 flex flex-col bg-zinc-950 text-foreground overflow-hidden select-none">
      
      {/* 頂部導航與標題 */}
      <header className="px-8 py-5 border-b border-zinc-900 bg-zinc-900/20 backdrop-blur-md flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate("/project")}
            className="border-zinc-800 hover:bg-zinc-900 text-zinc-400 hover:text-zinc-100"
          >
            <ArrowLeft size={16} />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold tracking-tight text-zinc-100">
                {activeProject ? activeProject.name : "載入中..."}
              </h2>
              <span className="text-[10px] text-zinc-500 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded-full font-mono">
                PROJECT
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              {activeProject?.description || "專案劇本目錄管理與視覺化導航"}
            </p>
          </div>
        </div>

        {/* 頂部操作 */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => triggerAddGroup(selectedGroupId || null)}
            className="border-zinc-800 hover:bg-zinc-900 hover:text-zinc-100 text-zinc-300 gap-1.5"
          >
            <Plus size={14} /> 建立群組
          </Button>
          <Button
            onClick={() => {
              if (selectedGroupId) {
                setTargetGroupId(selectedGroupId)
              }
              setShowNewTestCaseModal(true)
            }}
            className="bg-zinc-100 text-zinc-950 hover:bg-zinc-200 transition-all font-semibold gap-1.5 shadow-lg shadow-zinc-100/5"
          >
            <Plus size={14} /> 建立測試案例
          </Button>
        </div>
      </header>

      {/* 主工作區 (Bento Panel 風格) */}
      <div className="flex-1 p-8 overflow-hidden flex gap-8">
        
        {/* 左側樹狀結構面板 (佔 1/3) */}
        <div className="w-96 flex flex-col border border-zinc-850 bg-zinc-900/30 backdrop-blur-md rounded-2xl overflow-hidden shadow-xl">
          <div className="p-4 border-b border-zinc-900 bg-zinc-950/20 flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-400 tracking-wider uppercase flex items-center gap-1.5">
              <Sparkles size={12} className="text-primary" />
              劇本樹狀導航 (Groups)
            </span>
            {selectedGroupId && (
              <span className="text-[9px] text-zinc-500 font-mono">
                已選取: {selectedGroupId.substring(0, 6)}...
              </span>
            )}
          </div>

          <ScrollArea className="flex-1 p-4">
            {loadingGroups ? (
              <div className="text-center py-20 text-xs text-zinc-500 italic">
                載入目錄中...
              </div>
            ) : groupTree.length === 0 ? (
              <div className="text-center py-16 text-xs text-zinc-500 italic">
                暫無群組，請點選右上角 + 建立
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

        {/* 右側資訊面板 (佔 2/3) */}
        <div className="flex-1 border border-zinc-850 bg-zinc-900/20 backdrop-blur-md rounded-2xl p-8 flex flex-col items-center justify-center text-center gap-4 shadow-xl">
          <div className="h-16 w-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 shadow-md">
            <Sparkles size={32} className="text-zinc-300" />
          </div>
          <div className="max-w-md">
            <h3 className="text-lg font-bold text-zinc-200">專案主控台</h3>
            <p className="text-sm text-zinc-400 mt-2 leading-relaxed">
              請在左側目錄樹中點選特定**測試案例 (📄)** 以檢視步驟和歷史紀錄。
            </p>
            <div className="mt-6 flex flex-col gap-2.5 text-xs text-zinc-500 text-left border border-zinc-900 bg-zinc-950/20 p-4 rounded-xl">
              <p className="flex items-start gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-zinc-400 mt-1.5" />
                <span>點擊群組名稱旁的 <b>+</b> 可以快速建立子群組。</span>
              </p>
              <p className="flex items-start gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-zinc-400 mt-1.5" />
                <span>在樹狀圖中選定某個群組，再建立測試案例將會自動預填該群組。</span>
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* 1. 新群組彈窗 */}
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

      {/* 2. 新測試案例彈窗 (內嵌) */}
      <Dialog open={showNewTestCaseModal} onOpenChange={setShowNewTestCaseModal}>
        <DialogContent className="max-w-2xl bg-zinc-900 border-zinc-800 text-zinc-100">
          <DialogHeader>
            <DialogTitle>建立全新測試劇本</DialogTitle>
            <DialogDescription className="text-zinc-400 text-xs">
              在選定的群組下建立劇本，並提供以自然語言描述的視覺測試步驟。
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 my-2">
            
            {/* 劇本名稱 */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                劇本名稱 <span className="text-red-500">*</span>
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
                    <span className="flex items-center justify-center bg-zinc-950 border border-zinc-800 text-[10px] text-zinc-400 rounded px-2 w-7 font-mono">
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
                "儲存劇本"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
