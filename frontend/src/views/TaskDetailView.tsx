import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, useOutletContext } from "react-router-dom";
import { useProjectData } from "../hooks/useProjectData";
import { api } from "../lib/api";
import type { Task } from "../types/api";
import { Loader2, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "../components/custom/StatusBadge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

interface BreadcrumbItemType {
  label: string;
  to?: string;
}

interface OutletContextType {
  setBreadcrumbs: (crumbs: BreadcrumbItemType[]) => void;
}

export default function TaskDetailView() {
  const { projectId, taskId } = useParams();
  const navigate = useNavigate();

  const [task, setTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 專案與全域麵包屑
  const { projects } = useProjectData();
  const activeProject = projects.find((p) => p.id === projectId);
  const { setBreadcrumbs } = useOutletContext<OutletContextType>();

  useEffect(() => {
    const projectName = activeProject ? activeProject.name : "載入中...";
    const taskShortId = taskId ? `#${taskId.substring(0, 8)}` : "載入中...";
    Promise.resolve().then(() => {
      setBreadcrumbs([
        { label: "專案列表", to: "/project" },
        { label: projectName, to: `/project/${projectId}` },
        { label: `批次任務 ${taskShortId}` },
      ]);
    });
    return () => {
      Promise.resolve().then(() => {
        setBreadcrumbs([]);
      });
    };
  }, [projectId, activeProject, taskId, setBreadcrumbs]);

  // 載入 Task 詳情
  const loadTaskData = useCallback(async () => {
    if (!taskId) return;
    try {
      const data = await api.getTask(taskId);
      setTask(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error("載入批次任務失敗：" + msg);
    } finally {
      setIsLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    Promise.resolve().then(() => {
      loadTaskData();
    });
  }, [loadTaskData]);

  const taskStatus = task?.status;

  // 訂閱 SSE Stream
  useEffect(() => {
    if (
      !taskId ||
      !taskStatus ||
      ["passed", "failed", "error"].includes(taskStatus)
    )
      return;

    const streamUrl = api.getTaskStreamUrl(taskId);
    const eventSource = new EventSource(streamUrl);

    eventSource.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        // 伺服器通知的 payload 為 { taskId, event, doneCount, totalCount, finalResult, status }
        if (payload.taskId === taskId) {
          setTask((prev) => {
            if (!prev) return null;

            const updated: Task = {
              ...prev,
              doneCount: payload.doneCount ?? prev.doneCount,
              totalCount: payload.totalCount ?? prev.totalCount,
              status: payload.status ?? prev.status,
            };
            return updated;
          });

          if (payload.event === "completed") {
            toast.success("所有批次測試案例執行完畢！");
            loadTaskData(); // 重新獲取最新的 runs 狀態
            eventSource.close();
          } else {
            // progress 事件時也順便拉一次 runs 的最新狀態以即時更新卡片狀態
            loadTaskData();
          }
        }
      } catch (err) {
        console.error("解析 SSE 進度錯誤：", err);
      }
    };

    eventSource.onerror = () => {
      console.warn("Task SSE 連線中斷，正在關閉。");
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [taskId, taskStatus, loadTaskData]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-zinc-950 text-zinc-400">
        <div className="flex flex-col items-center gap-2">
          <Loader2 size={24} className="animate-spin text-zinc-500" />
          <span className="text-xs italic">載入批次任務中...</span>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-zinc-950 text-zinc-400 gap-4">
        <p className="text-sm">找不到指定的批次任務資料</p>
        <Button onClick={() => navigate(`/project/${projectId}`)}>
          返回專案
        </Button>
      </div>
    );
  }

  // 進度百分比計算
  const progressPercent =
    task.totalCount > 0
      ? Math.round((task.doneCount / task.totalCount) * 100)
      : 0;

  const getScopeLabel = () => {
    switch (task.scope) {
      case "project":
        return "專案批次";
      case "group":
        return "群組批次";
      case "testcase":
        return "單一測試";
      default:
        return "未知";
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-zinc-950 text-foreground select-none animate-fadeIn">
      {/* 頂部 Header */}
      <div className="px-8 py-6 flex items-center justify-between flex-shrink-0 border-b border-zinc-900/45 bg-zinc-950">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest bg-zinc-900 border border-zinc-850 px-2 py-0.5 rounded">
              {getScopeLabel()}
            </span>
            <h2 className="text-xl font-bold tracking-tight text-zinc-100">
              批次任務詳情
            </h2>
          </div>
          <p className="text-xs font-mono text-zinc-500 mt-1">
            UUID: {task.id}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={task.status} />
          <Button
            variant="outline"
            onClick={() => navigate(`/project/${projectId}`)}
            className="border-zinc-800 text-zinc-300 hover:bg-zinc-900 hover:text-zinc-100 text-xs"
          >
            返回專案詳情
          </Button>
        </div>
      </div>

      <div className="flex-1 bg-zinc-950/40">
        <div className="p-8 flex flex-col gap-6 max-w-6xl mx-auto w-full">
          {/* Bento Panel: 進度條與狀態 */}
          <div className="bg-zinc-900/30 backdrop-blur-md border border-zinc-850 rounded-2xl p-6 shadow-xl flex flex-col gap-4">
            <div className="flex justify-between items-end">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                  測試執行進度 (Total: {task.totalCount})
                </span>
                <h3 className="text-2xl font-black font-mono text-zinc-200">
                  {task.doneCount} / {task.totalCount}{" "}
                  <span className="text-xs font-normal text-zinc-500">
                    案例已完成
                  </span>
                </h3>
              </div>
              <span className="text-3xl font-black font-mono text-zinc-200">
                {progressPercent}%
              </span>
            </div>

            <Progress
              value={progressPercent}
              className="h-2.5 bg-zinc-950 border border-zinc-900"
            />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2 border-t border-zinc-850/50 pt-4 text-xs font-medium text-zinc-400">
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                  觸發範圍
                </span>
                <span className="text-zinc-300 font-bold">
                  {getScopeLabel()}
                </span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                  啟動時間
                </span>
                <span className="text-zinc-300 font-mono">
                  {new Date(task.createdAt).toLocaleString()}
                </span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                  完成時間
                </span>
                <span className="text-zinc-300 font-mono">
                  {task.finishedAt
                    ? new Date(task.finishedAt).toLocaleString()
                    : "-"}
                </span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                  執行狀態
                </span>
                <span className="text-zinc-300 font-bold uppercase">
                  {task.status}
                </span>
              </div>
            </div>
          </div>

          {/* TestRuns Grid */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              此任務包含之測試案例列表
            </h4>

            {!task.runs || task.runs.length === 0 ? (
              <div className="text-center py-12 text-xs text-zinc-500 italic border border-dashed border-zinc-850 rounded-2xl">
                無關聯之執行紀錄。
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {task.runs.map((run) => (
                  <div
                    key={run.runId}
                    onClick={() =>
                      navigate(`/project/${projectId}/run/${run.runId}`)
                    }
                    className="group cursor-pointer bg-zinc-900/20 hover:bg-zinc-900/40 border border-zinc-850/70 hover:border-zinc-800 rounded-2xl p-5 shadow transition-all flex flex-col justify-between h-32"
                  >
                    <div className="flex flex-col gap-1.5">
                      <div className="flex justify-between items-start gap-2">
                        <span className="font-bold text-sm text-zinc-200 group-hover:text-primary transition-colors line-clamp-1">
                          {run.testcaseName}
                        </span>
                        <StatusBadge status={run.status} />
                      </div>
                      <span className="text-[10px] font-mono text-zinc-500">
                        Run ID: #{run.runId.substring(0, 8)}
                      </span>
                    </div>

                    <div className="flex justify-end items-center border-t border-zinc-900/50 pt-2 text-[10px] font-bold text-zinc-500 group-hover:text-zinc-300 uppercase tracking-wider transition-colors">
                      <span>查看即時日誌</span>
                      <ChevronRight
                        size={10}
                        className="ml-0.5 group-hover:translate-x-0.5 transition-transform"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
