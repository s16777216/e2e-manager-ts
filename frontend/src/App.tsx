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
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  Settings,
  Image as ImageIcon,
  Check,
  X,
  ChevronLeft,
  Activity,
  ArrowRight
} from "lucide-react"
import { api } from "./lib/api"
import type { Project, TestGroup, Testcase, TestRun, TestLog } from "./types/api"

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
    } catch (err) {
      alert("建立專案失敗：" + err)
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
    } catch (err) {
      alert("建立群組失敗：" + err)
    }
  }

  // 更新群組 (用於重新命名與測試防環)
  const handleRenameGroup = async (groupId: string) => {
    if (!editingGroupName.trim()) return
    try {
      // 這裡如果只是重新命名，可不做 parent 變更；如果想變更 parent 可在這裡傳入 parentId
      // 後端 PATCH /groups/:id 只支援更新 parentId
      // 所以此處我們專注於測試 ParentId 防環更新
      alert("後端群組 PATCH 僅支援 ParentId 環檢驗更新，若要測試防環校驗，請於 API 測試或手動調用更新 parentId")
      setEditingGroupId(null)
    } catch (err) {
      alert("更新群組失敗：" + err)
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
    } catch (err) {
      alert("刪除群組失敗：" + err)
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
      alert("請填寫所有必填欄位，且步驟不可為空！")
      return
    }

    try {
      if (isEditingTestcase && selectedTestcaseId) {
        await api.updateTestcase(selectedTestcaseId, {
          name: tcName.trim(),
          steps: tcSteps.map(s => s.trim()),
          expected: tcExpected.trim()
        })
      } else {
        await api.createTestcase(selectedGroupId, {
          name: tcName.trim(),
          steps: tcSteps.map(s => s.trim()),
          expected: tcExpected.trim()
        })
      }
      loadTestcases(selectedGroupId)
      setShowNewTestcaseForm(false)
      setIsEditingTestcase(false)
    } catch (err: any) {
      alert("儲存測試案例失敗：" + err.message)
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
    } catch (err) {
      alert("刪除測試案例失敗：" + err)
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
    } catch (err: any) {
      alert("啟動測試失敗：" + err.message)
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
              ? "bg-primary/25 text-primary border-l-2 border-primary"
              : "hover:bg-white/5 text-gray-400 hover:text-gray-200"
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
                className="p-0.5 hover:bg-white/10 rounded"
              >
                {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </button>
            ) : (
              <div className="w-5" />
            )}
            <Folder size={16} className={isSelected ? "text-primary" : "text-gray-500"} />
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
              className="p-1 hover:bg-white/10 rounded text-gray-400 hover:text-white"
            >
              <Plus size={12} />
            </button>
            <button
              title="刪除群組"
              onClick={(e) => {
                e.stopPropagation()
                handleDeleteGroup(node.id)
              }}
              className="p-1 hover:bg-white/10 rounded text-gray-400 hover:text-red-400"
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
    <div className="flex h-screen w-screen bg-[#0B0F19] text-gray-100 overflow-hidden font-sans">
      
      {/* 1. 左側側邊欄 (Sidebar) */}
      <aside className="w-80 border-r border-white/5 bg-[#0D1220] flex flex-col justify-between flex-shrink-0 select-none">
        <div className="flex flex-col flex-1 overflow-y-auto p-4 gap-4">
          
          {/* 系統 LOGO */}
          <div className="flex items-center gap-2.5 px-1 pb-2 border-b border-white/5">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <Activity size={20} className="text-white animate-pulse" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight bg-gradient-to-r from-purple-200 to-indigo-100 bg-clip-text text-transparent">
                Antigravity E2E
              </h1>
              <p className="text-[10px] text-gray-500 font-mono">STEP-BY-STEP RUNNER</p>
            </div>
          </div>

          {/* 專案選擇與新增 */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-gray-500 tracking-wider uppercase px-1">
              專案 (Project)
            </label>
            <div className="flex gap-2">
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="flex-1 text-sm bg-white/5 border border-white/5 rounded-md py-1.5 px-2.5 outline-none focus:border-primary/50 text-gray-200"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id} className="bg-[#0D1220]">
                    {p.name}
                  </option>
                ))}
              </select>
              <button
                onClick={() => setShowNewProjectModal(true)}
                title="新增專案"
                className="p-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-md transition-colors"
              >
                <FolderPlus size={16} />
              </button>
            </div>
          </div>

          {/* 群組樹狀導航 (Group Tree) */}
          <div className="flex flex-col flex-1 gap-2 min-h-0">
            <div className="flex items-center justify-between px-1">
              <span className="text-[10px] font-bold text-gray-500 tracking-wider uppercase">
                群組樹狀導航 (Groups)
              </span>
              <button
                onClick={() => {
                  setNewSubgroupParentId(null)
                  setShowNewSubgroupModal(true)
                }}
                className="p-1 hover:bg-white/5 rounded text-gray-500 hover:text-gray-300"
              >
                <Plus size={14} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-0.5 min-h-0">
              {groups.length === 0 ? (
                <div className="text-center py-8 text-xs text-gray-600 italic">
                  暫無群組，請點擊上方 + 建立
                </div>
              ) : (
                groupTree.map((rootNode) => renderGroupNode(rootNode as any))
              )}
            </div>
          </div>

        </div>

        {/* 側邊欄底部狀態 */}
        <div className="p-4 border-t border-white/5 bg-[#0A0D18] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${isOnline ? "bg-emerald-500 shadow-lg shadow-emerald-500/50" : "bg-red-500 animate-ping"}`} />
            <span className="text-xs text-gray-500">{isOnline ? "連線正常 (Online)" : "伺服器斷線"}</span>
          </div>
          <Settings size={14} className="text-gray-600 hover:text-gray-400 cursor-pointer transition-colors" />
        </div>
      </aside>

      {/* 2. 右側主要工作區 (Workspace) */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#0B0F19] relative">
        
        {activeRunId ? (
          
          /* ================== SSE 即時測試執行 Console 畫面 ================== */
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Console 頂部控制列 */}
            <header className="px-6 py-4 border-b border-white/5 bg-[#0D1220]/50 backdrop-blur-md flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleExitConsole}
                  className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors"
                >
                  <ChevronLeft size={18} />
                </button>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-bold text-gray-200">
                      即時監控 Console (SSE)
                    </h2>
                    <span className="text-xs font-mono text-gray-500 bg-white/5 px-2 py-0.5 rounded">
                      ID: {activeRunId.substring(0, 8)}...
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">正在執行：{activeTestcase?.name}</p>
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
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-full text-xs font-medium">
                    <Loader2 size={12} className="animate-spin" /> 執行中 (Running)
                  </div>
                )}
                {runStatus?.status === "passed" && (
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full text-xs font-medium">
                    <CheckCircle2 size={12} /> 成功 (Passed)
                  </div>
                )}
                {(runStatus?.status === "failed" || runStatus?.status === "error") && (
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-400 rounded-full text-xs font-medium">
                    <XCircle size={12} /> 失敗 ({runStatus.status.toUpperCase()})
                  </div>
                )}
              </div>
            </header>

            {/* Console 左右分欄 */}
            <div className="flex-1 flex overflow-hidden min-h-0">
              
              {/* 左側日誌時間軸 (2/5 寬度) */}
              <div className="w-[40%] border-r border-white/5 flex flex-col bg-[#080B13] min-w-[320px]">
                <div className="p-4 border-b border-white/5 flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    AI 步驟追蹤時間軸
                  </span>
                  <span className="text-[10px] text-gray-500 font-mono">
                    步驟數: {runLogs.length}
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
                  {runLogs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-600 gap-2">
                      <Loader2 className="animate-spin text-purple-500" size={24} />
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
                              ? "bg-purple-950/20 border-purple-500/30 text-gray-200"
                              : "bg-[#0B0F19]/60 border-white/5 text-gray-400 hover:border-white/10 hover:text-gray-300"
                          }`}
                        >
                          {/* 節點狀態點與線 */}
                          <div className="flex flex-col items-center">
                            <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${
                              isSelected ? "bg-purple-600 text-white" : "bg-white/5 text-gray-500"
                            }`}>
                              {log.stepIdx + 1}
                            </div>
                            {index < runLogs.length - 1 && (
                              <div className="w-0.5 flex-1 bg-white/5 mt-2" />
                            )}
                          </div>

                          {/* 步驟資訊 */}
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-bold truncate">
                              {log.stepDescription}
                            </h4>
                            <p className="text-[10px] font-mono text-purple-400 mt-1 truncate">
                              {log.action}
                            </p>
                            <p className="text-[10px] text-gray-500 mt-1 line-clamp-2">
                              {log.result}
                            </p>
                          </div>
                        </div>
                      )
                    })
                  )}
                  <div ref={timelineEndRef} />
                </div>
              </div>

              {/* 右側監控視圖 (3/5 寬度) */}
              <div className="flex-1 flex flex-col bg-[#0B0F19] overflow-y-auto p-6 gap-6">
                
                {/* 瀏覽器畫面監控 (高質感 Glassmorphism 卡片) */}
                <div className="flex flex-col gap-2.5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                      <ImageIcon size={14} className="text-purple-400" />
                      瀏覽器監控畫面 (Live Screen)
                    </h3>
                    {activeLog && (
                      <span className="text-[10px] text-gray-500">
                        步驟 {activeLog.stepIdx + 1} 畫面
                      </span>
                    )}
                  </div>

                  <div className="relative border border-white/5 rounded-xl bg-[#090C15] overflow-hidden shadow-2xl aspect-video flex items-center justify-center group">
                    {/* 背景網格圖樣 */}
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]" />

                    {/* 影像呈現 (支援無縫 Cross-fade 漸變) */}
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
                      <div className="flex flex-col items-center gap-2.5 text-gray-600 relative z-10">
                        <Loader2 size={32} className="animate-spin text-purple-500/80" />
                        <span className="text-xs italic">正在擷取 AI 執行畫面...</span>
                      </div>
                    )}

                    {/* 圖片加載時的 Skeleton */}
                    {!imgLoaded && activeLog && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <Loader2 size={24} className="animate-spin text-purple-400" />
                      </div>
                    )}
                  </div>
                </div>

                {/* 步驟執行詳情 / 視覺斷言報告 */}
                {activeLog && (
                  <div className="bg-[#0D1220]/60 border border-white/5 rounded-xl p-5 flex flex-col gap-4">
                    <h4 className="text-sm font-bold text-gray-200 border-b border-white/5 pb-2">
                      步驟詳細日誌說明
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-gray-500 font-medium">步驟描述：</span>
                        <p className="text-gray-300 mt-1">{activeLog.stepDescription}</p>
                      </div>
                      <div>
                        <span className="text-gray-500 font-medium">執行動作：</span>
                        <p className="text-purple-400 font-mono mt-1">{activeLog.action}</p>
                      </div>
                      <div className="md:col-span-2">
                        <span className="text-gray-500 font-medium">工具執行結果：</span>
                        <p className="text-gray-300 mt-1 bg-black/30 p-2.5 rounded font-mono border border-white/5 overflow-x-auto whitespace-pre-wrap">
                          {activeLog.result}
                        </p>
                      </div>
                      {activeLog.aiResponse && (
                        <div className="md:col-span-2">
                          <span className="text-gray-500 font-medium">AI 決策推理：</span>
                          <p className="text-gray-300 mt-1 italic">{activeLog.aiResponse}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 最終視覺斷言結論 */}
                {runStatus?.finalResult && (
                  <div className={`border rounded-xl p-5 flex flex-col gap-3.5 shadow-lg ${
                    runStatus.finalResult === "PASS"
                      ? "bg-emerald-950/10 border-emerald-500/30 text-emerald-300"
                      : "bg-red-950/10 border-red-500/30 text-red-300"
                  }`}>
                    <div className="flex items-center gap-2">
                      {runStatus.finalResult === "PASS" ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
                      <h4 className="text-sm font-bold">
                        最終審查報告 ({runStatus.finalResult})
                      </h4>
                    </div>
                    <p className="text-xs leading-relaxed text-gray-200 whitespace-pre-wrap">
                      {runStatus.finalReason}
                    </p>
                  </div>
                )}

              </div>

            </div>
          </div>

        ) : (
          
          /* ================== 主控台：劇本編輯與群組管理畫面 ================== */
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Header */}
            <header className="px-6 py-4 border-b border-white/5 bg-[#0D1220]/50 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-gray-200">
                  {activeGroup ? `群組：${activeGroup.name}` : "工作主控台"}
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  {activeGroup ? "管理該群組底下的所有 E2E 測試劇本" : "請選擇一個群組以開始管理劇本"}
                </p>
              </div>
            </header>

            {/* 主要內容 */}
            <div className="flex-1 overflow-y-auto p-6">
              
              {!selectedGroupId ? (
                /* 未選取群組的炫酷引導卡片 */
                <div className="flex flex-col items-center justify-center h-full max-w-lg mx-auto text-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                    <Folder size={32} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-200">請選取群組</h3>
                    <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
                      在左側的群組導航樹狀圖中，點選任何一個群組。您可以建立測試專案，或在特定群組下建立多個自然語言測試劇本。
                    </p>
                  </div>
                  <div className="flex gap-3 mt-2">
                    <button
                      onClick={() => {
                        setNewSubgroupParentId(null)
                        setShowNewSubgroupModal(true)
                      }}
                      className="px-4 py-2 bg-primary hover:bg-primary-foreground text-white rounded-md text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-purple-500/20 transition-all duration-150"
                    >
                      <Plus size={14} /> 新增根群組
                    </button>
                  </div>
                </div>
              ) : (
                
                /* 群組下的 Testcases 與劇本配置區 */
                <div className="flex flex-col gap-6">
                  
                  {/* 頂部操作欄 */}
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                      測試劇本清單
                    </h3>
                    <button
                      onClick={() => {
                        setTcName("")
                        setTcSteps([""])
                        setTcExpected("")
                        setIsEditingTestcase(false)
                        setShowNewTestcaseForm(true)
                      }}
                      className="px-3 py-1.5 bg-primary hover:bg-primary/90 text-white rounded-md text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-purple-500/25 transition-all duration-150"
                    >
                      <Plus size={14} /> 建立測試案例
                    </button>
                  </div>

                  {/* 表單：建立/編輯測試案例 */}
                  {showNewTestcaseForm && (
                    <div className="bg-[#0D1220]/60 border border-white/5 rounded-xl p-5 flex flex-col gap-4">
                      <h4 className="text-xs font-bold text-gray-200 flex items-center gap-2">
                        <FileText size={14} className="text-purple-400" />
                        {isEditingTestcase ? "編輯測試劇本" : "建立全新測試劇本"}
                      </h4>

                      <div className="flex flex-col gap-3">
                        {/* 劇本名稱 */}
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                            劇本名稱
                          </label>
                          <input
                            type="text"
                            value={tcName}
                            onChange={(e) => setTcName(e.target.value)}
                            placeholder="例如: Wikipedia Gemini 搜尋測試"
                            className="bg-white/5 border border-white/5 rounded-md py-1.5 px-3 text-xs text-gray-200 outline-none focus:border-primary/50"
                          />
                        </div>

                        {/* 自然語言步驟 */}
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                            測試步驟 (自然語言描述)
                          </label>
                          <div className="flex flex-col gap-2">
                            {tcSteps.map((step, idx) => (
                              <div key={idx} className="flex gap-2">
                                <span className="flex items-center justify-center bg-white/5 text-[10px] text-gray-500 rounded px-2 w-7 font-mono">
                                  {idx + 1}
                                </span>
                                <input
                                  type="text"
                                  value={step}
                                  onChange={(e) => handleStepValueChange(idx, e.target.value)}
                                  placeholder="例如: 進入 https://zh.wikipedia.org/ 並搜尋 Gemini"
                                  className="flex-1 bg-white/5 border border-white/5 rounded-md py-1.5 px-3 text-xs text-gray-200 outline-none focus:border-primary/50"
                                />
                                <button
                                  onClick={() => handleRemoveStepInput(idx)}
                                  className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-md transition-colors"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            ))}
                            <button
                              onClick={handleAddStepInput}
                              className="self-start py-1 px-2.5 bg-white/5 hover:bg-white/10 text-[10px] text-gray-400 rounded-md font-semibold flex items-center gap-1 transition-colors mt-0.5"
                            >
                              <Plus size={10} /> 新增下一步
                            </button>
                          </div>
                        </div>

                        {/* 預期結果 */}
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                            預期結果
                          </label>
                          <textarea
                            value={tcExpected}
                            onChange={(e) => setTcExpected(e.target.value)}
                            placeholder="例如: 畫面成功呈現 Gemini 相關維基條目"
                            rows={3}
                            className="bg-white/5 border border-white/5 rounded-md py-1.5 px-3 text-xs text-gray-200 outline-none focus:border-primary/50 resize-none"
                          />
                        </div>
                      </div>

                      {/* 動作按鈕 */}
                      <div className="flex justify-end gap-2.5 border-t border-white/5 pt-3">
                        <button
                          onClick={() => {
                            setShowNewTestcaseForm(false)
                            setIsEditingTestcase(false)
                          }}
                          className="px-3.5 py-1.5 bg-white/5 hover:bg-white/10 text-gray-400 rounded-md text-xs font-semibold transition-colors"
                        >
                          取消
                        </button>
                        <button
                          onClick={handleSaveTestcase}
                          className="px-3.5 py-1.5 bg-primary hover:bg-primary-foreground text-white rounded-md text-xs font-semibold shadow-lg shadow-purple-500/20 transition-all"
                        >
                          儲存劇本
                        </button>
                      </div>
                    </div>
                  )}

                  {/* 測試案例列表 */}
                  <div className="grid grid-cols-1 gap-4">
                    {testcases.length === 0 ? (
                      <div className="text-center py-12 text-xs text-gray-600 italic border border-dashed border-white/5 rounded-xl">
                        此群組下目前暫無測試案例，點擊右上角新增一個吧！
                      </div>
                    ) : (
                      testcases.map((tc) => (
                        <div
                          key={tc.id}
                          className="bg-[#0D1220]/40 border border-white/5 rounded-xl p-5 flex flex-col gap-4 hover:border-white/10 transition-colors"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="text-sm font-bold text-gray-200">{tc.name}</h4>
                              <p className="text-[10px] text-gray-500 font-mono mt-0.5">ID: {tc.id}</p>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => startEditTestcase(tc)}
                                className="p-1.5 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-md transition-colors"
                                title="編輯劇本"
                              >
                                <Edit2 size={13} />
                              </button>
                              <button
                                onClick={() => handleDeleteTestcase(tc.id)}
                                className="p-1.5 bg-red-500/5 hover:bg-red-500/15 text-red-400 hover:text-red-300 rounded-md transition-colors"
                                title="刪除劇本"
                              >
                                <Trash2 size={13} />
                              </button>
                              <button
                                onClick={() => handleTriggerRun(tc.id)}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md text-xs font-semibold flex items-center gap-1 shadow-lg shadow-emerald-600/20 transition-colors ml-1.5"
                              >
                                <Play size={12} fill="white" /> 執行測試
                              </button>
                            </div>
                          </div>

                          <div className="border-t border-white/5 pt-3">
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                              步驟詳情
                            </span>
                            <div className="mt-1.5 flex flex-col gap-1.5">
                              {tc.steps.map((step, idx) => (
                                <div key={idx} className="flex items-center gap-2 text-xs text-gray-400">
                                  <span className="h-4 w-4 bg-white/5 rounded-full flex items-center justify-center text-[9px] font-bold text-gray-500">
                                    {idx + 1}
                                  </span>
                                  <span>{step}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="border-t border-white/5 pt-3">
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                              預期結果
                            </span>
                            <p className="text-xs text-gray-300 mt-1">{tc.expected}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                </div>
              )}

            </div>
          </div>
        )}

      </main>

      {/* ================== 各式彈窗對話框 ================== */}
      
      {/* 彈窗 1：建立專案 */}
      {showNewProjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#0D1220] border border-white/5 w-80 rounded-xl p-5 shadow-2xl flex flex-col gap-4">
            <h3 className="text-sm font-bold text-gray-200">建立新專案</h3>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">專案名稱</label>
              <input
                type="text"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="例如: 公司後台測試"
                className="bg-white/5 border border-white/5 rounded-md py-1.5 px-3 text-xs text-gray-200 outline-none focus:border-primary/50"
              />
            </div>
            <div className="flex justify-end gap-2 border-t border-white/5 pt-3">
              <button
                onClick={() => setShowNewProjectModal(false)}
                className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-gray-400 rounded-md text-xs font-semibold transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleCreateProject}
                className="px-3 py-1.5 bg-primary hover:bg-primary-foreground text-white rounded-md text-xs font-semibold shadow-lg shadow-purple-500/20 transition-all"
              >
                確定建立
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 彈窗 2：建立子群組 */}
      {showNewSubgroupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#0D1220] border border-white/5 w-80 rounded-xl p-5 shadow-2xl flex flex-col gap-4">
            <h3 className="text-sm font-bold text-gray-200">
              {newSubgroupParentId ? "新增子群組" : "新增根群組"}
            </h3>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">群組名稱</label>
              <input
                type="text"
                value={newSubgroupName}
                onChange={(e) => setNewSubgroupName(e.target.value)}
                placeholder="例如: 帳戶中心"
                className="bg-white/5 border border-white/5 rounded-md py-1.5 px-3 text-xs text-gray-200 outline-none focus:border-primary/50"
              />
            </div>
            <div className="flex justify-end gap-2 border-t border-white/5 pt-3">
              <button
                onClick={() => setShowNewSubgroupModal(false)}
                className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-gray-400 rounded-md text-xs font-semibold transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleCreateSubgroup}
                className="px-3 py-1.5 bg-primary hover:bg-primary-foreground text-white rounded-md text-xs font-semibold shadow-lg shadow-purple-500/20 transition-all"
              >
                確定建立
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
