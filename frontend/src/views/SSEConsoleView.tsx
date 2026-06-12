import { useEffect, useRef, useState } from "react"
import { useParams, useNavigate, useOutletContext } from "react-router-dom"
import { ChevronLeft, Loader2, CheckCircle2, XCircle, Image as ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useSSEStream } from "../hooks/useSSEStream"
import { useProjectData } from "../hooks/useProjectData"
import type { Testcase } from "../types/api"
import { api } from "../lib/api"

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
    runStatus,
    selectedLogId,
    setSelectedLogId,
    imgLoaded,
    setImgLoaded
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

  // 當前選取步驟的詳情
  const activeLog = runLogs.find(l => l.id === selectedLogId);

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

      {/* Console 左右分欄 */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        
        {/* 左側日誌時間軸 (2/5 寬度) */}
        <div className="w-[40%] border-r flex flex-col bg-zinc-950/20 min-w-[320px]">
          <div className="p-4 border-b flex items-center justify-between bg-card/20">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              AI 步驟追蹤時間軸
            </span>
            <span className="text-[10px] text-muted-foreground font-mono">
              步驟數: {runLogs.length}
            </span>
          </div>

          <ScrollArea className="flex-1 p-4">
            <div className="flex flex-col gap-4">
              {runLogs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-2">
                  <Loader2 className="animate-spin text-primary" size={24} />
                  <span className="text-xs italic">正在等待 Agent 開始執行步驟...</span>
                </div>
              ) : (
                runLogs.map((log, index) => {
                  const isSelected = selectedLogId === log.id
                  return (
                    <div
                      key={log.id}
                      onClick={() => {
                        setSelectedLogId(log.id)
                        setImgLoaded(false)
                      }}
                      className={`flex gap-3 cursor-pointer p-3 rounded-lg border transition-all duration-150 ${
                        isSelected
                          ? "bg-accent border-primary text-foreground"
                          : "bg-card/40 border-border text-muted-foreground hover:border-zinc-700 hover:text-foreground"
                      }`}
                    >
                      {/* 節點狀態點與線 */}
                      <div className="flex flex-col items-center">
                        <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                        }`}>
                          {log.stepIdx + 1}
                        </div>
                        {index < runLogs.length - 1 && (
                          <div className="w-0.5 flex-1 bg-border mt-2" />
                        )}
                      </div>

                      {/* 步驟資訊 */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold truncate">
                          {log.stepDescription}
                        </h4>
                        <p className="text-[10px] font-mono text-primary mt-1 truncate">
                          {log.action}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-1 line-clamp-2">
                          {log.result}
                        </p>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
            <div ref={timelineEndRef} />
          </ScrollArea>
        </div>

        {/* 右側監控視圖 (3/5 寬度) */}
        <ScrollArea className="flex-1 bg-zinc-950/10">
          <div className="flex flex-col p-6 gap-6">
            
            {/* 瀏覽器畫面監控 */}
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <ImageIcon size={14} className="text-primary" />
                  瀏覽器監控畫面 (Live Screen)
                </h3>
                {activeLog && (
                  <span className="text-[10px] text-muted-foreground">
                    步驟 {activeLog.stepIdx + 1} 畫面
                  </span>
                )}
              </div>

              <div className="relative border rounded-xl bg-zinc-950 overflow-hidden shadow-md aspect-video flex items-center justify-center group">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]" />

                {activeLog ? (
                  <img
                    src={activeLog.screenshotUrl}
                    alt="E2E Screenshot"
                    onLoad={() => setImgLoaded(true)}
                    className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-300 ${
                      imgLoaded ? "opacity-100" : "opacity-0"
                    }`}
                  />
                ) : runStatus?.status === "failed" && runStatus.screenshotFailUrl ? (
                  <img
                    src={runStatus.screenshotFailUrl}
                    alt="E2E Failure Screenshot"
                    className="absolute inset-0 w-full h-full object-contain"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2.5 text-muted-foreground relative z-10">
                    <Loader2 size={32} className="animate-spin text-primary/80" />
                    <span className="text-xs italic">正在擷取 AI 執行畫面...</span>
                  </div>
                )}

                {!imgLoaded && activeLog && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <Loader2 size={24} className="animate-spin text-primary" />
                  </div>
                )}
              </div>
            </div>

            {/* 步驟執行詳情 / 視覺斷言報告 */}
            {activeLog && (
              <div className="bg-card border rounded-xl p-5 flex flex-col gap-4">
                <h4 className="text-sm font-bold text-foreground border-b pb-2">
                  步驟詳細日誌說明
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-muted-foreground font-medium">步驟描述：</span>
                    <p className="text-foreground mt-1">{activeLog.stepDescription}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground font-medium">執行動作：</span>
                    <p className="text-primary font-mono mt-1">{activeLog.action}</p>
                  </div>
                  <div className="md:col-span-2">
                    <span className="text-muted-foreground font-medium">工具執行結果：</span>
                    <p className="text-foreground mt-1 bg-zinc-950 p-2.5 rounded font-mono border overflow-x-auto whitespace-pre-wrap">
                      {activeLog.result}
                    </p>
                  </div>
                  {activeLog.aiResponse && (
                    <div className="md:col-span-2">
                      <span className="text-muted-foreground font-medium">AI 決策推理：</span>
                      <p className="text-muted-foreground mt-1 italic">{activeLog.aiResponse}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 最終視覺斷言結論 */}
            {runStatus?.finalResult && (
              <div className={`border rounded-xl p-5 flex flex-col gap-3.5 shadow-md ${
                runStatus.finalResult === "PASS"
                  ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-400"
                  : "bg-destructive/10 border-destructive/30 text-destructive-foreground"
              }`}>
                <div className="flex items-center gap-2">
                  {runStatus.finalResult === "PASS" ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
                  <h4 className="text-sm font-bold">
                    最終審查報告 ({runStatus.finalResult})
                  </h4>
                </div>
                <p className="text-xs leading-relaxed whitespace-pre-wrap">
                  {runStatus.finalReason}
                </p>
              </div>
            )}

          </div>
        </ScrollArea>

      </div>
    </div>
  )
}
