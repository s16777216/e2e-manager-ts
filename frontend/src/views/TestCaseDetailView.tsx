import React, { useState, useEffect, useCallback } from "react"
import { useParams, useNavigate, useOutletContext } from "react-router-dom"
import { useProjectData } from "../hooks/useProjectData"
import { api } from "../lib/api"
import type { Testcase } from "../types/api"
import { Play, Edit, Trash2, Plus, CheckCircle, XCircle, Clock, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from "sonner"

interface BreadcrumbItemType {
  label: string
  to?: string
}

interface OutletContextType {
  setBreadcrumbs: (crumbs: BreadcrumbItemType[]) => void
}

export default function TestCaseDetailView() {
  const { projectId, testCaseId } = useParams()
  const navigate = useNavigate()

  // 測試案例狀態
  const [testcase, setTestcase] = useState<Testcase | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // 專案與全域麵包屑
  const { projects } = useProjectData()
  const activeProject = projects.find((p) => p.id === projectId)
  const { setBreadcrumbs } = useOutletContext<OutletContextType>()

  useEffect(() => {
    const projectName = activeProject ? activeProject.name : "載入中..."
    const tcNameText = testcase ? testcase.name : "載入中..."
    Promise.resolve().then(() => {
      setBreadcrumbs([
        { label: "專案列表", to: "/project" },
        { label: projectName, to: `/project/${projectId}` },
        { label: tcNameText }
      ])
    })
    return () => {
      Promise.resolve().then(() => {
        setBreadcrumbs([])
      })
    }
  }, [projectId, activeProject, testcase, setBreadcrumbs])

  // 編輯模式狀態
  const [isEditing, setIsEditing] = useState(false)
  const [tcName, setTcName] = useState("")
  const [tcSteps, setTcSteps] = useState<string[]>([""])
  const [tcExpected, setTcExpected] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  // 執行測試狀態
  const [isTriggering, setIsTriggering] = useState(false)

  // 當前 Active Tab: "steps" | "history"
  const [activeTab, setActiveTab] = useState<"steps" | "history">("steps")

  // 當 testCaseId 變更時，在 render 階段重設編輯模式與分頁狀態，避免 useEffect 中同步 setState 造成 cascading renders
  const [prevTestCaseId, setPrevTestCaseId] = useState(testCaseId)
  if (testCaseId !== prevTestCaseId) {
    setPrevTestCaseId(testCaseId)
    setIsEditing(false)
    setActiveTab("steps")
    setIsLoading(true)
  }

  // 載入測試案例詳情與執行紀錄
  const loadTestCaseData = useCallback(async () => {
    if (!testCaseId) return
    try {
      const data = await api.getTestcaseDetail(testCaseId)
      setTestcase(data)
      // 同步設定編輯欄位
      setTcName(data.name)
      setTcSteps(data.steps.length > 0 ? [...data.steps] : [""])
      setTcExpected(data.expected)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      toast.error("載入測試案例失敗：" + msg)
    } finally {
      setIsLoading(false)
    }
  }, [testCaseId])

  useEffect(() => {
    let active = true
    Promise.resolve().then(() => {
      if (active) {
        loadTestCaseData()
      }
    })
    return () => {
      active = false
    }
  }, [loadTestCaseData])

  // 步驟表單增減
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

  // 儲存修改
  const handleSaveEdit = async () => {
    if (!testCaseId) return
    if (!tcName.trim() || tcSteps.some((s) => !s.trim()) || !tcExpected.trim()) {
      toast.error("請填寫所有必填欄位，且步驟不可為空！")
      return
    }

    setIsSaving(true)
    try {
      await api.updateTestcase(testCaseId, {
        name: tcName.trim(),
        steps: tcSteps.map((s) => s.trim()),
        expected: tcExpected.trim()
      })
      toast.success("測試案例修改成功！")
      setIsEditing(false)
      await loadTestCaseData()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      toast.error("修改測試案例失敗：" + msg)
    } finally {
      setIsSaving(false)
    }
  }

  // 執行測試
  const handleRunTestCase = async () => {
    if (!testCaseId) return
    setIsTriggering(true)
    try {
      const res = await api.triggerRun(testCaseId)
      toast.success("測試任務已啟動！正在轉跳監控頁面...")
      // 跳轉到 SSE 即時監控頁面
      navigate(`/project/${projectId}/tasks/${res.taskId}`)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      toast.error("執行測試失敗：" + msg)
    } finally {
      setIsTriggering(false)
    }
  }

  // 狀態徽章輔助元件
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "passed":
        return (
          <span className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full font-medium">
            <CheckCircle size={10} /> 成功 (Passed)
          </span>
        )
      case "failed":
      case "error":
        return (
          <span className="flex items-center gap-1 text-[10px] text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full font-medium">
            <XCircle size={10} /> 失敗 ({status.toUpperCase()})
          </span>
        )
      case "running":
        return (
          <span className="flex items-center gap-1 text-[10px] text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full font-medium">
            <Loader2 size={10} className="animate-spin" /> 執行中 (Running)
          </span>
        )
      default:
        return (
          <span className="flex items-center gap-1 text-[10px] text-zinc-400 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded-full font-medium">
            <Clock size={10} /> 排隊中 (Pending)
          </span>
        )
    }
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-zinc-950 text-zinc-400">
        <div className="flex flex-col items-center gap-2">
          <Loader2 size={24} className="animate-spin text-zinc-500" />
          <span className="text-xs italic">載入測試案例詳情中...</span>
        </div>
      </div>
    )
  }

  if (!testcase) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-zinc-950 text-zinc-400 gap-4">
        <p className="text-sm">找不到指定的測試案例資料</p>
        <Button onClick={() => navigate(`/project/${projectId}`)}>返回專案</Button>
      </div>
    )
  }

  // 將執行紀錄排序，最新的排在前面
  const sortedRuns = testcase.runs ? [...testcase.runs].sort((a, b) => {
    return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
  }) : []

  return (
    <div className="flex-1 flex flex-col bg-zinc-950 text-foreground overflow-hidden select-none">
      
      {/* 頂部控制列 - 頁面內部控制工具欄 */}
      <div className="px-8 py-6 flex items-center justify-between flex-shrink-0 animate-fadeIn gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-zinc-100">
            {isEditing ? "編輯測試案例" : testcase.name}
          </h2>
          <p className="text-xs font-mono text-zinc-500 mt-1">ID: {testcase.id}</p>
        </div>

        {/* 右側操作按鈕 */}
        <div className="flex items-center gap-2">
          {!isEditing && (
            <>
              <Button
                variant="outline"
                onClick={() => setIsEditing(true)}
                className="border-zinc-800 hover:bg-zinc-900 hover:text-zinc-100 text-zinc-300 gap-1.5"
              >
                <Edit size={14} /> 編輯測試案例
              </Button>
              <Button
                onClick={handleRunTestCase}
                disabled={isTriggering}
                className="bg-emerald-600 text-white hover:bg-emerald-500 font-semibold gap-1.5 shadow-lg shadow-emerald-600/10"
              >
                {isTriggering ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} fill="white" />}
                執行測試
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Tabs 控制按鈕 (Bento Style) */}
      <div className="px-8 pt-4 border-b border-zinc-900/50 bg-zinc-950 flex gap-2">
        <button
          onClick={() => {
            if (!isEditing) {
              setActiveTab("steps")
            }
          }}
          disabled={isEditing}
          className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all border-b-2 ${
            activeTab === "steps"
              ? "border-primary text-zinc-200"
              : "border-transparent text-zinc-500 hover:text-zinc-300 disabled:opacity-50"
          }`}
        >
          測試步驟 (Steps)
        </button>
        <button
          onClick={() => {
            if (!isEditing) {
              setActiveTab("history")
            }
          }}
          disabled={isEditing}
          className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all border-b-2 ${
            activeTab === "history"
              ? "border-primary text-zinc-200"
              : "border-transparent text-zinc-500 hover:text-zinc-300 disabled:opacity-50"
          }`}
        >
          執行歷史 ({sortedRuns.length})
        </button>
      </div>

      {/* 主要內容區 (ScrollArea 包裹) */}
      <ScrollArea className="flex-1 bg-zinc-950/40">
        <div className="p-8">
          
          {/* Steps Tab */}
          {activeTab === "steps" && (
            <div className="flex flex-col gap-6">
              
              {/* 編輯模式表單 */}
              {isEditing ? (
                <div className="bg-zinc-900/30 border border-zinc-850 rounded-2xl p-6 flex flex-col gap-5 shadow-lg">
                  {/* 編輯名稱 */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                      測試案例名稱 <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="text"
                      value={tcName}
                      onChange={(e) => setTcName(e.target.value)}
                      placeholder="修改測試案例名稱"
                      className="bg-zinc-950 border-zinc-800 text-zinc-100"
                    />
                  </div>

                  {/* 編輯自然語言步驟 */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                      測試步驟 <span className="text-red-500">*</span>
                    </label>
                    <div className="flex flex-col gap-2.5">
                      {tcSteps.map((step, idx) => (
                        <div key={idx} className="flex gap-2">
                          <span className="flex items-center justify-center bg-zinc-950 border border-zinc-800 text-[10px] text-zinc-400 rounded px-2 w-7 font-mono flex-shrink-0">
                            {idx + 1}
                          </span>
                          <Input
                            type="text"
                            value={step}
                            onChange={(e) => handleStepValueChange(idx, e.target.value)}
                            placeholder="描述執行動作，如：點擊 '送出' 按鈕"
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
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleAddStepInput}
                        className="self-start text-[10px] border-zinc-850"
                      >
                        <Plus size={10} /> 新增下一步
                      </Button>
                    </div>
                  </div>

                  {/* 編輯預期結果 */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                      預期結果 <span className="text-red-500">*</span>
                    </label>
                    <Textarea
                      value={tcExpected}
                      onChange={(e) => setTcExpected(e.target.value)}
                      placeholder="修改預期結果"
                      rows={3}
                      className="resize-none bg-zinc-950 border-zinc-800 text-zinc-100"
                    />
                  </div>

                  {/* 表單底操作 */}
                  <div className="flex justify-end gap-2 border-t border-zinc-850 pt-4 mt-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsEditing(false)
                        // 還原資料
                        setTcName(testcase.name)
                        setTcSteps([...testcase.steps])
                        setTcExpected(testcase.expected)
                      }}
                      className="border-zinc-800 text-zinc-300 hover:bg-zinc-950"
                    >
                      取消
                    </Button>
                    <Button
                      onClick={handleSaveEdit}
                      disabled={isSaving}
                      className="bg-zinc-100 text-zinc-950 hover:bg-zinc-200"
                    >
                      {isSaving ? <Loader2 size={14} className="animate-spin" /> : "儲存修改"}
                    </Button>
                  </div>
                </div>
              ) : (
                // 唯讀檢視模式
                <div className="flex flex-col gap-6">
                  {/* 測試步驟 Card */}
                  <div className="bg-zinc-900/20 border border-zinc-850 rounded-2xl p-6 shadow-md flex flex-col gap-4">
                    <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                      步驟詳情 (Steps)
                    </h4>
                    <div className="flex flex-col gap-3">
                      {testcase.steps.map((step, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                          <span className="h-6 w-6 bg-zinc-900 border border-zinc-800 rounded-full flex items-center justify-center text-[10px] font-bold text-zinc-300 font-mono">
                            {idx + 1}
                          </span>
                          <span className="text-sm text-zinc-300">{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 預期結果 Card */}
                  <div className="bg-zinc-900/20 border border-zinc-850 rounded-2xl p-6 shadow-md flex flex-col gap-3">
                    <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                      預期結果 (Expected)
                    </h4>
                    <p className="text-sm text-zinc-300 leading-relaxed bg-zinc-950/40 p-4 rounded-xl border border-zinc-900 font-medium">
                      {testcase.expected}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* History Tab */}
          {activeTab === "history" && (
            <div className="flex flex-col gap-4">
              {sortedRuns.length === 0 ? (
                <div className="text-center py-20 text-xs text-zinc-500 italic border border-dashed border-zinc-850 rounded-2xl">
                  暫無歷史執行紀錄。點擊右上方「執行測試」以啟動第一次視覺測試！
                </div>
              ) : (
                <div className="border border-zinc-850 bg-zinc-900/30 backdrop-blur-md rounded-2xl overflow-hidden shadow-2xl">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-zinc-300">
                      <thead>
                        <tr className="border-b border-zinc-850 bg-zinc-950/40 text-xs font-bold text-zinc-400 uppercase tracking-wider">
                          <th className="px-6 py-4">執行編號</th>
                          <th className="px-6 py-4">狀態</th>
                          <th className="px-6 py-4">啟動時間</th>
                          <th className="px-6 py-4">執行耗時</th>
                          <th className="px-6 py-4">最終審查結論</th>
                          <th className="px-6 py-4 text-right">操作</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-850/50 text-sm">
                        {sortedRuns.map((run) => {
                          // 計算執行耗時
                          let duration = "-"
                          if (run.createdAt && run.finishedAt) {
                            const start = new Date(run.createdAt).getTime()
                            const end = new Date(run.finishedAt).getTime()
                            if (!isNaN(start) && !isNaN(end)) {
                              const diff = end - start
                              duration = diff < 0 ? "0s" : `${Math.round(diff / 1000)}s`
                            }
                          }

                          // 格式化最終審查結論
                          const reasonShort = run.finalReason
                            ? run.finalReason.length <= 25
                              ? run.finalReason
                              : `${run.finalReason.substring(0, 25)}...`
                            : "無"

                          return (
                            <tr
                              key={run.id}
                              onClick={() => navigate(`/project/${projectId}/run/${run.id}`)}
                              className="group cursor-pointer hover:bg-zinc-900/20 transition-colors border-b border-zinc-850/30 text-zinc-300 hover:text-zinc-100"
                            >
                              {/* 執行編號 */}
                              <td className="px-6 py-4 font-mono text-zinc-200 group-hover:text-primary transition-colors">
                                #{run.id.substring(0, 8)}
                              </td>
                              {/* 狀態 */}
                              <td className="px-6 py-4">
                                {renderStatusBadge(run.status)}
                              </td>
                              {/* 啟動時間 */}
                              <td className="px-6 py-4 text-zinc-400 text-xs font-mono">
                                {new Date(run.createdAt || 0).toLocaleString()}
                              </td>
                              {/* 執行耗時 */}
                              <td className="px-6 py-4 text-zinc-400 text-xs font-mono">
                                {duration}
                              </td>
                              {/* 最終審查結論 */}
                              <td
                                className="px-6 py-4 text-zinc-400 text-xs max-w-xs truncate"
                                title={run.finalReason || ""}
                              >
                                {reasonShort}
                              </td>
                              {/* 操作 */}
                              <td className="px-6 py-4 text-right">
                                <span className="text-xs text-zinc-500 group-hover:text-zinc-300 font-medium transition-colors">
                                  查看詳情 &rarr;
                                </span>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </ScrollArea>
    </div>
  )
}
