import { useState } from "react";
import { useParams, useNavigate, useOutletContext } from "react-router-dom";
import { Plus, Trash2, Edit2, Play, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTestcaseData } from "../hooks/useTestcaseData";
import { useSSEStream } from "../hooks/useSSEStream";
import type { TestGroup, Testcase, TestcaseStep } from "../types/api";

export default function GroupDashboardView() {
  const { groupId, projectId } = useParams();
  const navigate = useNavigate();
  const { groups } = useOutletContext<{ groups: TestGroup[] }>();

  // 取得選定群組名稱
  const activeGroup = groups.find((g) => g.id === groupId);

  // 測試案例資料載入
  const { testcases, handleSaveTestcase, handleDeleteTestcase } =
    useTestcaseData(groupId);

  // 測試啟動邏輯 (SSE 觸發但轉導由 Router 完成)
  const { triggerRun } = useSSEStream(undefined); // 這裡我們只用 triggerRun，不需要在此頁面監控

  // 表單與狀態
  const [showNewTestcaseForm, setShowNewTestcaseForm] = useState(false);
  const [isEditingTestcase, setIsEditingTestcase] = useState(false);
  const [editingTcId, setEditingTcId] = useState<string | null>(null);

  const [tcName, setTcName] = useState("");
  const [tcSteps, setTcSteps] = useState<
    Array<{ action: string; expected?: string }>
  >([{ action: "" }]);
  const [tcExpected, setTcExpected] = useState("");

  const [isTriggering, setIsTriggering] = useState<string | null>(null);

  // 當切換群組時，在 render 階段重置表單狀態，避免 useEffect 中同步 setState 造成 cascading renders
  const [prevGroupId, setPrevGroupId] = useState(groupId);
  if (groupId !== prevGroupId) {
    setPrevGroupId(groupId);
    setShowNewTestcaseForm(false);
    setIsEditingTestcase(false);
    setEditingTcId(null);
  }

  // 表單 Zod 步驟增減
  const handleAddStepInput = () => {
    setTcSteps([...tcSteps, { action: "" }]);
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

  // 儲存測試案例
  const handleSave = async () => {
    const res = await handleSaveTestcase(
      editingTcId,
      tcName,
      tcSteps,
      tcExpected,
    );
    if (res) {
      setShowNewTestcaseForm(false);
      setIsEditingTestcase(false);
      setEditingTcId(null);
    }
  };

  // 開始編輯測試案例
  const startEdit = (tc: Testcase) => {
    setTcName(tc.name);
    setTcSteps(
      (tc.steps || []).map((s) => ({ action: s.action, expected: s.expected })),
    );
    setTcExpected(tc.expected);
    setEditingTcId(tc.id);
    setIsEditingTestcase(true);
    setShowNewTestcaseForm(true);
  };

  // 觸發測試執行
  const handleRun = async (tcId: string) => {
    setIsTriggering(tcId);
    const taskId = await triggerRun(tcId);
    setIsTriggering(null);
    if (taskId) {
      navigate(`/project/${projectId}/tasks/${taskId}`);
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="px-6 py-4 border-b bg-card/50 flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-foreground">
            {activeGroup ? `群組：${activeGroup.name}` : "工作主控台"}
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {activeGroup ? "管理該群組底下的所有 E2E 測試案例" : "載入中..."}
          </p>
        </div>
      </header>

      {/* 主要內容 */}
      <ScrollArea className="flex-1">
        <div className="p-6">
          <div className="flex flex-col gap-6">
            {/* 頂部操作欄 */}
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                測試案例清單
              </h3>
              <Button
                onClick={() => {
                  setTcName("");
                  setTcSteps([{ action: "" }]);
                  setTcExpected("");
                  setEditingTcId(null);
                  setIsEditingTestcase(false);
                  setShowNewTestcaseForm(true);
                }}
                className="flex items-center gap-1.5"
              >
                <Plus size={14} /> 建立測試案例
              </Button>
            </div>

            {/* 表單：建立/編輯測試案例 */}
            {showNewTestcaseForm && (
              <div className="bg-card border rounded-xl p-5 flex flex-col gap-4">
                <h4 className="text-xs font-bold text-foreground flex items-center gap-2">
                  <FileText size={14} className="text-primary" />
                  {isEditingTestcase ? "編輯測試案例" : "建立全新測試案例"}
                </h4>

                <div className="flex flex-col gap-3">
                  {/* 測試案例名稱 */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      測試案例名稱
                    </label>
                    <Input
                      type="text"
                      value={tcName}
                      onChange={(e) => setTcName(e.target.value)}
                      placeholder="例如: Wikipedia Gemini 搜尋測試"
                    />
                  </div>

                  {/* 自然語言步驟 */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      測試步驟 (自然語言描述)
                    </label>
                    <div className="flex flex-col gap-3">
                      {tcSteps.map((step, idx) => (
                        <div
                          key={idx}
                          className="flex flex-col gap-2 p-2.5 bg-zinc-950/60 border border-zinc-850 rounded-xl"
                        >
                          <div className="flex items-center gap-2">
                            <span className="flex items-center justify-center bg-zinc-900 border border-zinc-800 text-[10px] text-muted-foreground rounded h-8 w-8 font-mono shrink-0">
                              {idx + 1}
                            </span>
                            <Input
                              type="text"
                              value={step.action}
                              onChange={(e) =>
                                handleStepActionChange(idx, e.target.value)
                              }
                              placeholder="操作描述（必填）"
                              className="flex-1 h-8 text-xs focus-visible:ring-emerald-500"
                            />
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleRemoveStepInput(idx)}
                              className="border-zinc-800 hover:bg-destructive/10 text-muted-foreground hover:text-destructive h-8 w-8"
                            >
                              <Trash2 size={12} />
                            </Button>
                          </div>
                          <div className="pl-10">
                            <Input
                              type="text"
                              value={step.expected || ""}
                              onChange={(e) =>
                                handleStepExpectedChange(idx, e.target.value)
                              }
                              placeholder="步驟預期結果（選填，無變化請填：直接完成）"
                              className="bg-zinc-950/40 border-zinc-900 text-zinc-400 h-7 text-[11px] placeholder:text-zinc-600 focus-visible:ring-emerald-600"
                            />
                          </div>
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleAddStepInput}
                        className="self-start text-[10px] hover:bg-zinc-900 text-zinc-300"
                      >
                        <Plus size={10} className="mr-1" /> 新增下一步
                      </Button>
                    </div>
                  </div>

                  {/* 預期結果 */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      預期結果
                    </label>
                    <Textarea
                      value={tcExpected}
                      onChange={(e) => setTcExpected(e.target.value)}
                      placeholder="例如: 畫面成功呈現 Gemini 相關維基條目"
                      rows={3}
                      className="resize-none"
                    />
                  </div>
                </div>

                {/* 動作按鈕 */}
                <div className="flex justify-end gap-2.5 border-t pt-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowNewTestcaseForm(false);
                      setIsEditingTestcase(false);
                      setEditingTcId(null);
                    }}
                  >
                    取消
                  </Button>
                  <Button onClick={handleSave}>儲存測試案例</Button>
                </div>
              </div>
            )}

            {/* 測試案例列表 */}
            <div className="grid grid-cols-1 gap-4">
              {testcases.length === 0 ? (
                <div className="text-center py-12 text-xs text-muted-foreground italic border border-dashed rounded-xl">
                  此群組下目前暫無測試案例，點擊右上角新增一個吧！
                </div>
              ) : (
                testcases.map((tc) => (
                  <div
                    key={tc.id}
                    className="bg-card/50 border rounded-xl p-5 flex flex-col gap-4 hover:border-zinc-700 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-sm font-bold text-foreground">
                          {tc.name}
                        </h4>
                        <p className="text-[10px] text-muted-foreground font-mono mt-0.5">
                          ID: {tc.id}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => startEdit(tc)}
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          title="編輯測試案例"
                        >
                          <Edit2 size={13} />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleDeleteTestcase(tc.id)}
                          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          title="刪除測試案例"
                        >
                          <Trash2 size={13} />
                        </Button>
                        <Button
                          onClick={() => handleRun(tc.id)}
                          disabled={isTriggering !== null}
                          className="h-8 flex items-center gap-1 ml-1.5 bg-emerald-600 hover:bg-emerald-500 text-white"
                        >
                          {isTriggering === tc.id ? (
                            <Loader2 size={12} className="animate-spin" />
                          ) : (
                            <Play size={12} fill="white" />
                          )}
                          執行測試
                        </Button>
                      </div>
                    </div>

                    <div className="border-t pt-3">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                        步驟詳情
                      </span>
                      <div className="mt-1.5 flex flex-col gap-2">
                        {tc.steps.map((step: TestcaseStep, idx: number) => (
                          <div
                            key={idx}
                            className="flex flex-col gap-1 p-2 bg-zinc-950/40 border border-zinc-900 rounded-lg"
                          >
                            <div className="flex items-start gap-2 text-xs text-muted-foreground">
                              <span className="h-4 w-4 bg-zinc-900 border border-zinc-800 rounded-full flex items-center justify-center text-[9px] font-bold mt-0.5 shrink-0">
                                {idx + 1}
                              </span>
                              <div className="flex-1">
                                <span className="text-zinc-200">
                                  {step.action}
                                </span>
                                {step.expected && (
                                  <p className="text-[10px] text-zinc-500 italic mt-0.5">
                                    預期:{" "}
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

                    <div className="border-t pt-3">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                        預期結果
                      </span>
                      <p className="text-xs text-foreground mt-1">
                        {tc.expected}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
