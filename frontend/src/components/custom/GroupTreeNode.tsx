import { Folder, ChevronRight, ChevronDown, Plus, Trash2, FileText, Loader2, Play, Edit2 } from "lucide-react"
import { useNavigate } from "react-router-dom"

export interface FlatTreeRow {
  id: string;
  name: string;
  type: "group" | "testcase" | "loading";
  depth: number;
  isExpanded: boolean;
  hasChildren: boolean;
  itemCount: number;
  lastStatus?: "pending" | "running" | "passed" | "failed" | "error";
  parentId: string | null;
}

interface GroupTreeNodeProps {
  row: FlatTreeRow;
  selectedGroupId: string;
  setSelectedGroupId: (id: string) => void;
  activeTestCaseId?: string;
  onToggleExpand: (groupId: string) => void;
  onAddSubgroup: (parentId: string) => void;
  onDeleteGroup: (groupId: string) => void;
  onEditGroup?: (groupId: string) => void;
  onRunGroup?: (groupId: string) => void;
  projectId: string;
}

export function GroupTreeNode({
  row,
  selectedGroupId,
  setSelectedGroupId,
  activeTestCaseId,
  onToggleExpand,
  onAddSubgroup,
  onDeleteGroup,
  onEditGroup,
  onRunGroup,
  projectId
}: GroupTreeNodeProps) {
  const navigate = useNavigate()

  // 判斷選取狀態
  const isSelected = row.type === "group" 
    ? selectedGroupId === row.id 
    : activeTestCaseId === row.id;

  // 處理點擊整列行為
  const handleRowClick = () => {
    if (row.type === "group") {
      setSelectedGroupId(row.id)
      onToggleExpand(row.id)
    } else if (row.type === "testcase") {
      navigate(`/project/${projectId}/testCase/${row.id}`)
    }
  }

  // 渲染狀態 Badge
  const renderStatusBadge = (status?: string) => {
    if (!status) return <span className="text-zinc-600">-</span>;
    
    switch (status) {
      case "passed":
        return (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Passed
          </span>
        )
      case "failed":
        return (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
            Failed
          </span>
        )
      case "running":
        return (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20 animate-pulse">
            Running
          </span>
        )
      case "error":
        return (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
            Error
          </span>
        )
      case "pending":
      default:
        return (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-zinc-500/10 text-zinc-400 border border-zinc-500/20">
            Pending
          </span>
        )
    }
  }

  // 1. Loading Row 渲染
  if (row.type === "loading") {
    return (
      <tr className="border-b border-zinc-850/30 text-zinc-500">
        <td className="px-6 py-4 text-sm italic" style={{ paddingLeft: `${row.depth * 20 + 16}px` }}>
          <div className="flex items-center gap-1.5">
            <Loader2 size={12} className="animate-spin text-zinc-500" />
            <span>載入測試案例中...</span>
          </div>
        </td>
        <td className="px-6 py-4 text-sm">-</td>
        <td className="px-6 py-4 text-sm text-center">-</td>
        <td className="px-6 py-4 text-sm text-right">-</td>
      </tr>
    )
  }

  // 2. 一般 Row (Group / TestCase) 渲染
  return (
    <tr
      onClick={handleRowClick}
      className={`group cursor-pointer hover:bg-zinc-900/20 transition-colors border-b border-zinc-850/30 text-sm ${
        isSelected
          ? "bg-zinc-900/60 text-zinc-100 font-medium"
          : "text-zinc-400 hover:text-zinc-200"
      }`}
    >
      {/* 欄位 1: 名稱 */}
      <td className="px-6 py-4" style={{ paddingLeft: `${row.depth * 20 + 16}px` }}>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            {/* 折疊按鈕 (僅群組且有子項目時顯示，其餘留白) */}
            {row.type === "group" ? (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onToggleExpand(row.id)
                }}
                className="p-0.5 hover:bg-zinc-800 rounded text-zinc-500 hover:text-zinc-200 transition-colors"
              >
                {row.isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </button>
            ) : (
              <div className="w-5" />
            )}
            
            {/* 類型圖示 */}
            {row.type === "group" ? (
              <Folder size={15} className={isSelected ? "text-primary" : "text-zinc-500"} />
            ) : (
              <FileText size={15} className={isSelected ? "text-primary" : "text-zinc-600"} />
            )}

            {/* 名稱文字 */}
            <span className="truncate max-w-[280px]" title={row.name}>
              {row.name}
            </span>
          </div>

          {/* 操作按鈕 (僅群組有，且在 hover 時才顯示) */}
          {row.type === "group" && (
            <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 transition-opacity duration-150 shrink-0">
              {onRunGroup && (
                <button
                  title="執行此群組所有測試案例"
                  onClick={(e) => {
                    e.stopPropagation()
                    onRunGroup(row.id)
                  }}
                  className="p-1.5 hover:bg-zinc-800 rounded text-emerald-500 hover:text-emerald-400 transition-colors"
                >
                  <Play size={12} className="fill-current" />
                </button>
              )}
              {onEditGroup && (
                <button
                  title="編輯群組"
                  onClick={(e) => {
                    e.stopPropagation()
                    onEditGroup(row.id)
                  }}
                  className="p-1.5 hover:bg-zinc-800 rounded text-zinc-500 hover:text-zinc-100 transition-colors"
                >
                  <Edit2 size={12} />
                </button>
              )}
              <button
                title="新增子群組"
                onClick={(e) => {
                  e.stopPropagation()
                  onAddSubgroup(row.id)
                }}
                className="p-1.5 hover:bg-zinc-800 rounded text-zinc-500 hover:text-zinc-100 transition-colors"
              >
                <Plus size={12} />
              </button>
              <button
                title="刪除群組"
                onClick={(e) => {
                  e.stopPropagation()
                  onDeleteGroup(row.id)
                }}
                className="p-1.5 hover:bg-zinc-800 rounded text-zinc-500 hover:text-rose-400 transition-colors"
              >
                <Trash2 size={12} />
              </button>
            </div>
          )}
        </div>
      </td>

      {/* 欄位 2: 類型 */}
      <td className="px-6 py-4 text-xs text-zinc-500 uppercase tracking-wider">
        {row.type === "group" ? "群組" : "測試案例"}
      </td>

      {/* 欄位 3: 項目/步驟數 */}
      <td className="px-6 py-4 font-mono text-center text-zinc-500">
        {row.itemCount}
      </td>

      {/* 欄位 4: 最後執行狀態 */}
      <td className="px-6 py-4 text-right">
        {row.type === "testcase" ? renderStatusBadge(row.lastStatus) : <span className="text-zinc-600">-</span>}
      </td>
    </tr>
  )
}
