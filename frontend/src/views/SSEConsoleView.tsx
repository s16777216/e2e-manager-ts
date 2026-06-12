import { useEffect, useRef, useState } from "react"
import { useParams, useNavigate, useOutletContext } from "react-router-dom"
import { ChevronLeft, Loader2, CheckCircle2, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useSSEStream } from "../hooks/useSSEStream"
import { useProjectData } from "../hooks/useProjectData"
import type { Testcase } from "../types/api"
import { api } from "../lib/api"
import { groupLogsByStep } from "../lib/logUtils"
import { StepAccordion } from "../components/custom/StepAccordion"
import { cn } from "../lib/utils"

interface BreadcrumbItemType {
  label: string
  to?: string
}

interface OutletContextType {
  setBreadcrumbs: (crumbs: BreadcrumbItemType[]) => void
}

export default function SSEConsoleView() {
  const { projectId, runId } = useParams();
  const navigate = useNavigate();

  // SSE 狀態連線
  const {
    runLogs,
    runStatus
  } = useSSEStream(runId);

  const timelineEndRef = useRef<HTMLDivElement | null>(null);

  const [testcase, setTestcase] = useState<Testcase | null>(null);

  useEffect(() => {
    if (!runStatus?.testcaseId) return;
    let active = true;
    api.getTestcaseDetail(runStatus.testcaseId)
      .then((data) => {
        if (active) {
          setTestcase(data);
        }
      })
      .catch((err) => {
        console.error("載入監控測試案例詳情失敗:", err);
      });
    return () => {
      active = false;
    };
  }, [runStatus?.testcaseId]);

  const { projects } = useProjectData();
  const { setBreadcrumbs } = useOutletContext<OutletContextType>();

  const foundProject = projects.find(p => p.id === projectId);

  useEffect(() => {
    const projectName = foundProject ? foundProject.name : "載入中...";
    const tcName = testcase ? testcase.name : "載入中...";
    Promise.resolve().then(() => {
      setBreadcrumbs([
        { label: "專案列表", to: "/project" },
        { label: projectName, to: `/project/${projectId}` },
        { label: tcName, to: runStatus?.testcaseId ? `/project/${projectId}/testCase/${runStatus.testcaseId}` : undefined },
        { label: `執行紀錄 #${runId?.substring(0, 8)}` }
      ]);
    });
    return () => {
      Promise.resolve().then(() => {
        setBreadcrumbs([]);
      });
    };
  }, [projectId, runId, foundProject, testcase, runStatus?.testcaseId, setBreadcrumbs]);

  // 滾動至最新步驟
  useEffect(() => {
    if (timelineEndRef.current) {
      timelineEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [runLogs]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Console 頂部控制列 - 頁面內部控制工具欄 */}
      <div className="px-6 py-5 flex items-center justify-between flex-shrink-0 gap-4 animate-fadeIn">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              if (projectId && runStatus?.testcaseId) {
                navigate(`/project/${projectId}/testCase/${runStatus.testcaseId}`)
              } else {
                navigate(-1)
              }
            }}
            className="text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft size={18} />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-foreground">
                即時監控 Console (SSE)
              </h2>
              {runId && (
                <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded">
                  ID: {runId.substring(0, 8)}...
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">即時追蹤 AI 代理人的 E2E 視覺測試過程</p>
          </div>
        </div>

        {/* 任務狀態大標誌 */}
        <div className="flex items-center gap-2.5">
          {runStatus?.status === "pending" && (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-full text-xs font-medium">
              <Loader2 size={12} className="animate-spin" /> 排隊中 (Pending)
            </div>
          )}
          {runStatus?.status === "running" && (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-primary/10 border border-primary/20 text-primary rounded-full text-xs font-medium">
              <Loader2 size={12} className="animate-spin" /> 執行中 (Running)
            </div>
          )}
          {runStatus?.status === "passed" && (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full text-xs font-medium">
              <CheckCircle2 size={12} /> 成功 (Passed)
            </div>
          )}
          {(runStatus?.status === "failed" || runStatus?.status === "error") && (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-destructive/10 border border-destructive/20 text-destructive rounded-full text-xs font-medium">
              <XCircle size={12} /> 失敗 ({runStatus.status.toUpperCase()})
            </div>
          )}
        </div>
      </div>

      {/* 視覺斷言報告 (當有最終結果時，顯示在上方) */}
      {runStatus?.finalResult && (
        <div className="px-6 pb-4 flex-shrink-0 animate-fadeIn max-w-4xl mx-auto w-full">
          <div className={cn(
            "border rounded-xl p-5 flex flex-col gap-3.5 shadow-md",
            runStatus.finalResult === "PASS"
              ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-400"
              : "bg-rose-950/20 border-rose-500/30 text-rose-400"
          )}>
            <div className="flex items-center gap-2">
              {runStatus.finalResult === "PASS" ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              ) : (
                <XCircle className="w-5 h-5 text-rose-500" />
              )}
              <h4 className="text-sm font-bold">
                結果 ({runStatus.finalResult})
              </h4>
            </div>
            <p className="text-xs leading-relaxed whitespace-pre-wrap">
              {runStatus.finalReason}
            </p>
          </div>
        </div>
      )}

      {/* 主日誌區 (單欄 Bento Style) */}
      <ScrollArea className="flex-1 bg-zinc-950/40">
        <div className="max-w-4xl mx-auto p-6 space-y-6">
          {runLogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 text-muted-foreground gap-3">
              <Loader2 className="animate-spin text-primary" size={32} />
              <span className="text-sm italic">正在等待 Agent 開始執行步驟...</span>
            </div>
          ) : (
            <StepAccordion steps={groupLogsByStep(runLogs)} />
          )}

          {/* 如果任務失敗且有全域失敗截圖，但在步驟中沒顯示出來，可以在此處作為備份展示 */}
          {runStatus?.status === "failed" && runStatus.screenshotFailUrl && (
            <div className="mt-4 bg-zinc-900/20 border border-zinc-800 p-4 rounded-xl space-y-2">
              <h4 className="text-xs font-semibold text-rose-400 flex items-center gap-1.5 uppercase">
                <XCircle className="w-4 h-4 text-rose-500 animate-pulse" />
                任務中斷/失敗截圖
              </h4>
              <div className="relative overflow-hidden rounded-lg border border-rose-900 bg-zinc-950 max-w-2xl">
                <img
                  src={runStatus.screenshotFailUrl}
                  alt="E2E Failure Screenshot"
                  className="w-full h-auto object-contain"
                />
              </div>
            </div>
          )}

          <div ref={timelineEndRef} />
        </div>
      </ScrollArea>
    </div>
  )
}
