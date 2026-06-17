import { useState, useEffect } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { api } from "../lib/api";
import type { Task, Project } from "../types/api";
import { Clock, Loader2, Filter } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { DataTable } from "../components/custom/table/DataTable";
import { columns } from "../table-columns/History";

interface BreadcrumbItemType {
  label: string;
  to?: string;
}

interface OutletContextType {
  setBreadcrumbs: (crumbs: BreadcrumbItemType[]) => void;
}

export default function HistoryView() {
  const navigate = useNavigate();
  const { setBreadcrumbs } = useOutletContext<OutletContextType>();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 篩選狀態
  const [selectedProjectId, setSelectedProjectId] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  // 設定麵包屑
  useEffect(() => {
    Promise.resolve().then(() => {
      setBreadcrumbs([{ label: "執行紀錄" }]);
    });
    return () => {
      Promise.resolve().then(() => {
        setBreadcrumbs([]);
      });
    };
  }, [setBreadcrumbs]);

  // 載入資料
  useEffect(() => {
    const loadData = async () => {
      try {
        const [tasksData, projectsData] = await Promise.all([
          api.getAllTasks(),
          api.getProjects(),
        ]);
        setTasks(tasksData);
        setProjects(projectsData);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        toast.error("載入歷史紀錄失敗：" + msg);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-zinc-950 text-zinc-400">
        <div className="flex flex-col items-center gap-2">
          <Loader2 size={24} className="animate-spin text-zinc-500" />
          <span className="text-xs italic">載入執行歷史紀錄中...</span>
        </div>
      </div>
    );
  }

  // 前端過濾
  const filteredTasks = tasks.filter((t) => {
    const matchProject =
      selectedProjectId === "all" || t.projectId === selectedProjectId;

    let matchStatus = true;
    if (selectedStatus === "done-pass") {
      matchStatus = t.status === "done" && t.finalResult === "PASS";
    } else if (selectedStatus === "done-fail") {
      matchStatus = t.status === "done" && t.finalResult === "FAIL";
    } else if (selectedStatus === "running") {
      matchStatus = t.status === "running" || t.status === "pending";
    }

    return matchProject && matchStatus;
  });

  return (
    <div className="flex-1 flex flex-col bg-zinc-950 text-foreground overflow-y-auto select-none p-8 animate-fadeIn">
      {/* 頂部 Header */}
      <div className="max-w-6xl w-full mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-10">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-zinc-100 via-zinc-300 to-zinc-500 bg-clip-text text-transparent flex items-center gap-2">
            <Clock size={24} className="text-zinc-400" />
            執行紀錄
          </h2>
          <p className="text-zinc-400 text-sm mt-1.5 leading-relaxed">
            監控所有專案的批次測試執行歷史，並追蹤其即時狀態與測試覆蓋進度。
          </p>
        </div>
      </div>

      {/* 篩選控制項 */}
      <div className="max-w-6xl w-full mx-auto flex flex-wrap items-center gap-4 mb-6 bg-zinc-900/10 border border-zinc-850/40 p-4 rounded-xl backdrop-blur-sm">
        <div className="flex items-center gap-2 text-zinc-400 text-xs font-bold uppercase tracking-wider">
          <Filter size={12} />
          <span>篩選條件</span>
        </div>

        {/* 專案篩選 */}
        <div className="w-56">
          <Select
            value={selectedProjectId}
            onValueChange={setSelectedProjectId}
          >
            <SelectTrigger className="bg-zinc-950 border-zinc-850 text-zinc-300 h-9 text-xs">
              <SelectValue placeholder="所有專案" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-850 text-zinc-300">
              <SelectItem value="all">所有專案</SelectItem>
              {projects.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 狀態篩選 */}
        <div className="w-44">
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="bg-zinc-950 border-zinc-850 text-zinc-300 h-9 text-xs">
              <SelectValue placeholder="所有狀態" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-850 text-zinc-300">
              <SelectItem value="all">所有狀態</SelectItem>
              <SelectItem value="done-pass">成功 (PASS)</SelectItem>
              <SelectItem value="done-fail">失敗 (FAIL)</SelectItem>
              <SelectItem value="running">執行中</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 歷史任務表格 */}
      <div className="max-w-6xl w-full mx-auto flex-1 flex flex-col">
        <DataTable
          columns={columns}
          data={filteredTasks}
          onRowDbClick={(row) =>
            navigate(`/project/${row.projectId || "unknown"}/tasks/${row.id}`)
          }
          showSearch={false}
        />
      </div>
    </div>
  );
}
