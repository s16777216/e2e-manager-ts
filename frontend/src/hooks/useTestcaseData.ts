import { useState, useEffect } from "react"
import { api } from "../lib/api"
import type { Testcase } from "../types/api"
import { toast } from "sonner"

export function useTestcaseData(groupId: string | undefined) {
  const [testcases, setTestcases] = useState<Testcase[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const loadTestcases = async (gId: string) => {
    setIsLoading(true)
    try {
      const data = await api.getTestcases(gId)
      setTestcases(data)
    } catch (err) {
      console.error(err)
      toast.error("載入測試劇本失敗")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveTestcase = async (
    testcaseId: string | null,
    name: string,
    steps: string[],
    expected: string
  ) => {
    if (!groupId) return null
    if (!name.trim() || steps.some(s => !s.trim()) || !expected.trim()) {
      toast.error("請填寫所有必填欄位，且步驟不可為空！")
      return null
    }

    try {
      let result: Testcase
      if (testcaseId) {
        result = await api.updateTestcase(testcaseId, {
          name: name.trim(),
          steps: steps.map(s => s.trim()),
          expected: expected.trim()
        })
        toast.success("測試劇本修改成功！")
      } else {
        result = await api.createTestcase(groupId, {
          name: name.trim(),
          steps: steps.map(s => s.trim()),
          expected: expected.trim()
        })
        toast.success("測試劇本建立成功！")
      }
      await loadTestcases(groupId)
      return result
    } catch (err: any) {
      toast.error("儲存測試案例失敗：" + err.message)
      return null
    }
  }

  const handleDeleteTestcase = async (testcaseId: string) => {
    if (!confirm("確定要刪除此測試案例嗎？")) return false
    try {
      await api.deleteTestcase(testcaseId)
      if (groupId) {
        await loadTestcases(groupId)
      }
      toast.success("測試劇本刪除成功！")
      return true
    } catch (err) {
      toast.error("刪除測試案例失敗：" + err)
      return false
    }
  }

  useEffect(() => {
    if (groupId) {
      loadTestcases(groupId)
    } else {
      setTestcases([])
    }
  }, [groupId])

  return {
    testcases,
    isLoading,
    loadTestcases,
    handleSaveTestcase,
    handleDeleteTestcase
  }
}
