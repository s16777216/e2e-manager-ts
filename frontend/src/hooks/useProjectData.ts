import { useState, useEffect } from "react"
import { api } from "../lib/api"
import type { Project } from "../types/api"
import { toast } from "sonner"

export function useProjectData() {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isOnline, setIsOnline] = useState(true)

  const loadProjects = async () => {
    setIsLoading(true)
    try {
      const data = await api.getProjects()
      setProjects(data)
      setIsOnline(true)
      return data
    } catch (err: unknown) {
      setIsOnline(false)
      console.error(err)
      toast.error("載入專案失敗")
      return []
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateProject = async (name: string) => {
    if (!name.trim()) return null
    try {
      const newProj = await api.createProject(name.trim())
      setProjects((prev) => [...prev, newProj])
      toast.success("專案建立成功！")
      return newProj
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      toast.error("建立專案失敗：" + msg)
      return null
    }
  }

  const handleUpdateProject = async (projectId: string, name: string, description?: string) => {
    if (!name.trim()) return null
    try {
      const updatedProj = await api.updateProject(projectId, name.trim(), description?.trim())
      setProjects((prev) => prev.map((p) => p.id === projectId ? updatedProj : p))
      toast.success("專案更新成功！")
      return updatedProj
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      toast.error("更新專案失敗：" + msg)
      return null
    }
  }

  const handleDeleteProject = async (projectId: string) => {
    try {
      await api.deleteProject(projectId)
      setProjects((prev) => prev.filter((p) => p.id !== projectId))
      toast.success("專案刪除成功！")
      return true
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      toast.error("刪除專案失敗：" + msg)
      return false
    }
  }

  useEffect(() => {
    let active = true
    Promise.resolve().then(() => {
      if (active) {
        loadProjects()
      }
    })
    return () => {
      active = false
    }
  }, [])

  return {
    projects,
    isLoading,
    isOnline,
    setIsOnline,
    loadProjects,
    handleCreateProject,
    handleUpdateProject,
    handleDeleteProject
  }
}
