import type { TestGroup } from "@/types/api";
import { GroupTreeNode, type FlatTreeRow } from "./GroupTreeNode";

interface GroupTreeTableProps {
  projectId: string;
  loading: boolean;
  groupTree: TestGroup[];
  flatRows: FlatTreeRow[];
  selectedGroupId: string;
  setSelectedGroupId: (id: string) => void;
  onToggleExpand: (groupId: string) => Promise<void> | void;
  onAddSubgroup: (parentId: string | null) => void;
  onEditGroup: (groupId: string) => void;
  onDeleteGroup: (groupId: string) => void;
  onDeleteTestcase: (tcId: string) => void;
  onRunGroup: (groupId: string) => void;
}

export default function GroupTreeTable({
  projectId,
  loading,
  groupTree,
  flatRows,
  selectedGroupId,
  setSelectedGroupId,
  onToggleExpand,
  onAddSubgroup,
  onEditGroup,
  onDeleteGroup,
  onDeleteTestcase,
  onRunGroup,
}: GroupTreeTableProps) {
  return (
    <div className="max-w-6xl w-full mx-auto flex-1 flex flex-col">
      <div className="border border-zinc-850 bg-zinc-900/30 backdrop-blur-md rounded-2xl overflow-hidden shadow-2xl">
        {loading ? (
          <div className="text-center py-20 text-sm text-zinc-500 italic">
            載入專案目錄中...
          </div>
        ) : groupTree.length === 0 ? (
          <div className="text-center py-20 text-sm text-zinc-500 italic">
            目前專案暫無群組，請點擊右上方「建立新群組」開始管理。
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-zinc-300">
              <thead>
                <tr className="border-b border-zinc-850 bg-zinc-950/40 text-xs font-bold text-zinc-400 uppercase tracking-wider">
                  <th className="px-6 py-4 w-[50%]">名稱</th>
                  <th className="px-6 py-4 w-[15%]">類型</th>
                  <th className="px-6 py-4 w-[15%] text-center">
                    子項目/步驟數
                  </th>
                  <th className="px-6 py-4 w-[20%] text-right">
                    最後執行狀態
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-850/50 text-sm">
                {flatRows.map((row) => (
                  <GroupTreeNode
                    key={row.id}
                    row={row}
                    selectedGroupId={selectedGroupId}
                    setSelectedGroupId={setSelectedGroupId}
                    activeTestCaseId=""
                    onToggleExpand={onToggleExpand}
                    onAddSubgroup={onAddSubgroup}
                    onDeleteGroup={onDeleteGroup}
                    onDeleteTestcase={onDeleteTestcase}
                    onEditGroup={onEditGroup}
                    onRunGroup={onRunGroup}
                    projectId={projectId}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
