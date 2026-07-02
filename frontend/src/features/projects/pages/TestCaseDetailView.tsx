import React, { useState, useCallback } from "react";
import {
  useParams,
  useNavigate,
  useLoaderData,
  useRouteLoaderData,
} from "react-router-dom";
import { api } from "@/lib/api";
import type { Testcase, TestRun, Project, VariableItem } from "@/types/api";
import { Play, Edit, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/custom/StatusBadge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/custom/table/DataTable";
import { DataTableColumnHeader } from "@/components/custom/table/ColumnHeader";
import TestCaseEditBlock from "../components/TestCaseEditBlock";
import TestCaseDeleteDialog from "../components/TestCaseDeleteDialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function TestCaseDetailView() {
  const { projectId, testCaseId } = useParams();
  const navigate = useNavigate();

  const activeProject = useRouteLoaderData("project-root") as Project | null;
  const testcaseData = useLoaderData() as Testcase | null;
  const loaderData = { project: activeProject, testcase: testcaseData };

  // 測試案例狀態，初始值使用 loader 載入的 testcase
  const [testcase, setTestcase] = useState<Testcase | null>(
    loaderData?.testcase ?? null,
  );
  const [isLoading, setIsLoading] = useState(!loaderData?.testcase);

  // 編輯模式與儲存狀態
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // 執行測試狀態
  const [isTriggering, setIsTriggering] = useState(false);

  // 當前 Active Tab: "steps" | "history"
  const [activeTab, setActiveTab] = useState<"steps" | "history">("steps");

  // 刪除相關狀態
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteTestCase = async () => {
    if (!testcase || isDeleting) return;
    setIsDeleting(true);
    try {
      await api.deleteTestcase(testcase.id);
      toast.success("測試案例刪除成功！");
      setIsDeleteDialogOpen(false);
      navigate(`/project/${projectId}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error("刪除測試案例失敗：" + msg);
    } finally {
      setIsDeleting(false);
    }
  };

  // 當 testCaseId 變更時，在 render 階段重設編輯模式與分頁狀態，避免 useEffect 中同步 setState 造成 cascading renders
  const [prevTestCaseId, setPrevTestCaseId] = useState(testCaseId);
  if (testCaseId !== prevTestCaseId) {
    setPrevTestCaseId(testCaseId);
    setIsEditing(false);
    setActiveTab("steps");
    setIsLoading(!loaderData?.testcase);
    setTestcase(loaderData?.testcase ?? null);
  }

  // 載入測試案例詳情與執行紀錄 (只在編輯保存後重載)
  const loadTestCaseData = useCallback(async () => {
    if (!testCaseId) return;
    try {
      const data = await api.getTestcaseDetail(testCaseId);
      setTestcase(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error("載入測試案例失敗：" + msg);
    } finally {
      setIsLoading(false);
    }
  }, [testCaseId, setTestcase]);

  // 儲存修改
  const handleSaveEdit = async (data: {
    name: string;
    steps: Array<{ action: string; expected?: string; hasExpected: boolean }>;
    expected: string;
    initCookies: unknown;
    initLocalStorage: unknown;
    variables: Record<string, VariableItem>;
  }) => {
    if (!testCaseId) return;
    setIsSaving(true);
    try {
      await api.updateTestcase(testCaseId, data);
      toast.success("測試案例修改成功！");
      setIsEditing(false);
      await loadTestCaseData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error("修改測試案例失敗：" + msg);
    } finally {
      setIsSaving(false);
    }
  };

  // 執行測試
  const handleRunTestCase = async () => {
    if (!testCaseId) return;
    setIsTriggering(true);
    try {
      const res = await api.triggerRun(testCaseId);
      toast.success("測試任務已啟動！正在轉跳監控頁面...");
      // 跳轉到 SSE 即時監控頁面
      navigate(`/project/${projectId}/tasks/${res.taskId}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error("執行測試失敗：" + msg);
    } finally {
      setIsTriggering(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-zinc-950 text-zinc-400">
        <div className="flex flex-col items-center gap-2">
          <LoaderCircle size={24} className="animate-spin text-zinc-500" />
          <span className="text-xs italic">載入測試案例詳情中...</span>
        </div>
      </div>
    );
  }

  if (!testcase) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-zinc-950 text-zinc-400 gap-4">
        <p className="text-sm">找不到指定的測試案例資料</p>
        <Button onClick={() => navigate(`/project/${projectId}`)}>
          返回專案
        </Button>
      </div>
    );
  }

  // 將執行紀錄排序，最新的排在前面
  const sortedRuns = testcase.runs
    ? [...testcase.runs].sort((a, b) => {
        return (
          new Date(b.createdAt || 0).getTime() -
          new Date(a.createdAt || 0).getTime()
        );
      })
    : [];

  const runColumns: ColumnDef<TestRun>[] = [
    {
      accessorKey: "id",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="執行編號" />
      ),
      cell: ({ row }) => (
        <span className="font-mono text-zinc-200 group-hover:text-primary transition-colors">
          #{row.original.id.substring(0, 8)}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="狀態" />
      ),
      cell: ({ row }) => {
        const status = row.original.status;
        return <StatusBadge status={status} />;
      },
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="啟動時間" />
      ),
      cell: ({ row }) => (
        <span className="text-zinc-400 text-xs font-mono">
          {row.original.createdAt
            ? new Date(row.original.createdAt).toLocaleString()
            : "-"}
        </span>
      ),
    },
    {
      accessorKey: "duration",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="執行耗時" />
      ),
      cell: ({ row }) => {
        let duration = "-";
        if (row.original.createdAt && row.original.finishedAt) {
          const start = new Date(row.original.createdAt).getTime();
          const end = new Date(row.original.finishedAt).getTime();
          if (!isNaN(start) && !isNaN(end)) {
            const diff = end - start;
            duration = diff < 0 ? "0s" : `${Math.round(diff / 1000)}s`;
          }
        }
        return (
          <span className="text-zinc-400 text-xs font-mono">{duration}</span>
        );
      },
    },
    {
      accessorKey: "finalReason",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="最終審查結論" />
      ),
      cell: ({ row }) => {
        const reasonShort = row.original.finalReason
          ? row.original.finalReason.length <= 25
            ? row.original.finalReason
            : `${row.original.finalReason.substring(0, 25)}...`
          : "無";
        return (
          <span
            className="text-zinc-400 text-xs truncate max-w-xs block"
            title={row.original.finalReason || ""}
          >
            {reasonShort}
          </span>
        );
      },
    },
  ];

  return (
    <div className="flex-1 flex flex-col select-none">
      {/* 頂部控制列 - 頁面內部控制工具欄 */}
      <div className="px-8 py-6 flex items-center justify-between flex-shrink-0 animate-fadeIn gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-zinc-100">
            {isEditing ? "編輯測試案例" : testcase.name}
          </h2>
          <p className="text-xs font-mono text-zinc-500 mt-1">
            ID: {testcase.id}
          </p>
        </div>

        {/* 右側操作按鈕 */}
        <div className="flex items-center gap-2">
          {!isEditing && (
            <>
              <Button
                variant="outline"
                onClick={() => setIsEditing(true)}
                className="border-zinc-800 hover:bg-zinc-900 hover:text-zinc-100 text-zinc-300 gap-1.5"
              >
                <Edit size={14} /> 編輯測試案例
              </Button>
              <Button
                onClick={handleRunTestCase}
                disabled={
                  isTriggering || !testcase.steps || testcase.steps.length === 0
                }
                title={
                  !testcase.steps || testcase.steps.length === 0
                    ? "請先新增至少一個測試步驟才能執行"
                    : undefined
                }
                className="bg-emerald-600 text-white hover:bg-emerald-500 font-semibold gap-1.5 shadow-lg shadow-emerald-600/10 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isTriggering ? (
                  <LoaderCircle size={14} className="animate-spin" />
                ) : (
                  <Play size={14} fill="white" />
                )}
                執行測試
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Tabs 控制按鈕 (Bento Style) */}
      <Tabs
        value={activeTab}
        onValueChange={(val) => setActiveTab(val as "steps" | "history")}
        className="flex-1 flex flex-col overflow-hidden"
      >
        <div className="px-8 pt-4 border-b border-zinc-900/50 bg-zinc-950">
          <TabsList variant="line">
            <TabsTrigger
              value="steps"
              disabled={isEditing}
              className="px-4 py-2.5 font-bold text-xs"
            >
              測試步驟
            </TabsTrigger>
            <TabsTrigger
              value="history"
              disabled={isEditing}
              className="px-4 py-2.5 font-bold text-xs"
            >
              執行歷史 ({sortedRuns.length})
            </TabsTrigger>
          </TabsList>
        </div>

        {/* 主要內容區 (ScrollArea 包裹) */}
        <ScrollArea className="flex-1 bg-zinc-950/40">
          <div className="p-8 w-full h-max">
            <TabsContent value="steps" className="mt-0 outline-none">
              {/* Steps Tab */}
              <div className="flex flex-col gap-6">
                {/* 編輯模式表單 */}
                {isEditing ? (
                  <TestCaseEditBlock
                    testcase={testcase}
                    isSaving={isSaving}
                    onSave={handleSaveEdit}
                    onCancel={() => setIsEditing(false)}
                    onDeleteClick={() => setIsDeleteDialogOpen(true)}
                  />
                ) : (
                  // 唯讀檢視模式
                  <div className="flex flex-col gap-6">
                    {/* 測試步驟 Card */}
                    <div className="bg-zinc-900/20 border border-zinc-850 rounded-2xl p-6 shadow-md flex flex-col gap-4">
                      <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                        步驟詳情 (Steps)
                      </h4>
                      <div className="flex flex-col gap-3">
                        {testcase.steps.length === 0 && (
                          <div className="flex flex-col items-center justify-center py-8 gap-3 text-zinc-600">
                            <Play size={28} className="opacity-30" />
                            <p className="text-sm">尚未新增任何步驟</p>
                            <button
                              onClick={() => setIsEditing(true)}
                              className="text-xs text-zinc-400 hover:text-zinc-200 underline underline-offset-2 transition-colors"
                            >
                              點擊「編輯測試案例」來新增步驟
                            </button>
                          </div>
                        )}
                        {testcase.steps.map((step, idx) => (
                          <div
                            key={idx}
                            className="flex flex-col gap-1.5 p-3 bg-zinc-900/10 border border-zinc-900 rounded-xl animate-fadeIn"
                          >
                            <div className="flex items-start gap-3">
                              <span className="h-6 w-6 bg-zinc-900 border border-zinc-800 rounded-full flex items-center justify-center text-[10px] font-bold text-zinc-300 font-mono mt-0.5 flex-shrink-0">
                                {idx + 1}
                              </span>
                              <div className="flex-1">
                                <p className="text-sm text-zinc-200 font-medium">
                                  {step.action}
                                </p>
                                {step.expected && (
                                  <p className="text-xs text-zinc-500 mt-1 italic">
                                    預期結果:{" "}
                                    <span className="text-zinc-400 not-italic">
                                      {step.expected}
                                    </span>
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 預期結果 Card */}
                    <div className="bg-zinc-900/20 border border-zinc-850 rounded-2xl p-6 shadow-md flex flex-col gap-3">
                      <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                        預期結果 (Expected)
                      </h4>
                      <p className="text-sm text-zinc-300 leading-relaxed bg-zinc-950/40 p-4 rounded-xl border border-zinc-900 font-medium">
                        {testcase.expected}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="history" className="mt-0 outline-none">
              {/* History Tab */}
              <div className="flex flex-col gap-4">
                <DataTable
                  columns={runColumns}
                  data={sortedRuns}
                  onRowDbClick={(row) =>
                    navigate(`/project/${projectId}/run/${row.id}`)
                  }
                  showSearch={false}
                />
              </div>
            </TabsContent>
          </div>
        </ScrollArea>
      </Tabs>

      <TestCaseDeleteDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        testcaseName={testcase.name}
        isDeleting={isDeleting}
        onConfirm={handleDeleteTestCase}
      />
    </div>
  );
}
