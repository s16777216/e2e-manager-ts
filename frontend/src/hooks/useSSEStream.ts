import { useState, useEffect, useRef } from "react"
import { api } from "../lib/api"
import type { TestLog, TestRun } from "../types/api"
import { toast } from "sonner"

export function useSSEStream(runId: string | undefined) {
  const [runLogs, setRunLogs] = useState<TestLog[]>([])
  const [runStatus, setRunStatus] = useState<TestRun | null>(null)
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null)
  const [imgLoaded, setImgLoaded] = useState(true)
  const eventSourceRef = useRef<EventSource | null>(null)

  const triggerRun = async (testcaseId: string) => {
    try {
      setRunLogs([])
      setSelectedLogId(null)
      setRunStatus(null)

      const res = await api.triggerRun(testcaseId)
      setRunStatus({
        id: res.runId,
        status: "pending",
        logs: []
      })
      toast.success("測試已啟動，正在載入執行環境...")
      return res.runId
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      toast.error("啟動測試失敗：" + msg)
      return null
    }
  }

  const subscribeToSSE = (rId: string) => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
    }

    const streamUrl = api.getStreamUrl(rId)
    const eventSource = new EventSource(streamUrl)
    eventSourceRef.current = eventSource

    eventSource.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data)
        if (payload.runId !== rId) return

        if (payload.event === "queued") {
          setRunStatus(prev => prev ? { ...prev, status: "pending" } : {
            id: rId,
            status: "pending",
            logs: []
          })
        } else if (payload.event === "log") {
          const newLog: TestLog = {
            id: payload.logId,
            stepIdx: payload.stepIdx,
            stepDescription: payload.stepDescription,
            action: payload.action,
            result: payload.result,
            aiResponse: payload.aiResponse,
            screenshotUrl: `/api/logs/${payload.logId}/screenshot`,
            timestamp: payload.timestamp
          }
          setRunLogs(prev => {
            const exists = prev.some(l => l.id === newLog.id)
            if (exists) return prev
            const nextLogs = [...prev, newLog]
            setSelectedLogId(newLog.id)
            setImgLoaded(false)
            return nextLogs
          })
          setRunStatus(prev => prev ? { ...prev, status: "running" } : {
            id: rId,
            status: "running",
            logs: []
          })
        } else if (payload.event === "completed") {
          setRunStatus(prev => prev ? {
            ...prev,
            status: payload.status,
            finalResult: payload.finalResult,
            finalReason: payload.finalReason,
            screenshotFailUrl: payload.status !== "passed" ? `/api/runs/${rId}/screenshots/fail` : undefined
          } : {
            id: rId,
            status: payload.status,
            finalResult: payload.finalResult,
            finalReason: payload.finalReason,
            screenshotFailUrl: payload.status !== "passed" ? `/api/runs/${rId}/screenshots/fail` : undefined,
            logs: []
          })
          eventSource.close()
          eventSourceRef.current = null
        }
      } catch (err) {
        console.error("[SSE] 解析資料出錯：", err)
      }
    }

    eventSource.onerror = () => {
      console.warn("[SSE] 連線中斷或伺服器關閉。")
      eventSource.close()
    }
  }

  useEffect(() => {
    let active = true

    const initRun = async (rId: string) => {
      Promise.resolve().then(() => {
        if (active) {
          setRunLogs([])
          setRunStatus(null)
          setSelectedLogId(null)
        }
      })

      try {
        const runData = await api.getRunStatus(rId)
        if (!active) return

        if (runData) {
          setRunStatus(runData)
          if (runData.logs && runData.logs.length > 0) {
            const processedLogs = runData.logs.map(log => ({
              ...log,
              screenshotUrl: `/api/logs/${log.id}/screenshot`
            }))
            setRunLogs(processedLogs)
            setSelectedLogId(processedLogs[processedLogs.length - 1].id)
          }

          if (runData.status === "pending" || runData.status === "running") {
            subscribeToSSE(rId)
          }
        } else {
          subscribeToSSE(rId)
        }
      } catch (err) {
        console.error("載入執行歷史失敗，嘗試直接訂閱 SSE：", err)
        if (active) {
          subscribeToSSE(rId)
        }
      }
    }

    if (runId) {
      initRun(runId)
    } else {
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
        eventSourceRef.current = null
      }
      Promise.resolve().then(() => {
        if (active) {
          setRunLogs([])
          setRunStatus(null)
          setSelectedLogId(null)
        }
      })
    }

    return () => {
      active = false
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
        eventSourceRef.current = null
      }
    }
  }, [runId])

  return {
    runLogs,
    runStatus,
    selectedLogId,
    setSelectedLogId,
    imgLoaded,
    setImgLoaded,
    triggerRun
  }
}
