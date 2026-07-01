import { useState, useEffect } from "react";
import { useParams, useNavigate, useRouteLoaderData } from "react-router-dom";
import { useGroupData } from "../hooks/useGroupData";
import { type FlatTreeRow } from "../components/GroupTreeNode";
import GroupTreeTable from "../components/GroupTreeTable";
import { NewSubgroupDialog } from "../components/NewSubgroupDialog";
import { api } from "../../../lib/api";
import { Plus, Sparkles, Play, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

import type { TestGroup, Testcase, Project } from "../../../types/api";

import TestCaseCreateDialog from "../components/TestCaseCreateDialog";
import GroupDeleteDialog from "../components/GroupDeleteDialog";
import TestCaseDeleteDialog from "../components/TestCaseDeleteDialog";

export default function ProjectDetailView() {
  const { projectId } = useParams();
  const navigate = useNavigate();

  // 專案資訊 (改用 useRouteLoaderData)
  const activeProject = useRouteLoaderData("project-root") as Project | null;

  // 觸發專案全部執行
  const handleRunAllProject = async () => {
    if (!projectId) return;
    try {
      toast.info("正在初始化專案測試任務...");
      const res = await api.runProject(projectId);
      toast.success("專案測試任務已啟動！正在轉跳監控頁面...");
      navigate(`/project/${projectId}/tasks/${res.taskId}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error("啟動專案測試失敗：" + msg);
    }
  };

  // 觸發群組全部執行
  const handleRunGroup = async (groupId: string) => {
    try {
      toast.info("正在初始化群組測試任務...");
      const res = await api.runGroup(groupId);
      toast.success("群組測試任務已啟動！正在轉跳監控頁面...");
      navigate(`/project/${projectId}/tasks/${res.taskId}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error("啟動群組測試失敗：" + msg);
    }
  };

  // 群組樹狀態
  const {
    groups,
    groupTree,
    expandedGroups,
    setExpandedGroups,
    handleCreateSubgroup,
    handleDeleteGroup,
    loadGroups,
    isLoading: loadingGroups,
  } = useGroupData(projectId);

  // 本地狀態管理
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  // 懶加載測試案例快取與載入狀態
  const [testcasesMap, setTestcasesMap] = useState<Record<string, Testcase[]>>(
    {},
  );
  const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});

  // 1. 新增群組彈窗狀態
  const [showNewGroupModal, setShowNewGroupModal] = useState(false);
  const [newGroupParentId, setNewGroupParentId] = useState<string | null>(null);
  const [groupToEdit, setGroupToEdit] = useState<TestGroup | null>(null);

  // 2. 新增測試案例彈窗狀態
  const [showNewTestCaseModal, setShowNewTestCaseModal] = useState(false);
  const [targetGroupId, setTargetGroupId] = useState("");
  const [isSavingTestCase, setIsSavingTestCase] = useState(false);

  // 刪除群組 Dialog 狀態
  const [deleteGroupId, setDeleteGroupId] = useState<string | null>(null);
  const [isDeletingGroup, setIsDeletingGroup] = useState(false);

  // 刪除測試案例 Dialog 狀態
  const [deleteTestCaseId, setDeleteTestCaseId] = useState<string | null>(null);
  const [deleteTestCaseName, setDeleteTestCaseName] = useState("");
  const [isDeletingTestCase, setIsDeletingTestCase] = useState(false);

  const confirmDeleteGroup = async () => {
    if (!deleteGroupId) return;
    setIsDeletingGroup(true);
    try {
      await handleDeleteGroup(deleteGroupId);
      setDeleteGroupId(null);
    } finally {
      setIsDeletingGroup(false);
    }
  };

  const confirmDeleteTestCase = async () => {
    if (!deleteTestCaseId) return;
    setIsDeletingTestCase(true);
    try {
      await api.deleteTestcase(deleteTestCaseId);
      toast.success("測試案例刪除成功！");
      setDeleteTestCaseId(null);
      setDeleteTestCaseName("");
      setRefreshTrigger((prev) => prev + 1);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error("刪除測試案例失敗：" + msg);
    } finally {
      setIsDeletingTestCase(false);
    }
  };

  const triggerDeleteTestCase = (tcId: string) => {
    let name = "";
    for (const gid of Object.keys(testcasesMap)) {
      const found = testcasesMap[gid]?.find((tc) => tc.id === tcId);
      if (found) {
        name = found.name;
        break;
      }
    }
    setDeleteTestCaseId(tcId);
    setDeleteTestCaseName(name);
  };

  // 專案改變時清空狀態與展開
  useEffect(() => {
    Promise.resolve().then(() => {
      setTestcasesMap({});
      setLoadingMap({});
      setExpandedGroups({});
      setSelectedGroupId("");
    });
  }, [projectId, setExpandedGroups]);

  // 當 selectedGroupId 改變時，同步預選 targetGroupId
  const [prevSelectedGroupId, setPrevSelectedGroupId] =
    useState(selectedGroupId);
  if (selectedGroupId !== prevSelectedGroupId) {
    setPrevSelectedGroupId(selectedGroupId);
    if (selectedGroupId) {
      setTargetGroupId(selectedGroupId);
    }
  }

  // 當 refreshTrigger 改變時重新獲取當前已展開群組的測試案例 (以即時更新最新建立的測試案例)
  useEffect(() => {
    if (!projectId) return;

    const reloadActiveTestcases = async () => {
      const activeGroupIds = Object.keys(expandedGroups).filter(
        (id) => expandedGroups[id],
      );
      if (activeGroupIds.length === 0) return;

      for (const groupId of activeGroupIds) {
        try {
          const data = await api.getTestcases(groupId);
          setTestcasesMap((prev) => ({ ...prev, [groupId]: data }));
        } catch (err) {
          console.error(`重新整理群組 ${groupId} 的測試案例失敗:`, err);
        }
      }
    };

    reloadActiveTestcases();
  }, [refreshTrigger, projectId, expandedGroups]);

  // 處理群組展開與收合 (附帶 lazy loading)
  const handleToggleExpand = async (groupId: string) => {
    const isCurrentlyExpanded = expandedGroups[groupId] || false;
    const nextExpanded = !isCurrentlyExpanded;

    setExpandedGroups({
      ...expandedGroups,
      [groupId]: nextExpanded,
    });

    if (nextExpanded && !testcasesMap[groupId] && !loadingMap[groupId]) {
      setLoadingMap((prev) => ({ ...prev, [groupId]: true }));
      try {
        const data = await api.getTestcases(groupId);
        setTestcasesMap((prev) => ({ ...prev, [groupId]: data }));
      } catch (err) {
        console.error(`載入群組 ${groupId} 的測試案例失敗:`, err);
      } finally {
        setLoadingMap((prev) => ({ ...prev, [groupId]: false }));
      }
    }
  };

  // 建立 Flat Rows 用於 Tree Table 一維渲染
  const buildFlatRows = (nodes: TestGroup[], depth = 0): FlatTreeRow[] => {
    let list: FlatTreeRow[] = [];
    nodes.forEach((node) => {
      const isExpanded = expandedGroups[node.id] || false;
      const tcs = testcasesMap[node.id] || [];
      const isLoading = loadingMap[node.id] || false;

      const subGroupsCount = node.children?.length || 0;
      const tcCount = tcs.length;
      const groupItemCount = subGroupsCount + tcCount;

      const hasChildren =
        subGroupsCount > 0 || tcCount > 0 || !testcasesMap[node.id];

      list.push({
        id: node.id,
        name: node.name,
        type: "group",
        depth,
        isExpanded,
        hasChildren,
        itemCount: groupItemCount,
        parentId: node.parentId || null,
      });

      if (isExpanded) {
        if (isLoading && tcs.length === 0) {
          list.push({
            id: `loading-${node.id}`,
            name: "載入中...",
            type: "loading",
            depth: depth + 1,
            isExpanded: false,
            hasChildren: false,
            itemCount: 0,
            parentId: node.id,
          });
        }

        if (node.children && node.children.length > 0) {
          list = list.concat(buildFlatRows(node.children, depth + 1));
        }

        tcs.forEach((tc) => {
          const lastRun =
            tc.runs && tc.runs.length > 0
              ? tc.runs[tc.runs.length - 1]
              : undefined;
          list.push({
            id: tc.id,
            name: tc.name,
            type: "testcase",
            depth: depth + 1,
            isExpanded: false,
            hasChildren: false,
            itemCount: tc.steps?.length || 0,
            lastStatus: lastRun?.status,
            parentId: node.id,
          });
        });
      }
    });
    return list;
  };

  const flatRows = buildFlatRows(groupTree);

  // 扁平化群組列表 (供測試案例 Dialog 下拉選單使用)
  const flatGroups = (() => {
    const flatten = (
      nodes: TestGroup[],
      depth = 0,
    ): { id: string; name: string; depth: number }[] => {
      let list: { id: string; name: string; depth: number }[] = [];
      nodes.forEach((node) => {
        list.push({ id: node.id, name: node.name, depth });
        if (node.children && node.children.length > 0) {
          list = list.concat(flatten(node.children, depth + 1));
        }
      });
      return list;
    };
    return flatten(groupTree);
  })();

  // 處理新增群組觸發
  const triggerAddGroup = (parentId: string | null) => {
    setNewGroupParentId(parentId);
    setShowNewGroupModal(true);
  };

  // 儲存新測試案例
  const handleSaveTestCaseSubmit = async (name: string, targetGroupId: string) => {
    setIsSavingTestCase(true);
    try {
      await api.createTestcase(targetGroupId, {
        name,
        steps: [],
        expected: "尚未填寫預期結果",
        initCookies: {},
        initLocalStorage: {},
        variables: {},
      });
      toast.success("測試案例建立成功！");
      setShowNewTestCaseModal(false);

      // 重新整理
      setRefreshTrigger((prev) => prev + 1);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error("建立測試案例失敗：" + msg);
    } finally {
      setIsSavingTestCase(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-zinc-950 text-foreground overflow-y-auto select-none p-8">
      {/* 頂部 Header & 麵包屑已移至全域 */}
      <div className="max-w-6xl w-full mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-10">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-zinc-100 via-zinc-300 to-zinc-500 bg-clip-text text-transparent flex items-center gap-2">
            <Sparkles size={20} className="text-primary animate-pulse" />
            {activeProject ? activeProject.name : "載入專案中..."}
            {activeProject && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(`/project/${activeProject.id}/edit`)}
                className="h-7 w-7 text-zinc-500 hover:text-zinc-200 hover:bg-zinc-950 rounded-lg transition-colors ml-1 shrink-0"
                title="編輯專案資訊"
              >
                <Edit2 size={13} />
              </Button>
            )}
          </h2>
          <p className="text-zinc-400 text-sm mt-1.5 leading-relaxed">
            {activeProject?.description ||
              "選擇下方測試案例開始視覺測試，或建立新的測試群組與案例。"}
          </p>
        </div>

        {/* 頂部操作按鈕 */}
        <div className="flex items-center gap-3">
          <Button
            onClick={handleRunAllProject}
            className="bg-emerald-600 hover:bg-emerald-500 text-white transition-all font-semibold flex items-center gap-2 px-4 py-5 shadow-lg shadow-emerald-600/10 border-none"
          >
            <Play size={14} fill="currentColor" /> 執行所有案例
          </Button>
          <Button
            variant="outline"
            onClick={() => triggerAddGroup(selectedGroupId || null)}
            className="border-zinc-800 hover:bg-zinc-900 text-zinc-300 hover:text-zinc-100 transition-all font-semibold flex items-center gap-2 px-4 py-5"
          >
            <Plus size={14} /> 建立新群組
          </Button>
          <Button
            onClick={() => {
              if (selectedGroupId) {
                setTargetGroupId(selectedGroupId);
              }
              setShowNewTestCaseModal(true);
            }}
            className="bg-zinc-100 text-zinc-950 hover:bg-zinc-200 transition-all font-semibold flex items-center gap-2 px-5 py-5 shadow-lg shadow-zinc-100/10"
          >
            <Plus size={14} /> 建立測試案例
          </Button>
        </div>
      </div>

      {/* 測試案例樹狀表格目錄 */}
      <GroupTreeTable
        projectId={projectId || ""}
        loading={loadingGroups}
        groupTree={groupTree}
        flatRows={flatRows}
        selectedGroupId={selectedGroupId}
        setSelectedGroupId={setSelectedGroupId}
        onToggleExpand={handleToggleExpand}
        onAddSubgroup={triggerAddGroup}
        onEditGroup={(groupId) => {
          const g = groups.find((group) => group.id === groupId);
          if (g) {
            setGroupToEdit(g);
            setNewGroupParentId(g.parentId || null);
            setShowNewGroupModal(true);
          }
        }}
        onDeleteGroup={setDeleteGroupId}
        onDeleteTestcase={triggerDeleteTestCase}
        onRunGroup={handleRunGroup}
      />

      {/* 新群組彈窗 */}
      <NewSubgroupDialog
        key={`${showNewGroupModal}-${groupToEdit?.id || "new"}`}
        open={showNewGroupModal}
        onOpenChange={(open) => {
          setShowNewGroupModal(open);
          if (!open) {
            setGroupToEdit(null);
          }
        }}
        parentId={newGroupParentId}
        groupToEdit={groupToEdit}
        onCreateGroup={async (
          name,
          parentId,
          initCookies,
          initLocalStorage,
          variables,
        ) => {
          const res = await handleCreateSubgroup(
            name,
            parentId,
            initCookies,
            initLocalStorage,
            variables,
          );
          if (res) {
            if (parentId) {
              setExpandedGroups((prev) => ({ ...prev, [parentId]: true }));
            }
            setShowNewGroupModal(false);
          }
        }}
        onUpdateGroup={async (
          name,
          initCookies,
          initLocalStorage,
          variables,
        ) => {
          if (!groupToEdit) return;
          try {
            await api.updateGroup(groupToEdit.id, {
              name,
              initCookies,
              initLocalStorage,
              variables,
            });
            if (projectId) {
              await loadGroups(projectId);
            }
            toast.success("群組更新成功！");
            setShowNewGroupModal(false);
          } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : String(err);
            toast.error("更新群組失敗：" + msg);
          }
        }}
      />

      <TestCaseCreateDialog
        open={showNewTestCaseModal}
        onOpenChange={setShowNewTestCaseModal}
        targetGroupId={targetGroupId}
        setTargetGroupId={setTargetGroupId}
        flatGroups={flatGroups}
        isSaving={isSavingTestCase}
        onSubmit={handleSaveTestCaseSubmit}
      />

      <GroupDeleteDialog
        open={deleteGroupId !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteGroupId(null);
        }}
        isDeleting={isDeletingGroup}
        onConfirm={confirmDeleteGroup}
      />

      <TestCaseDeleteDialog
        open={deleteTestCaseId !== null}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteTestCaseId(null);
            setDeleteTestCaseName("");
          }
        }}
        testcaseName={deleteTestCaseName}
        isDeleting={isDeletingTestCase}
        onConfirm={confirmDeleteTestCase}
      />
    </div>
  );
}
