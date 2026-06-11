import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import type { TestGroup, Testcase } from "../../types/api"
import { api } from "../../lib/api"
import { Folder, ChevronRight, ChevronDown, Plus, Trash2, FileText, Loader2 } from "lucide-react"

interface GroupTreeNodeProps {
  node: TestGroup & { children?: TestGroup[] }
  depth?: number
  selectedGroupId: string
  setSelectedGroupId: (id: string) => void
  expandedGroups: Record<string, boolean>
  setExpandedGroups: (expanded: Record<string, boolean>) => void
  onAddSubgroup: (parentId: string) => void
  onDeleteGroup: (groupId: string) => void
  projectId: string
  refreshTrigger?: number
}

export function GroupTreeNode({
  node,
  depth = 0,
  selectedGroupId,
  setSelectedGroupId,
  expandedGroups,
  setExpandedGroups,
  onAddSubgroup,
  onDeleteGroup,
  projectId,
  refreshTrigger = 0
}: GroupTreeNodeProps) {
  const navigate = useNavigate()
  const isExpanded = expandedGroups[node.id] || false
  const hasChildren = node.children && node.children.length > 0
  const isSelected = selectedGroupId === node.id

  // 測試案例懶加載狀態
  const [testcases, setTestcases] = useState<Testcase[]>([])
  const [loadingTestcases, setLoadingTestcases] = useState(false)
  const [hasLoaded, setHasLoaded] = useState(false)

  // 當 node.id 或 refreshTrigger 改變時，在 render 階段同步重設加載狀態，避免 effect 中的 cascading renders
  const [prevNodeId, setPrevNodeId] = useState(node.id)
  const [prevRefreshTrigger, setPrevRefreshTrigger] = useState(refreshTrigger)

  if (node.id !== prevNodeId || refreshTrigger !== prevRefreshTrigger) {
    setPrevNodeId(node.id)
    setPrevRefreshTrigger(refreshTrigger)
    setHasLoaded(false)
    setTestcases([])
    setLoadingTestcases(false)
  }

  // 當展開且尚未載入且不處於載入狀態時，在 render 階段設定為載入中，避免在 effect 中同步呼叫 setState
  if (isExpanded && !hasLoaded && !loadingTestcases) {
    setLoadingTestcases(true)
  }

  // 懶加載測試案例
  useEffect(() => {
    if (!isExpanded || hasLoaded) return

    let active = true
    api.getTestcases(node.id)
      .then((data) => {
        if (active) {
          setTestcases(data)
          setHasLoaded(true)
        }
      })
      .catch((err) => {
        console.error(`載入群組 ${node.name} 的測試案例失敗:`, err)
      })
      .finally(() => {
        if (active) {
          setLoadingTestcases(false)
        }
      })

    return () => {
      active = false
    }
  }, [isExpanded, node.id, hasLoaded, node.name])

  const handleGroupClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedGroupId(node.id)
    setExpandedGroups({
      ...expandedGroups,
      [node.id]: !isExpanded
    })
  }

  const hasAnyChildren = hasChildren || testcases.length > 0

  return (
    <div className="select-none">
      <div
        style={{ paddingLeft: `${depth * 12 + 6}px` }}
        className={`group flex items-center justify-between py-1.5 px-2 rounded-md cursor-pointer transition-colors duration-150 ${
          isSelected
            ? "bg-accent text-accent-foreground border-l-2 border-primary"
            : "hover:bg-muted text-muted-foreground hover:text-foreground"
        }`}
        onClick={handleGroupClick}
      >
        <div className="flex items-center gap-1.5 min-w-0">
          {hasAnyChildren || (isExpanded && loadingTestcases) ? (
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
              onAddSubgroup(node.id)
            }}
            className="p-1 hover:bg-accent rounded text-muted-foreground hover:text-foreground"
          >
            <Plus size={12} />
          </button>
          <button
            title="刪除群組"
            onClick={(e) => {
              e.stopPropagation()
              onDeleteGroup(node.id)
            }}
            className="p-1 hover:bg-accent rounded text-muted-foreground hover:text-destructive"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      {/* 渲染子群組與測試案例 */}
      {isExpanded && (
        <div className="mt-0.5">
          {/* 1. 子群組 */}
          {hasChildren && node.children!.map((child) => (
            <GroupTreeNode
              key={child.id}
              node={child}
              depth={depth + 1}
              selectedGroupId={selectedGroupId}
              setSelectedGroupId={setSelectedGroupId}
              expandedGroups={expandedGroups}
              setExpandedGroups={setExpandedGroups}
              onAddSubgroup={onAddSubgroup}
              onDeleteGroup={onDeleteGroup}
              projectId={projectId}
              refreshTrigger={refreshTrigger}
            />
          ))}

          {/* 2. 測試案例載入中 */}
          {loadingTestcases && !hasLoaded && (
            <div
              style={{ paddingLeft: `${(depth + 1) * 12 + 10}px` }}
              className="flex items-center gap-1.5 py-1 px-2 text-xs text-muted-foreground italic"
            >
              <Loader2 size={12} className="animate-spin" />
              <span>載入測試案例中...</span>
            </div>
          )}

          {/* 3. 測試案例列表 */}
          {hasLoaded && testcases.map((tc) => (
            <div
              key={tc.id}
              style={{ paddingLeft: `${(depth + 1) * 12 + 10}px` }}
              className="group/tc flex items-center justify-between py-1.5 px-2 rounded-md cursor-pointer hover:bg-muted text-muted-foreground hover:text-foreground border border-transparent transition-all duration-150"
              onClick={() => navigate(`/project/${projectId}/testCase/${tc.id}`)}
            >
              <div className="flex items-center gap-2 min-w-0">
                <FileText size={14} className="text-zinc-500 group-hover/tc:text-primary transition-colors" />
                <span className="text-sm truncate">{tc.name}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
