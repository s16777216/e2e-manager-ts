import { useState, useEffect } from "react"
import { useNavigate, useOutletContext } from "react-router-dom"
import { api } from "../lib/api"
import type { Task, Project } from "../types/api"
import { Clock, CheckCircle, XCircle, ArrowRight, Loader2, Filter } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"

interface BreadcrumbItemType {
  label: string
  to?: string
}

interface OutletContextType {
  setBreadcrumbs: (crumbs: BreadcrumbItemType[]) => void
}

export default function HistoryView() {
  const navigate = useNavigate()
  const { setBreadcrumbs } = useOutletContext<OutletContextType>()

  const [tasks, setTasks] = useState<Task[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // 篩選狀態
  const [selectedProjectId, setSelectedProjectId] = useState<string>("all")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")

  // 設定麵包屑
  useEffect(() => {
    Promise.resolve().then(() => {
      setBreadcrumbs([{ label: "執行紀錄" }])
    })
    return () => {
      Promise.resolve().then(() => {
        setBreadcrumbs([])
      })
    }
  }, [setBreadcrumbs])

  // 載入資料
  useEffect(() => {
    const loadData = async () => {
      try {
        const [tasksData, projectsData] = await Promise.all([
          api.getAllTasks(),
          api.getProjects()
        ])
        setTasks(tasksData)
        setProjects(projectsData)
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err)
        toast.error("載入歷史紀錄失敗：" + msg)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-zinc-950 text-zinc-400">
        <div className="flex flex-col items-center gap-2">
          <Loader2 size={24} className="animate-spin text-zinc-500" />
          <span className="text-xs italic">載入執行歷史紀錄中...</span>
        </div>
      </div>
    )
  }

  // 統計計算
  const totalTasks = tasks.length
  const successTasks = tasks.filter(t => t.status === "done" && t.finalResult === "PASS").length
  const failedTasks = tasks.filter(t => t.status === "done" && t.finalResult === "FAIL").length
  const runningTasks = tasks.filter(t => t.status === "running" || t.status === "pending").length

  const finishedCount = successTasks + failedTasks
  const successRate = finishedCount > 0 
    ? Math.round((successTasks / finishedCount) * 100) 
    : 0

  // 前端過濾
  const filteredTasks = tasks.filter(t => {
    const matchProject = selectedProjectId === "all" || t.projectId === selectedProjectId
    
    let matchStatus = true
    if (selectedStatus === "done-pass") {
      matchStatus = t.status === "done" && t.finalResult === "PASS"
    } else if (selectedStatus === "done-fail") {
      matchStatus = t.status === "done" && t.finalResult === "FAIL"
    } else if (selectedStatus === "running") {
      matchStatus = t.status === "running" || t.status === "pending"
    }

    return matchProject && matchStatus
  })

  return (
    <div className="flex-1 flex flex-col bg-zinc-950 text-foreground overflow-y-auto select-none p-8 animate-fadeIn">
      
      {/* 頂部 Header */}
      <div className="max-w-6xl w-full mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-10">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-zinc-100 via-zinc-300 to-zinc-500 bg-clip-text text-transparent flex items-center gap-2">
            <Clock size={24} className="text-zinc-400" />
            執行紀錄 (History)
          </h2>
          <p className="text-zinc-400 text-sm mt-1.5 leading-relaxed">
            監控所有專案的批次測試執行歷史，並追蹤其即時狀態與測試覆蓋進度。
          </p>
        </div>
      </div>

      {/* Bento Statistics Grid */}
      <div className="max-w-6xl w-full mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        
        {/* 總執行次數 */}
        <div className="bg-zinc-900/30 backdrop-blur-md border border-zinc-850/60 rounded-2xl p-5 shadow flex flex-col justify-between h-28">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">總執行任務數</span>
          <span className="text-3xl font-black font-mono text-zinc-200 mt-2">{totalTasks}</span>
        </div>

        {/* 執行中任務 */}
        <div className="bg-zinc-900/30 backdrop-blur-md border border-zinc-850/60 rounded-2xl p-5 shadow flex flex-col justify-between h-28">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">執行中 / 排隊中</span>
          <span className="text-3xl font-black font-mono text-emerald-500 mt-2">{runningTasks}</span>
        </div>

        {/* 成功執行數 */}
        <div className="bg-zinc-900/30 backdrop-blur-md border border-zinc-850/60 rounded-2xl p-5 shadow flex flex-col justify-between h-28">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">成功次數 (PASS)</span>
          <span className="text-3xl font-black font-mono text-emerald-400 mt-2">{successTasks}</span>
        </div>

        {/* 平均成功率 */}
        <div className="bg-zinc-900/30 backdrop-blur-md border border-zinc-850/60 rounded-2xl p-5 shadow flex flex-col justify-between h-28">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">成功率 (Pass Rate)</span>
          <span className="text-3xl font-black font-mono text-zinc-200 mt-2">
            {successRate}%
            <span className="text-[10px] text-zinc-500 font-normal ml-1.5">({successTasks}/{finishedCount})</span>
          </span>
        </div>

      </div>

      {/* 篩選控制項 */}
      <div className="max-w-6xl w-full mx-auto flex flex-wrap items-center gap-4 mb-6 bg-zinc-900/10 border border-zinc-850/40 p-4 rounded-xl backdrop-blur-sm">
        <div className="flex items-center gap-2 text-zinc-400 text-xs font-bold uppercase tracking-wider">
          <Filter size={12} />
          <span>篩選條件</span>
        </div>

        {/* 專案篩選 */}
        <div className="w-56">
          <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
            <SelectTrigger className="bg-zinc-950 border-zinc-850 text-zinc-300 h-9 text-xs">
              <SelectValue placeholder="所有專案" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-850 text-zinc-300">
              <SelectItem value="all">所有專案</SelectItem>
              {projects.map(p => (
                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 狀態篩選 */}
        <div className="w-44">
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="bg-zinc-950 border-zinc-850 text-zinc-300 h-9 text-xs">
              <SelectValue placeholder="所有狀態" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-850 text-zinc-300">
              <SelectItem value="all">所有狀態</SelectItem>
              <SelectItem value="done-pass">成功 (PASS)</SelectItem>
              <SelectItem value="done-fail">失敗 (FAIL)</SelectItem>
              <SelectItem value="running">執行中</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 歷史任務表格 */}
      <div className="max-w-6xl w-full mx-auto flex-1 flex flex-col">
        <div className="border border-zinc-850 bg-zinc-900/30 backdrop-blur-md rounded-2xl overflow-hidden shadow-2xl">
          {filteredTasks.length === 0 ? (
            <div className="text-center py-20 text-sm text-zinc-500 italic">
              找不到符合篩選條件的歷史紀錄。
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-zinc-300">
                <thead>
                  <tr className="border-b border-zinc-850 bg-zinc-950/40 text-xs font-bold text-zinc-400 uppercase tracking-wider">
                    <th className="px-6 py-4">任務編號</th>
                    <th className="px-6 py-4">所屬專案</th>
                    <th className="px-6 py-4">範圍</th>
                    <th className="px-6 py-4">進度 (完成 / 總數)</th>
                    <th className="px-6 py-4">建立時間</th>
                    <th className="px-6 py-4">結果</th>
                    <th className="px-6 py-4 text-right">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-850/50 text-sm">
                  {filteredTasks.map((t) => {
                    const taskShortId = t.id.substring(0, 8)
                    const scopeLabel = t.scope === "project" ? "專案" : t.scope === "group" ? "群組" : "單一案例"

                    const renderResultBadge = () => {
                      if (t.status !== "done") {
                        return (
                          <span className="flex items-center gap-1 text-[10px] text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full font-medium w-max">
                            <Loader2 size={10} className="animate-spin text-emerald-500" /> 執行中
                          </span>
                        )
                      }
                      return t.finalResult === "PASS" ? (
                        <span className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full font-medium w-max">
                          <CheckCircle size={10} /> 成功
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[10px] text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full font-medium w-max">
                          <XCircle size={10} /> 失敗
                        </span>
                      )
                    }

                    const progressPercent = t.totalCount > 0 ? Math.round((t.doneCount / t.totalCount) * 100) : 0

                    return (
                      <tr
                        key={t.id}
                        onClick={() => navigate(`/project/${t.projectId || "unknown"}/tasks/${t.id}`)}
                        className="cursor-pointer hover:bg-zinc-900/20 transition-colors text-zinc-300 hover:text-zinc-100"
                      >
                        <td className="px-6 py-4 font-mono text-zinc-200">
                          #{taskShortId}
                        </td>
                        <td className="px-6 py-4 font-bold text-zinc-200">
                          {t.projectName || "未知專案"}
                        </td>
                        <td className="px-6 py-4">{scopeLabel}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3 w-48">
                            <Progress value={progressPercent} className="h-1.5 w-24 bg-zinc-950 border border-zinc-900" />
                            <span className="font-mono text-xs">{t.doneCount} / {t.totalCount}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs font-mono text-zinc-400">
                          {new Date(t.createdAt).toLocaleString()}
                        </td>
                        <td className="px-6 py-4">{renderResultBadge()}</td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-xs text-zinc-500 hover:text-zinc-300 font-medium inline-flex items-center gap-1">
                            監控 <ArrowRight size={12} />
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
