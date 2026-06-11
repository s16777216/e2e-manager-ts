import { useState, useEffect, useRef } from "react"
import {
  Folder,
  FolderPlus,
  ChevronRight,
  ChevronDown,
  Play,
  Plus,
  Trash2,
  Edit2,
  FileText,
  CheckCircle2,
  XCircle,
  Loader2,
  Settings,
  Image as ImageIcon,
  ChevronLeft,
  Activity} from "lucide-react"
import { api } from "./lib/api"
import type { Project, TestGroup, Testcase, TestRun, TestLog } from "./types/api"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Toaster } from "@/components/ui/sonner"

export default function App() {
  // 專案與群組 State
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProjectId, setSelectedProjectId] = useState<string>("")
  const [groups, setGroups] = useState<TestGroup[]>([])
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({})
  const [selectedGroupId, setSelectedGroupId] = useState<string>("")

  // 專案建立彈窗
  const [showNewProjectModal, setShowNewProjectModal] = useState(false)
  const [newProjectName, setNewProjectName] = useState("")

  // 群組操作 State
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null)
  const [editingGroupName, setEditingGroupName] = useState("")
  const [showNewSubgroupModal, setShowNewSubgroupModal] = useState(false)
  const [newSubgroupName, setNewSubgroupName] = useState("")
  const [newSubgroupParentId, setNewSubgroupParentId] = useState<string | null>(null)

  // 測試案例 (Testcase) State
  const [testcases, setTestcases] = useState<Testcase[]>([])
  const [selectedTestcaseId, setSelectedTestcaseId] = useState<string>("")
  const [showNewTestcaseForm, setShowNewTestcaseForm] = useState(false)
  const [isEditingTestcase, setIsEditingTestcase] = useState(false)

  // 測試案例編輯表單
  const [tcName, setTcName] = useState("")
  const [tcSteps, setTcSteps] = useState<string[]>([""])
  const [tcExpected, setTcExpected] = useState("")

  // 任務執行 (Run) / SSE State
  const [activeRunId, setActiveRunId] = useState<string | null>(null)
  const [runLogs, setRunLogs] = useState<TestLog[]>([])
  const [runStatus, setRunStatus] = useState<TestRun | null>(null)
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null)
  const [imgLoaded, setImgLoaded] = useState(true)

  // 伺服器狀態
  const [isOnline, setIsOnline] = useState(true)

  // SSE EventSource 引用
  const eventSourceRef = useRef<EventSource | null>(null)
  const timelineEndRef = useRef<HTMLDivElement | null>(null)

  // 1. 初始化資料
  useEffect(() => {
    loadProjects()
  }, [])

  useEffect(() => {
    if (selectedProjectId) {
      loadGroups(selectedProjectId)
      setSelectedGroupId("")
      setSelectedTestcaseId("")
      setShowNewTestcaseForm(false)
    }
  }, [selectedProjectId])

  useEffect(() => {
    if (selectedGroupId) {
      loadTestcases(selectedGroupId)
      setSelectedTestcaseId("")
      setShowNewTestcaseForm(false)
    }
  }, [selectedGroupId])

  // 滾動日誌
  useEffect(() => {
    if (timelineEndRef.current) {
      timelineEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [runLogs])

  // 載入列表
  const loadProjects = async () => {
    try {
      const data = await api.getProjects()
      setProjects(data)
      setIsOnline(true)
      if (data.length > 0 && !selectedProjectId) {
        setSelectedProjectId(data[0].id)
      }
    } catch (err: any) {
      setIsOnline(false)
      console.error(err)
    }
  }

  const loadGroups = async (projectId: string) => {
    try {
      const data = await api.getGroups(projectId)
      setGroups(data)
    } catch (err) {
      console.error(err)
    }
  }

  const loadTestcases = async (groupId: string) => {
    try {
      const data = await api.getTestcases(groupId)
      setTestcases(data)
    } catch (err) {
      console.error(err)
    }
  }

  // 建立專案
  const handleCreateProject = async () => {
    if (!newProjectName.trim()) return
    try {
      const newProj = await api.createProject(newProjectName.trim())
      setProjects([...projects, newProj])
      setSelectedProjectId(newProj.id)
      setNewProjectName("")
      setShowNewProjectModal(false)
      toast.success("專案建立成功！")
    } catch (err) {
      toast.error("建立專案失敗：" + err)
    }
  }

  // 建立子群組
  const handleCreateSubgroup = async () => {
    if (!newSubgroupName.trim() || !selectedProjectId) return
    try {
      await api.createGroup(selectedProjectId, newSubgroupName.trim(), newSubgroupParentId)
      loadGroups(selectedProjectId)
      setNewSubgroupName("")
      setShowNewSubgroupModal(false)
      toast.success("群組建立成功！")
    } catch (err) {
      toast.error("建立群組失敗：" + err)
    }
  }

  // 更新群組 (用於重新命名與測試防環)
  const handleRenameGroup = async (groupId: string) => {
    if (!editingGroupName.trim()) return
    try {
      // 這裡如果只是重新命名，可不做 parent 變更；如果想變更 parent 可在這裡傳入 parentId
      // 後端 PATCH /groups/:id 只支援更新 parentId
      // 所以此處我們專注於測試 ParentId 防環更新
      toast.warning("後端群組 PATCH 僅支援 ParentId 環檢驗更新，若要測試防環校驗，請於 API 測試或手動調用更新 parentId")
      setEditingGroupId(null)
    } catch (err) {
      toast.error("更新群組失敗：" + err)
    }
  }

  // 刪除群組
  const handleDeleteGroup = async (groupId: string) => {
    if (!confirm("確定要刪除此群組嗎？這將會刪除其下的測試案例！")) return
    try {
      await api.deleteGroup(groupId)
      if (selectedGroupId === groupId) {
        setSelectedGroupId("")
      }
      loadGroups(selectedProjectId)
      toast.success("群組刪除成功！")
    } catch (err) {
      toast.error("刪除群組失敗：" + err)
    }
  }

  // 處理測試案例 Zod 動態步驟增減
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

  // 建立或修改測試案例
  const handleSaveTestcase = async () => {
    if (!tcName.trim() || tcSteps.some(s => !s.trim()) || !tcExpected.trim()) {
      toast.error("請填寫所有必填欄位，且步驟不可為空！")
      return
    }

    try {
      if (isEditingTestcase && selectedTestcaseId) {
        await api.updateTestcase(selectedTestcaseId, {
          name: tcName.trim(),
          steps: tcSteps.map(s => s.trim()),
          expected: tcExpected.trim()
        })
        toast.success("測試劇本修改成功！")
      } else {
        await api.createTestcase(selectedGroupId, {
          name: tcName.trim(),
          steps: tcSteps.map(s => s.trim()),
          expected: tcExpected.trim()
        })
        toast.success("測試劇本建立成功！")
      }
      loadTestcases(selectedGroupId)
      setShowNewTestcaseForm(false)
      setIsEditingTestcase(false)
    } catch (err: any) {
      toast.error("儲存測試案例失敗：" + err.message)
    }
  }

  // 開啟編輯測試案例
  const startEditTestcase = (tc: Testcase) => {
    setTcName(tc.name)
    setTcSteps(tc.steps)
    setTcExpected(tc.expected)
    setIsEditingTestcase(true)
    setShowNewTestcaseForm(true)
  }

  // 刪除測試案例
  const handleDeleteTestcase = async (tcId: string) => {
    if (!confirm("確定要刪除此測試案例嗎？")) return
    try {
      await api.deleteTestcase(tcId)
      if (selectedTestcaseId === tcId) {
        setSelectedTestcaseId("")
      }
      loadTestcases(selectedGroupId)
      toast.success("測試劇本刪除成功！")
    } catch (err) {
      toast.error("刪除測試案例失敗：" + err)
    }
  }

  // 觸發任務執行 (🚀 SSE 即時監控)
  const handleTriggerRun = async (testcaseId: string) => {
    try {
      // 1. 初始化狀態
      setRunLogs([])
      setSelectedLogId(null)
      setRunStatus(null)

      // 2. 呼叫後端觸發非同步任務
      const res = await api.triggerRun(testcaseId)
      setActiveRunId(res.runId)

      // 3. 設定初始運行狀態
      setRunStatus({
        id: res.runId,
        status: "pending",
        logs: []
      })

      // 4. 開始訂閱 SSE 串流
      subscribeToSSE(res.runId)
      toast.success("測試已啟動，正在載入執行環境...")
    } catch (err: any) {
      toast.error("啟動測試失敗：" + err.message)
    }
  }

  // 訂閱 SSE 事件流
  const subscribeToSSE = (runId: string) => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
    }

    const streamUrl = api.getStreamUrl(runId)
    const eventSource = new EventSource(streamUrl)
    eventSourceRef.current = eventSource

    eventSource.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data)
        if (payload.runId !== runId) return

        if (payload.event === "queued") {
          setRunStatus(prev => prev ? { ...prev, status: "pending" } : null)
        } else if (payload.event === "log") {
          // 收到新步驟的 AI 日誌
          const newLog: TestLog = {
            id: payload.logId,
            stepIdx: payload.stepIdx,
            stepDescription: payload.stepDescription,
            action: payload.action,
            result: payload.result,
            aiResponse: payload.aiResponse,
            screenshotUrl: `/api/logs/${payload.logId}/screenshot`,
            timestamp: payload.timestamp
          }
          setRunLogs(prev => {
            const exists = prev.some(l => l.id === newLog.id)
            if (exists) return prev
            const nextLogs = [...prev, newLog]
            // 預設將最新的一步設定為選取狀態，呈現最新截圖
            setSelectedLogId(newLog.id)
            setImgLoaded(false)
            return nextLogs
          })
          setRunStatus(prev => prev ? { ...prev, status: "running" } : null)
        } else if (payload.event === "completed") {
          // 任務結束
          setRunStatus(prev => prev ? {
            ...prev,
            status: payload.status,
            finalResult: payload.finalResult,
            finalReason: payload.finalReason,
            screenshotFailUrl: payload.status !== "passed" ? `/api/runs/${runId}/screenshots/fail` : undefined
          } : null)

          // 關閉 SSE
          eventSource.close()
          eventSourceRef.current = null
        }
      } catch (err) {
        console.error("[SSE] 解析資料出錯：", err)
      }
    }
  
    eventSource.onerror = () => {
      console.warn("[SSE] 連線中斷或伺服器關閉。")
      eventSource.close()
    }
  }

  // 關閉/返回 Console 視圖
  const handleExitConsole = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }
    setActiveRunId(null)
    setRunLogs([])
    setRunStatus(null)
    setSelectedLogId(null)
  }

  // 遞迴建構樹狀結構
  const buildGroupTree = (groupList: TestGroup[]): TestGroup[] => {
    const map = new Map<string, TestGroup & { children: TestGroup[] }>()
    groupList.forEach(g => {
      map.set(g.id, { ...g, children: [] })
    })

    const roots: TestGroup[] = []
    map.forEach(g => {
      if (g.parentId && map.has(g.parentId)) {
        map.get(g.parentId)!.children.push(g)
      } else {
        roots.push(g)
      }
    })
    return roots
  }

  const groupTree = buildGroupTree(groups)

  // 渲染樹狀群組元件
  const renderGroupNode = (node: TestGroup & { children?: TestGroup[] }, depth = 0) => {
    const isExpanded = expandedGroups[node.id] || false
    const hasChildren = node.children && node.children.length > 0
    const isSelected = selectedGroupId === node.id

    return (
      <div key={node.id} className="select-none">
        <div
          style={{ paddingLeft: `${depth * 12 + 6}px` }}
          className={`group flex items-center justify-between py-1.5 px-2 rounded-md cursor-pointer transition-colors duration-150 ${
            isSelected
              ? "bg-accent text-accent-foreground border-l-2 border-primary"
              : "hover:bg-muted text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setSelectedGroupId(node.id)}
        >
          <div className="flex items-center gap-1.5 min-w-0">
            {hasChildren ? (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setExpandedGroups({
                    ...expandedGroups,
                    [node.id]: !isExpanded
                  })
                }}
                className="p-0.5 hover:bg-accent rounded"
              >
                {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </button>
            ) : (
              <div className="w-5" />
            )}
            <Folder size={16} className={isSelected ? "text-primary" : "text-muted-foreground"} />
            <span className="text-sm font-medium truncate">{node.name}</span>
          </div>

          {/* 群組操作小按鈕 */}
          <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity duration-150">
            <button
              title="新增子群組"
              onClick={(e) => {
                e.stopPropagation()
                setNewSubgroupParentId(node.id)
                setShowNewSubgroupModal(true)
              }}
              className="p-1 hover:bg-accent rounded text-muted-foreground hover:text-foreground"
            >
              <Plus size={12} />
            </button>
            <button
              title="刪除群組"
              onClick={(e) => {
                e.stopPropagation()
                handleDeleteGroup(node.id)
              }}
              className="p-1 hover:bg-accent rounded text-muted-foreground hover:text-destructive"
            >
              <Trash2 size={12} />
            </button>
          </div>
        </div>

        {/* 渲染子節點 */}
        {hasChildren && isExpanded && (
          <div className="mt-0.5">
            {node.children!.map((child) => renderGroupNode(child as any, depth + 1))}
          </div>
        )}
      </div>
    )
  }

  // 取得當前選取的群組物件
  const activeGroup = groups.find(g => g.id === selectedGroupId)
  const activeTestcase = testcases.find(t => t.id === selectedTestcaseId)

  // 當前選取步驟的截圖與日誌詳情
  const activeLog = runLogs.find(l => l.id === selectedLogId)

  return (
    <div className="flex h-screen w-screen bg-background text-foreground overflow-hidden font-sans">
      
      {/* 1. 左側側邊欄 (Sidebar) */}
      <aside className="w-80 border-r bg-card flex flex-col justify-between flex-shrink-0 select-none">
        <div className="flex flex-col flex-1 overflow-hidden p-4 gap-4">
          
          {/* 系統 LOGO */}
          <div className="flex items-center gap-2.5 px-1 pb-2 border-b">
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
                value={selectedProjectId}
                onValueChange={setSelectedProjectId}
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
                onClick={() => {
                  setNewProjectName("")
                  setShowNewProjectModal(true)
                }}
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
                onClick={() => {
                  setNewSubgroupParentId(null)
                  setNewSubgroupName("")
                  setShowNewSubgroupModal(true)
                }}
                className="h-6 w-6 text-muted-foreground hover:text-foreground"
              >
                <Plus size={14} />
              </Button>
            </div>

            <ScrollArea className="flex-1 min-h-0 pr-1">
              {groups.length === 0 ? (
                <div className="text-center py-8 text-xs text-muted-foreground italic">
                  暫無群組，請點擊上方 + 建立
                </div>
              ) : (
                groupTree.map((rootNode) => renderGroupNode(rootNode as any))
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
        
        {activeRunId ? (
          
          /* ================== SSE 即時測試執行 Console 畫面 ================== */
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Console 頂部控制列 */}
            <header className="px-6 py-4 border-b bg-card/50 backdrop-blur-md flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleExitConsole}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <ChevronLeft size={18} />
                </Button>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-bold text-foreground">
                      即時監控 Console (SSE)
                    </h2>
                    <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded">
                      ID: {activeRunId.substring(0, 8)}...
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">正在執行：{activeTestcase?.name}</p>
                </div>
              </div>

              {/* 任務狀態大標誌 */}
              <div className="flex items-center gap-2.5">
                {runStatus?.status === "pending" && (
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-full text-xs font-medium">
                    <Loader2 size={12} className="animate-spin" /> 排隊中 (Pending)
                  </div>
                )}
                {runStatus?.status === "running" && (
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-primary/10 border border-primary/20 text-primary rounded-full text-xs font-medium">
                    <Loader2 size={12} className="animate-spin" /> 執行中 (Running)
                  </div>
                )}
                {runStatus?.status === "passed" && (
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full text-xs font-medium">
                    <CheckCircle2 size={12} /> 成功 (Passed)
                  </div>
                )}
                {(runStatus?.status === "failed" || runStatus?.status === "error") && (
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-destructive/10 border border-destructive/20 text-destructive rounded-full text-xs font-medium">
                    <XCircle size={12} /> 失敗 ({runStatus.status.toUpperCase()})
                  </div>
                )}
              </div>
            </header>

            {/* Console 左右分欄 */}
            <div className="flex-1 flex overflow-hidden min-h-0">
              
              {/* 左側日誌時間軸 (2/5 寬度) */}
              <div className="w-[40%] border-r flex flex-col bg-zinc-950/20 min-w-[320px]">
                <div className="p-4 border-b flex items-center justify-between bg-card/20">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    AI 步驟追蹤時間軸
                  </span>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    步驟數: {runLogs.length}
                  </span>
                </div>

                <ScrollArea className="flex-1 p-4">
                  <div className="flex flex-col gap-4">
                    {runLogs.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-2">
                        <Loader2 className="animate-spin text-primary" size={24} />
                        <span className="text-xs italic">正在等待 Agent 開始執行步驟...</span>
                      </div>
                    ) : (
                      runLogs.map((log, index) => {
                        const isSelected = selectedLogId === log.id
                        return (
                          <div
                            key={log.id}
                            onClick={() => {
                              setSelectedLogId(log.id)
                              setImgLoaded(false)
                            }}
                            className={`flex gap-3 cursor-pointer p-3 rounded-lg border transition-all duration-150 ${
                              isSelected
                                ? "bg-accent border-primary text-foreground"
                                : "bg-card/40 border-border text-muted-foreground hover:border-zinc-700 hover:text-foreground"
                            }`}
                          >
                            {/* 節點狀態點與線 */}
                            <div className="flex flex-col items-center">
                              <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                              }`}>
                                {log.stepIdx + 1}
                              </div>
                              {index < runLogs.length - 1 && (
                                <div className="w-0.5 flex-1 bg-border mt-2" />
                              )}
                            </div>

                            {/* 步驟資訊 */}
                            <div className="flex-1 min-w-0">
                              <h4 className="text-xs font-bold truncate">
                                {log.stepDescription}
                              </h4>
                              <p className="text-[10px] font-mono text-primary mt-1 truncate">
                                {log.action}
                              </p>
                              <p className="text-[10px] text-muted-foreground mt-1 line-clamp-2">
                                {log.result}
                              </p>
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>
                  <div ref={timelineEndRef} />
                </ScrollArea>
              </div>

              {/* 右側監控視圖 (3/5 寬度) */}
              <ScrollArea className="flex-1 bg-zinc-950/10">
                <div className="flex flex-col p-6 gap-6">
                  
                  {/* 瀏覽器畫面監控 */}
                  <div className="flex flex-col gap-2.5">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                        <ImageIcon size={14} className="text-primary" />
                        瀏覽器監控畫面 (Live Screen)
                      </h3>
                      {activeLog && (
                        <span className="text-[10px] text-muted-foreground">
                          步驟 {activeLog.stepIdx + 1} 畫面
                        </span>
                      )}
                    </div>

                    <div className="relative border rounded-xl bg-zinc-950 overflow-hidden shadow-md aspect-video flex items-center justify-center group">
                      {/* 背景網格圖樣 */}
                      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]" />

                      {/* 影像呈現 */}
                      {activeLog ? (
                        <img
                          src={activeLog.screenshotUrl}
                          alt="E2E Screenshot"
                          onLoad={() => setImgLoaded(true)}
                          className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-300 ${
                            imgLoaded ? "opacity-100" : "opacity-0"
                          }`}
                        />
                      ) : runStatus?.status === "failed" && runStatus.screenshotFailUrl ? (
                        <img
                          src={runStatus.screenshotFailUrl}
                          alt="E2E Failure Screenshot"
                          className="absolute inset-0 w-full h-full object-contain"
                        />
                      ) : (
                        <div className="flex flex-col items-center gap-2.5 text-muted-foreground relative z-10">
                          <Loader2 size={32} className="animate-spin text-primary/80" />
                          <span className="text-xs italic">正在擷取 AI 執行畫面...</span>
                        </div>
                      )}

                      {/* 圖片加載時的 Skeleton */}
                      {!imgLoaded && activeLog && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <Loader2 size={24} className="animate-spin text-primary" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 步驟執行詳情 / 視覺斷言報告 */}
                  {activeLog && (
                    <div className="bg-card border rounded-xl p-5 flex flex-col gap-4">
                      <h4 className="text-sm font-bold text-foreground border-b pb-2">
                        步驟詳細日誌說明
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        <div>
                          <span className="text-muted-foreground font-medium">步驟描述：</span>
                          <p className="text-foreground mt-1">{activeLog.stepDescription}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground font-medium">執行動作：</span>
                          <p className="text-primary font-mono mt-1">{activeLog.action}</p>
                        </div>
                        <div className="md:col-span-2">
                          <span className="text-muted-foreground font-medium">工具執行結果：</span>
                          <p className="text-foreground mt-1 bg-zinc-950 p-2.5 rounded font-mono border overflow-x-auto whitespace-pre-wrap">
                            {activeLog.result}
                          </p>
                        </div>
                        {activeLog.aiResponse && (
                          <div className="md:col-span-2">
                            <span className="text-muted-foreground font-medium">AI 決策推理：</span>
                            <p className="text-muted-foreground mt-1 italic">{activeLog.aiResponse}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* 最終視覺斷言結論 */}
                  {runStatus?.finalResult && (
                    <div className={`border rounded-xl p-5 flex flex-col gap-3.5 shadow-md ${
                      runStatus.finalResult === "PASS"
                        ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-400"
                        : "bg-destructive/10 border-destructive/30 text-destructive-foreground"
                    }`}>
                      <div className="flex items-center gap-2">
                        {runStatus.finalResult === "PASS" ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
                        <h4 className="text-sm font-bold">
                          最終審查報告 ({runStatus.finalResult})
                        </h4>
                      </div>
                      <p className="text-xs leading-relaxed whitespace-pre-wrap">
                        {runStatus.finalReason}
                      </p>
                    </div>
                  )}

                </div>
              </ScrollArea>

            </div>
          </div>

        ) : (
          
          /* ================== 主控台：劇本編輯與群組管理畫面 ================== */
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Header */}
            <header className="px-6 py-4 border-b bg-card/50 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-foreground">
                  {activeGroup ? `群組：${activeGroup.name}` : "工作主控台"}
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {activeGroup ? "管理該群組底下的所有 E2E 測試劇本" : "請選擇一個群組以開始管理劇本"}
                </p>
              </div>
            </header>

            {/* 主要內容 */}
            <ScrollArea className="flex-1">
              <div className="p-6">
                
                {!selectedGroupId ? (
                  /* 未選取群組的炫酷引導卡片 */
                  <div className="flex flex-col items-center justify-center py-20 max-w-lg mx-auto text-center gap-4">
                    <div className="h-16 w-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400">
                      <Folder size={32} />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-foreground">請選取群組</h3>
                      <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                        在左側的群組導航樹狀圖中，點選任何一個群組。您可以建立測試專案，或在特定群組下建立多個自然語言測試劇本。
                      </p>
                    </div>
                    <div className="flex gap-3 mt-2">
                      <Button
                        onClick={() => {
                          setNewSubgroupParentId(null)
                          setNewSubgroupName("")
                          setShowNewSubgroupModal(true)
                        }}
                        className="flex items-center gap-1.5"
                      >
                        <Plus size={14} /> 新增根群組
                      </Button>
                    </div>
                  </div>
                ) : (
                  
                  /* 群組下的 Testcases 與劇本配置區 */
                  <div className="flex flex-col gap-6">
                    
                    {/* 頂部操作欄 */}
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        測試劇本清單
                      </h3>
                      <Button
                        onClick={() => {
                          setTcName("")
                          setTcSteps([""])
                          setTcExpected("")
                          setIsEditingTestcase(false)
                          setShowNewTestcaseForm(true)
                        }}
                        className="flex items-center gap-1.5"
                      >
                        <Plus size={14} /> 建立測試案例
                      </Button>
                    </div>

                    {/* 表單：建立/編輯測試案例 */}
                    {showNewTestcaseForm && (
                      <div className="bg-card border rounded-xl p-5 flex flex-col gap-4">
                        <h4 className="text-xs font-bold text-foreground flex items-center gap-2">
                          <FileText size={14} className="text-primary" />
                          {isEditingTestcase ? "編輯測試劇本" : "建立全新測試劇本"}
                        </h4>

                        <div className="flex flex-col gap-3">
                          {/* 劇本名稱 */}
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                              劇本名稱
                            </label>
                            <Input
                              type="text"
                              value={tcName}
                              onChange={(e) => setTcName(e.target.value)}
                              placeholder="例如: Wikipedia Gemini 搜尋測試"
                            />
                          </div>

                          {/* 自然語言步驟 */}
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                              測試步驟 (自然語言描述)
                            </label>
                            <div className="flex flex-col gap-2">
                              {tcSteps.map((step, idx) => (
                                <div key={idx} className="flex gap-2">
                                  <span className="flex items-center justify-center bg-zinc-900 border border-zinc-800 text-[10px] text-muted-foreground rounded px-2 w-7 font-mono">
                                    {idx + 1}
                                  </span>
                                  <Input
                                    type="text"
                                    value={step}
                                    onChange={(e) => handleStepValueChange(idx, e.target.value)}
                                    placeholder="例如: 進入 https://zh.wikipedia.org/ 並搜尋 Gemini"
                                    className="flex-1"
                                  />
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => handleRemoveStepInput(idx)}
                                    className="border-zinc-800 hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                                  >
                                    <Trash2 size={12} />
                                  </Button>
                                </div>
                              ))}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={handleAddStepInput}
                                className="self-start text-[10px]"
                              >
                                <Plus size={10} /> 新增下一步
                              </Button>
                            </div>
                          </div>

                          {/* 預期結果 */}
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                              預期結果
                            </label>
                            <Textarea
                              value={tcExpected}
                              onChange={(e) => setTcExpected(e.target.value)}
                              placeholder="例如: 畫面成功呈現 Gemini 相關維基條目"
                              rows={3}
                              className="resize-none"
                            />
                          </div>
                        </div>

                        {/* 動作按鈕 */}
                        <div className="flex justify-end gap-2.5 border-t pt-3">
                          <Button
                            variant="outline"
                            onClick={() => {
                              setShowNewTestcaseForm(false)
                              setIsEditingTestcase(false)
                            }}
                          >
                            取消
                          </Button>
                          <Button
                            onClick={handleSaveTestcase}
                          >
                            儲存劇本
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* 測試案例列表 */}
                    <div className="grid grid-cols-1 gap-4">
                      {testcases.length === 0 ? (
                        <div className="text-center py-12 text-xs text-muted-foreground italic border border-dashed rounded-xl">
                          此群組下目前暫無測試案例，點擊右上角新增一個吧！
                        </div>
                      ) : (
                        testcases.map((tc) => (
                          <div
                            key={tc.id}
                            className="bg-card/50 border rounded-xl p-5 flex flex-col gap-4 hover:border-zinc-700 transition-colors"
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="text-sm font-bold text-foreground">{tc.name}</h4>
                                <p className="text-[10px] text-muted-foreground font-mono mt-0.5">ID: {tc.id}</p>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => startEditTestcase(tc)}
                                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                  title="編輯劇本"
                                >
                                  <Edit2 size={13} />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => handleDeleteTestcase(tc.id)}
                                  className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                  title="刪除劇本"
                                >
                                  <Trash2 size={13} />
                                </Button>
                                <Button
                                  onClick={() => handleTriggerRun(tc.id)}
                                  className="h-8 flex items-center gap-1 ml-1.5 bg-emerald-600 hover:bg-emerald-500 text-white"
                                >
                                  <Play size={12} fill="white" /> 執行測試
                                </Button>
                              </div>
                            </div>

                            <div className="border-t pt-3">
                              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                                步驟詳情
                              </span>
                              <div className="mt-1.5 flex flex-col gap-1.5">
                                {tc.steps.map((step, idx) => (
                                  <div key={idx} className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <span className="h-4 w-4 bg-zinc-900 border border-zinc-800 rounded-full flex items-center justify-center text-[9px] font-bold">
                                      {idx + 1}
                                    </span>
                                    <span>{step}</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div className="border-t pt-3">
                              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                                預期結果
                              </span>
                              <p className="text-xs text-foreground mt-1">{tc.expected}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                  </div>
                )}

              </div>
            </ScrollArea>
          </div>
        )}

      </main>

      {/* ================== 各式彈窗對話框 ================== */}
      
      {/* 彈窗 1：建立專案 */}
      <Dialog open={showNewProjectModal} onOpenChange={setShowNewProjectModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>建立新專案</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="newProjectName" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">專案名稱</label>
              <Input
                id="newProjectName"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="例如: 公司後台測試"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-3">
            <Button variant="outline" onClick={() => setShowNewProjectModal(false)}>
              取消
            </Button>
            <Button onClick={handleCreateProject}>
              確定建立
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 彈窗 2：建立子群組 */}
      <Dialog open={showNewSubgroupModal} onOpenChange={setShowNewSubgroupModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {newSubgroupParentId ? "新增子群組" : "新增根群組"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="newSubgroupName" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">群組名稱</label>
              <Input
                id="newSubgroupName"
                value={newSubgroupName}
                onChange={(e) => setNewSubgroupName(e.target.value)}
                placeholder="例如: 帳戶中心"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-3">
            <Button variant="outline" onClick={() => setShowNewSubgroupModal(false)}>
              取消
            </Button>
            <Button onClick={handleCreateSubgroup}>
              確定建立
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Toaster />
    </div>
  )
}

