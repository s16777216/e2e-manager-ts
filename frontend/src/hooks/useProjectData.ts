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
    handleCreateProject
  }
}
