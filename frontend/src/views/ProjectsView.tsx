import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useProjectData } from "../hooks/useProjectData"
import { NewProjectDialog } from "../components/custom/NewProjectDialog"
import { Folder, Plus, ArrowRight, Calendar, Search, ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { TestGroup, Testcase, TestRun } from "../types/api"

export default function ProjectsView() {
  const navigate = useNavigate()
  const { projects, handleCreateProject, isLoading } = useProjectData()
  const [showNewProjectModal, setShowNewProjectModal] = useState(false)

  // 搜尋與排序狀態
  const [searchQuery, setSearchQuery] = useState("")
  const [sortConfig, setSortConfig] = useState<{
    key: "name" | "groupCount" | "testcaseCount" | "lastRun" | "createdAt"
    direction: "asc" | "desc"
  }>({ key: "name", direction: "asc" })

  // 排序處理
  const handleSort = (key: typeof sortConfig.key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc"
    }))
  }

  // 過濾與統計處理
  const filteredProjects = projects.filter(
    (proj) =>
      proj.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (proj.description || "").toLowerCase().includes(searchQuery.toLowerCase())
  )

  const processedProjects = filteredProjects.map((proj) => {
    const groupCount = proj.groups?.length || 0
    let testcaseCount = 0
    let latestRunTime: Date | null = null

    const processGroup = (group: TestGroup) => {
      testcaseCount += group.testcases?.length || 0
      group.testcases?.forEach((tc: Testcase) => {
        tc.runs?.forEach((run: TestRun) => {
          const runDate = new Date(run.createdAt || "")
          if (!latestRunTime || runDate > latestRunTime) {
            latestRunTime = runDate
          }
        })
      })
      if (group.children) {
        group.children.forEach(processGroup)
      }
    }

    if (proj.groups) {
      proj.groups.forEach(processGroup)
    }

    return {
      ...proj,
      groupCount,
      testcaseCount,
      latestRunTime: latestRunTime as Date | null
    }
  })

  // 排序執行
  const sortedProjects = [...processedProjects].sort((a, b) => {
    let aValue: string | number
    let bValue: string | number

    switch (sortConfig.key) {
      case "name":
        aValue = a.name.toLowerCase()
        bValue = b.name.toLowerCase()
        break
      case "groupCount":
        aValue = a.groupCount
        bValue = b.groupCount
        break
      case "testcaseCount":
        aValue = a.testcaseCount
        bValue = b.testcaseCount
        break
      case "lastRun":
        aValue = a.latestRunTime ? a.latestRunTime.getTime() : 0
        bValue = b.latestRunTime ? b.latestRunTime.getTime() : 0
        break
      case "createdAt":
      default:
        aValue = new Date(a.createdAt).getTime()
        bValue = new Date(b.createdAt).getTime()
        break
    }

    if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1
    if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1
    return 0
  })

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-zinc-950 p-8 select-none">
      
      {/* 頂部 Header & 新增按鈕 */}
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

      {/* 搜尋列與表格內容區 */}
      <div className="max-w-6xl w-full mx-auto flex-1 flex flex-col gap-6">
        
        {/* 搜尋 Input */}
        <div className="relative w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 h-4 w-4" />
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜尋專案名稱或描述..."
            className="pl-9 bg-zinc-900 border-zinc-800 text-zinc-100 focus-visible:ring-1 focus-visible:ring-zinc-700 w-full placeholder:text-zinc-500"
          />
        </div>

        {/* 專案表格 */}
        <div className="border border-zinc-850 bg-zinc-900/30 backdrop-blur-md rounded-2xl overflow-hidden shadow-2xl">
          {isLoading ? (
            <div className="text-center py-20 text-sm text-zinc-500 italic">
              載入專案列表中...
            </div>
          ) : sortedProjects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="h-12 w-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400">
                <Folder size={24} />
              </div>
              <div className="text-center">
                <h3 className="text-sm font-bold text-zinc-200">無符合專案</h3>
                <p className="text-xs text-zinc-500 mt-1">目前沒有找到符合條件的專案，請變更搜尋條件或新增專案。</p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-zinc-300">
                <thead>
                  <tr className="border-b border-zinc-850 bg-zinc-950/40 text-xs font-bold text-zinc-400 uppercase tracking-wider">
                    <th
                      onClick={() => handleSort("name")}
                      className="px-6 py-4 cursor-pointer hover:bg-zinc-900/40 hover:text-zinc-200 transition-colors"
                    >
                      <div className="flex items-center gap-1.5">
                        專案名稱 <ArrowUpDown size={12} className="text-zinc-500" />
                      </div>
                    </th>
                    <th className="px-6 py-4">描述</th>
                    <th
                      onClick={() => handleSort("groupCount")}
                      className="px-6 py-4 cursor-pointer hover:bg-zinc-900/40 hover:text-zinc-200 transition-colors"
                    >
                      <div className="flex items-center gap-1.5">
                        群組數 <ArrowUpDown size={12} className="text-zinc-500" />
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort("testcaseCount")}
                      className="px-6 py-4 cursor-pointer hover:bg-zinc-900/40 hover:text-zinc-200 transition-colors"
                    >
                      <div className="flex items-center gap-1.5">
                        劇本數 <ArrowUpDown size={12} className="text-zinc-500" />
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort("lastRun")}
                      className="px-6 py-4 cursor-pointer hover:bg-zinc-900/40 hover:text-zinc-200 transition-colors"
                    >
                      <div className="flex items-center gap-1.5">
                        最後執行時間 <ArrowUpDown size={12} className="text-zinc-500" />
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort("createdAt")}
                      className="px-6 py-4 cursor-pointer hover:bg-zinc-900/40 hover:text-zinc-200 transition-colors"
                    >
                      <div className="flex items-center gap-1.5">
                        建立時間 <ArrowUpDown size={12} className="text-zinc-500" />
                      </div>
                    </th>
                    <th className="px-6 py-4 text-right">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-850/50 text-sm">
                  {sortedProjects.map((proj) => (
                    <tr
                      key={proj.id}
                      onClick={() => navigate(`/project/${proj.id}`)}
                      className="group cursor-pointer hover:bg-zinc-900/20 transition-colors"
                    >
                      {/* 專案名稱 */}
                      <td className="px-6 py-4.5 font-bold text-zinc-100">
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 rounded bg-zinc-950 border border-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-zinc-200 group-hover:border-zinc-700 transition-colors">
                            <Folder size={14} />
                          </div>
                          <span className="group-hover:text-zinc-50 hover:underline">
                            {proj.name}
                          </span>
                        </div>
                      </td>

                      {/* 描述 */}
                      <td className="px-6 py-4.5 text-zinc-400 max-w-xs truncate">
                        {proj.description || "暫無專案描述"}
                      </td>

                      {/* 群組數 */}
                      <td className="px-6 py-4.5 font-mono text-zinc-400">
                        {proj.groupCount}
                      </td>

                      {/* 劇本數 */}
                      <td className="px-6 py-4.5 font-mono text-zinc-400">
                        {proj.testcaseCount}
                      </td>

                      {/* 最後執行時間 */}
                      <td className="px-6 py-4.5 text-zinc-400 text-xs font-mono">
                        {proj.latestRunTime
                          ? proj.latestRunTime.toLocaleString()
                          : "無執行紀錄"}
                      </td>

                      {/* 建立時間 */}
                      <td className="px-6 py-4.5 text-zinc-500 text-xs font-mono">
                        <div className="flex items-center gap-1">
                          <Calendar size={11} />
                          {new Date(proj.createdAt).toLocaleDateString()}
                        </div>
                      </td>

                      {/* 操作 */}
                      <td className="px-6 py-4.5 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 text-xs font-bold text-zinc-400 group-hover:text-zinc-100 hover:bg-zinc-800 gap-1.5"
                        >
                          進入專案{" "}
                          <ArrowRight
                            size={12}
                            className="transform group-hover:translate-x-1 transition-transform"
                          />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
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
