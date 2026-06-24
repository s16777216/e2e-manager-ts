import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, useOutletContext } from "react-router-dom";
import { useProjectData } from "../hooks/useProjectData";
import { api } from "../lib/api";
import type { Testcase, TestRun } from "../types/api";
import { JsonEditorAccordion } from "../components/custom/JsonEditorAccordion";
import {
  Play,
  Edit,
  Trash2,
  Plus,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  AlertTriangle,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "../components/custom/StatusBadge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "../components/custom/table/DataTable";
import { DataTableColumnHeader } from "../components/custom/table/ColumnHeader";
import { BaseDialog } from "../components/custom/BaseDialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface BreadcrumbItemType {
  label: string;
  to?: string;
}

interface OutletContextType {
  setBreadcrumbs: (crumbs: BreadcrumbItemType[]) => void;
}

export default function TestCaseDetailView() {
  const { projectId, testCaseId } = useParams();
  const navigate = useNavigate();

  // 測試案例狀態
  const [testcase, setTestcase] = useState<Testcase | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 專案與全域麵包屑
  const { projects } = useProjectData();
  const activeProject = projects.find((p) => p.id === projectId);
  const { setBreadcrumbs } = useOutletContext<OutletContextType>();

  useEffect(() => {
    const projectName = activeProject ? activeProject.name : "載入中...";
    const tcNameText = testcase ? testcase.name : "載入中...";
    Promise.resolve().then(() => {
      setBreadcrumbs([
        { label: "專案列表", to: "/project" },
        { label: projectName, to: `/project/${projectId}` },
        { label: tcNameText },
      ]);
    });
    return () => {
      Promise.resolve().then(() => {
        setBreadcrumbs([]);
      });
    };
  }, [projectId, activeProject, testcase, setBreadcrumbs]);

  // 編輯模式狀態
  const [isEditing, setIsEditing] = useState(false);
  const [tcName, setTcName] = useState("");
  const [tcSteps, setTcSteps] = useState<
    Array<{ action: string; expected?: string; hasExpected?: boolean }>
  >([{ action: "", expected: "", hasExpected: false }]);
  const [tcExpected, setTcExpected] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [initCookies, setInitCookies] = useState<unknown>(null);
  const [initLocalStorage, setInitLocalStorage] = useState<unknown>(null);
  const [isJsonValid, setIsJsonValid] = useState(true);

  // 執行測試狀態
  const [isTriggering, setIsTriggering] = useState(false);

  // 當前 Active Tab: "steps" | "history"
  const [activeTab, setActiveTab] = useState<"steps" | "history">("steps");

  // 刪除相關狀態
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [confirmName, setConfirmName] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteTestCase = async () => {
    if (!testcase || confirmName !== testcase.name || isDeleting) return;
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
    setIsLoading(true);
  }

  // 載入測試案例詳情與執行紀錄
  const loadTestCaseData = useCallback(async () => {
    if (!testCaseId) return;
    try {
      const data = await api.getTestcaseDetail(testCaseId);
      setTestcase(data);
      // 同步設定編輯欄位
      setTcName(data.name);
      setTcSteps(
        data.steps.length > 0
          ? data.steps.map((s) => ({
              action: s.action,
              expected: s.expected,
              hasExpected: s.hasExpected,
            }))
          : [{ action: "", expected: "", hasExpected: false }],
      );
      setTcExpected(data.expected);
      setInitCookies(data.initCookies);
      setInitLocalStorage(data.initLocalStorage);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error("載入測試案例失敗：" + msg);
    } finally {
      setIsLoading(false);
    }
  }, [testCaseId]);

  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (active) {
        loadTestCaseData();
      }
    });
    return () => {
      active = false;
    };
  }, [loadTestCaseData]);

  // 步驟表單增減
  const handleAddStepInput = () => {
    setTcSteps([...tcSteps, { action: "", expected: "", hasExpected: false }]);
  };

  const handleRemoveStepInput = (index: number) => {
    if (tcSteps.length === 1) return;
    const newSteps = [...tcSteps];
    newSteps.splice(index, 1);
    setTcSteps(newSteps);
  };

  const handleStepActionChange = (index: number, val: string) => {
    const newSteps = [...tcSteps];
    newSteps[index] = { ...newSteps[index], action: val };
    setTcSteps(newSteps);
  };

  const handleStepExpectedChange = (index: number, val: string) => {
    const newSteps = [...tcSteps];
    newSteps[index] = { ...newSteps[index], expected: val };
    setTcSteps(newSteps);
  };

  // 儲存修改
  const handleSaveEdit = async () => {
    if (!testCaseId) return;
    if (!isJsonValid) return;
    if (
      !tcName.trim() ||
      tcSteps.some((s) => !s.action.trim()) ||
      !tcExpected.trim()
    ) {
      toast.error("請填寫所有必填欄位，且步驟不可為空！");
      return;
    }

    setIsSaving(true);
    try {
      await api.updateTestcase(testCaseId, {
        name: tcName.trim(),
        steps: tcSteps.map((s) => ({
          action: s.action.trim(),
          expected: s.expected?.trim() || "",
          hasExpected: !!s.hasExpected,
        })),
        expected: tcExpected.trim(),
        initCookies,
        initLocalStorage,
      });
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
          <Loader2 size={24} className="animate-spin text-zinc-500" />
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
        return (
          <StatusBadge status={status} />
        );
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
    <div className="flex-1 flex flex-col bg-zinc-950 text-foreground overflow-hidden select-none">
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
                disabled={isTriggering}
                className="bg-emerald-600 text-white hover:bg-emerald-500 font-semibold gap-1.5 shadow-lg shadow-emerald-600/10"
              >
                {isTriggering ? (
                  <Loader2 size={14} className="animate-spin" />
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
      <div className="px-8 pt-4 border-b border-zinc-900/50 bg-zinc-950 flex gap-2">
        <button
          onClick={() => {
            if (!isEditing) {
              setActiveTab("steps");
            }
          }}
          disabled={isEditing}
          className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all border-b-2 ${
            activeTab === "steps"
              ? "border-primary text-zinc-200"
              : "border-transparent text-zinc-500 hover:text-zinc-300 disabled:opacity-50"
          }`}
        >
          測試步驟 (Steps)
        </button>
        <button
          onClick={() => {
            if (!isEditing) {
              setActiveTab("history");
            }
          }}
          disabled={isEditing}
          className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all border-b-2 ${
            activeTab === "history"
              ? "border-primary text-zinc-200"
              : "border-transparent text-zinc-500 hover:text-zinc-300 disabled:opacity-50"
          }`}
        >
          執行歷史 ({sortedRuns.length})
        </button>
      </div>

      {/* 主要內容區 (ScrollArea 包裹) */}
      <ScrollArea className="flex-1 bg-zinc-950/40">
        <div className="p-8 w-full h-max">
          {/* Steps Tab */}
          {activeTab === "steps" && (
            <div className="flex flex-col gap-6">
              {/* 編輯模式表單 */}
              {isEditing ? (
                <div className="bg-zinc-900/30 border border-zinc-850 rounded-2xl p-6 flex flex-col gap-5 shadow-lg">
                  {/* 編輯名稱 */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                      測試案例名稱 <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="text"
                      value={tcName}
                      onChange={(e) => setTcName(e.target.value)}
                      placeholder="修改測試案例名稱"
                      className="bg-zinc-950 border-zinc-800 text-zinc-100"
                    />
                  </div>

                  {/* 編輯自然語言步驟 */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                      測試步驟 <span className="text-red-500">*</span>
                    </label>
                    <div className="flex flex-col gap-3">
                      {tcSteps.map((step, idx) => (
                        <div
                          key={idx}
                          className="flex flex-col gap-2 p-3 bg-zinc-950/60 border border-zinc-850 rounded-xl"
                        >
                          <div className="flex items-center gap-2">
                            <span className="flex items-center justify-center bg-zinc-950 border border-zinc-800 text-[10px] text-zinc-400 rounded h-8 w-8 font-mono flex-shrink-0">
                              {idx + 1}
                            </span>
                            <Input
                              type="text"
                              value={step.action}
                              onChange={(e) =>
                                handleStepActionChange(idx, e.target.value)
                              }
                              placeholder="操作描述，如：點擊 '送出' 按鈕"
                              className="flex-1 bg-zinc-950 border-zinc-800 text-zinc-100 h-8 text-xs focus-visible:ring-emerald-500"
                            />
                            <div className="flex items-center space-x-2">
                              <Switch
                                id={`expected-${idx}`}
                                checked={!!step.hasExpected}
                                onCheckedChange={(checked) => {
                                  const newSteps = [...tcSteps];
                                  newSteps[idx].hasExpected = checked;
                                  setTcSteps(newSteps);
                                }}
                              />
                              <Label
                                htmlFor={`expected-${idx}`}
                                className="text-zinc-400 text-xs cursor-pointer select-none"
                              >
                                預期結果
                              </Label>
                            </div>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleRemoveStepInput(idx)}
                              className="border-zinc-800 hover:bg-rose-500/10 text-zinc-400 hover:text-rose-400 flex-shrink-0 h-8 w-8"
                            >
                              <Trash2 size={12} />
                            </Button>
                          </div>
                          {step.hasExpected && (
                            <div className="pl-10 animate-fadeIn">
                              <Input
                                type="text"
                                value={step.expected || ""}
                                onChange={(e) =>
                                  handleStepExpectedChange(idx, e.target.value)
                                }
                                placeholder="步驟預期結果，如：進入首頁、跳出錯誤視窗、出現註冊按鈕、未出現xxx）"
                                className="bg-zinc-950/40 border-zinc-900 h-7 text-[11px] placeholder:text-zinc-600 focus-visible:ring-emerald-600"
                              />
                            </div>
                          )}
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleAddStepInput}
                        className="self-start text-[10px] border-zinc-850 hover:bg-zinc-900 text-zinc-300"
                      >
                        <Plus size={10} className="mr-1" /> 新增下一步
                      </Button>
                    </div>
                  </div>

                  {/* 編輯預期結果 */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                      預期結果 <span className="text-red-500">*</span>
                    </label>
                    <Textarea
                      value={tcExpected}
                      onChange={(e) => setTcExpected(e.target.value)}
                      placeholder="修改預期結果"
                      rows={3}
                      className="resize-none bg-zinc-950 border-zinc-800 text-zinc-100"
                    />
                  </div>

                  <JsonEditorAccordion
                    initCookies={testcase.initCookies}
                    initLocalStorage={testcase.initLocalStorage}
                    onChange={({ cookies, localStorage, isValid }) => {
                      setInitCookies(cookies);
                      setInitLocalStorage(localStorage);
                      setIsJsonValid(isValid);
                    }}
                  />

                  {/* 刪除測試案例入口 */}
                  <div className="border-t border-zinc-900/60 pt-5 mt-2 flex flex-col gap-2">
                    <label className="text-[10px] font-bold text-rose-500/80 uppercase tracking-wider">
                      危險區域
                    </label>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setIsDeleteDialogOpen(true)}
                      className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 flex items-center gap-1.5 self-start"
                    >
                      <Trash2 size={14} />
                      刪除測試案例
                    </Button>
                  </div>

                  {/* 表單底操作 */}
                  <div className="flex justify-end gap-2 border-t border-zinc-850 pt-4 mt-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsEditing(false);
                        // 還原資料
                        setTcName(testcase.name);
                        setTcSteps(
                          testcase.steps.map((s) => ({
                            action: s.action,
                            expected: s.expected,
                            hasExpected: s.hasExpected,
                          })),
                        );
                        setTcExpected(testcase.expected);
                        setInitCookies(testcase.initCookies);
                        setInitLocalStorage(testcase.initLocalStorage);
                        setIsJsonValid(true);
                      }}
                      className="border-zinc-800 text-zinc-300 hover:bg-zinc-950"
                    >
                      取消
                    </Button>
                    <Button
                      onClick={handleSaveEdit}
                      disabled={isSaving || !isJsonValid}
                      className="bg-zinc-100 text-zinc-950 hover:bg-zinc-200"
                    >
                      {isSaving ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        "儲存修改"
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                // 唯讀檢視模式
                <div className="flex flex-col gap-6">
                  {/* 測試步驟 Card */}
                  <div className="bg-zinc-900/20 border border-zinc-850 rounded-2xl p-6 shadow-md flex flex-col gap-4">
                    <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                      步驟詳情 (Steps)
                    </h4>
                    <div className="flex flex-col gap-3">
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
          )}

          {/* History Tab */}
          {activeTab === "history" && (
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
          )}
        </div>
      </ScrollArea>

      {/* 刪除測試案例二次確認彈窗 */}
      <BaseDialog
        open={isDeleteDialogOpen}
        onOpenChange={(open) => {
          setIsDeleteDialogOpen(open);
          if (!open) setConfirmName("");
        }}
        title={
          <div className="flex items-center gap-2 text-rose-500">
            <AlertTriangle size={18} />
            <span>危險區域：刪除測試案例</span>
          </div>
        }
        description="此操作無法復原！刪除測試案例將永久刪除該測試案例及所有的歷史執行紀錄與設定。"
        footer={
          <div className="flex items-center justify-between w-full">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setConfirmName("");
              }}
              className="text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 flex items-center gap-1.5"
              disabled={isDeleting}
            >
              <ArrowLeft size={14} />
              返回編輯
            </Button>

            <Button
              type="button"
              onClick={handleDeleteTestCase}
              disabled={isDeleting || confirmName !== testcase.name}
              className="bg-rose-600 hover:bg-rose-500 text-white font-semibold flex items-center gap-1.5 border-none shadow-lg shadow-rose-900/20 disabled:bg-rose-950 disabled:text-rose-800 disabled:opacity-40"
            >
              {isDeleting ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <>
                  <Trash2 size={14} />
                  確定永久刪除
                </>
              )}
            </Button>
          </div>
        }
        className="max-w-[425px]"
        height="auto"
      >
        <div className="flex flex-col gap-4 py-2">
          <p className="text-xs text-rose-400 font-medium">
            若要確定刪除，請在下方輸入此測試案例的完整名稱以進行確認：
            <br />
            <span className="font-mono font-extrabold select-all text-zinc-100 block mt-2 text-center text-sm tracking-wide bg-zinc-950 py-1.5 px-3 rounded border border-zinc-800">
              {testcase.name}
            </span>
          </p>

          <div className="flex flex-col gap-1.5">
            <Input
              type="text"
              value={confirmName}
              onChange={(e) => setConfirmName(e.target.value)}
              className="bg-zinc-950 border-rose-900/50 focus-visible:ring-rose-500 text-zinc-100 font-mono text-center"
              placeholder="請在此輸入測試案例名稱"
              autoFocus
            />
          </div>
        </div>
      </BaseDialog>
    </div>
  );
}
