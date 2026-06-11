import type { TestGroup } from "../../types/api"
import { Folder, ChevronRight, ChevronDown, Plus, Trash2 } from "lucide-react"

interface GroupTreeNodeProps {
  node: TestGroup & { children?: TestGroup[] }
  depth?: number
  selectedGroupId: string
  setSelectedGroupId: (id: string) => void
  expandedGroups: Record<string, boolean>
  setExpandedGroups: (expanded: Record<string, boolean>) => void
  onAddSubgroup: (parentId: string) => void
  onDeleteGroup: (groupId: string) => void
}

export function GroupTreeNode({
  node,
  depth = 0,
  selectedGroupId,
  setSelectedGroupId,
  expandedGroups,
  setExpandedGroups,
  onAddSubgroup,
  onDeleteGroup
}: GroupTreeNodeProps) {
  const isExpanded = expandedGroups[node.id] || false
  const hasChildren = node.children && node.children.length > 0
  const isSelected = selectedGroupId === node.id

  return (
    <div className="select-none">
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

      {/* 渲染子節點 */}
      {hasChildren && isExpanded && (
        <div className="mt-0.5">
          {node.children!.map((child) => (
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
            />
          ))}
        </div>
      )}
    </div>
  )
}
