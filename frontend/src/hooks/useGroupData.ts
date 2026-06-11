import { useState, useEffect } from "react"
import { api } from "../lib/api"
import type { TestGroup } from "../types/api"
import { toast } from "sonner"

export function useGroupData(projectId: string | undefined) {
  const [groups, setGroups] = useState<TestGroup[]>([])
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({})
  const [isLoading, setIsLoading] = useState(false)

  const loadGroups = async (projId: string) => {
    setIsLoading(true)
    try {
      const data = await api.getGroups(projId)
      setGroups(data)
    } catch (err) {
      console.error(err)
      toast.error("載入群組失敗")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateSubgroup = async (name: string, parentId: string | null) => {
    if (!name.trim() || !projectId) return null
    try {
      const newGroup = await api.createGroup(projectId, name.trim(), parentId)
      await loadGroups(projectId)
      toast.success("群組建立成功！")
      return newGroup
    } catch (err) {
      toast.error("建立群組失敗：" + err)
      return null
    }
  }

  const handleDeleteGroup = async (groupId: string) => {
    if (!confirm("確定要刪除此群組嗎？這將會刪除其下的測試案例！")) return false
    try {
      await api.deleteGroup(groupId)
      if (projectId) {
        await loadGroups(projectId)
      }
      toast.success("群組刪除成功！")
      return true
    } catch (err) {
      toast.error("刪除群組失敗：" + err)
      return false
    }
  }

  useEffect(() => {
    if (projectId) {
      loadGroups(projectId)
    } else {
      setGroups([])
    }
  }, [projectId])

  // 遞迴建構樹狀結構
  const buildGroupTree = (groupList: TestGroup[]): (TestGroup & { children: any[] })[] => {
    const map = new Map<string, TestGroup & { children: any[] }>()
    groupList.forEach(g => {
      map.set(g.id, { ...g, children: [] })
    })

    const roots: (TestGroup & { children: any[] })[] = []
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

  return {
    groups,
    groupTree,
    expandedGroups,
    setExpandedGroups,
    isLoading,
    loadGroups,
    handleCreateSubgroup,
    handleDeleteGroup
  }
}
