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

  const handleCreateSubgroup = async (name: string, parentId: string | null, initCookies?: unknown, initLocalStorage?: unknown) => {
    if (!name.trim() || !projectId) return null
    try {
      const newGroup = await api.createGroup(projectId, name.trim(), parentId, initCookies, initLocalStorage)
      await loadGroups(projectId)
      toast.success("群組建立成功！")
      return newGroup
    } catch (err) {
      toast.error("建立群組失敗：" + err)
      return null
    }
  }

  const handleDeleteGroup = async (groupId: string) => {
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
    let active = true
    Promise.resolve().then(() => {
      if (active) {
        if (projectId) {
          loadGroups(projectId)
        } else {
          setGroups([])
        }
      }
    })
    return () => {
      active = false
    }
  }, [projectId])

  // 遞迴建構樹狀結構
  const buildGroupTree = (groupList: TestGroup[]): (TestGroup & { children: TestGroup[] })[] => {
    const map = new Map<string, TestGroup & { children: TestGroup[] }>()
    groupList.forEach(g => {
      map.set(g.id, { ...g, children: [] })
    })

    const roots: (TestGroup & { children: TestGroup[] })[] = []
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
