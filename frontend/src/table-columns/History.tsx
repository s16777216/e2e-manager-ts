import type { Task } from "@/types/api";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "../components/custom/table/ColumnHeader";
import { StatusBadge } from "../components/custom/StatusBadge";
import SelectFilter from "@/components/custom/table/SelectFilter";

export const columns: ColumnDef<Task>[] = [
  {
    accessorKey: "id",
    enableSorting: false,
    enableColumnFilter: false,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="編號" />
    ),
    cell: ({ row }) => (
      <span className="font-mono text-zinc-200">
        #{row.original.id.substring(0, 8)}
      </span>
    ),
  },
  {
    accessorKey: "projectName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="所屬專案" />
    ),
    cell: ({ row }) => (
      <span className="font-bold text-zinc-200">
        {row.original.projectName || "未知專案"}
      </span>
    ),
  },
  {
    accessorKey: "scope",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="執行範圍"
        customFilter={(context) => {
          return (
            <SelectFilter
              context={context}
              items={[
                { label: "全專案", value: "project" },
                { label: "測試群組", value: "group" },
                { label: "單一案例", value: "testcase" },
              ]}
            />
          );
        }}
      />
    ),
    cell: ({ row }) => {
      const scopeMap = {
        project: "全專案",
        group: "測試群組",
        testcase: "單一案例",
      };
      return (
        <span className="text-zinc-400">
          {scopeMap[row.original.scope as keyof typeof scopeMap] || "未知"}
        </span>
      );
    },
  },
  {
    accessorKey: "totalCount",
    filterFn: "inNumberRange",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="案例總數" />
    ),
    cell: ({ row }) => (
      <span className="font-mono text-zinc-400">{row.original.totalCount}</span>
    ),
  },
  {
    accessorKey: "doneCount",
    filterFn: "inNumberRange",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="已完成" />
    ),
    cell: ({ row }) => (
      <span className="font-mono text-zinc-400">{row.original.doneCount}</span>
    ),
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="啟動時間" />
    ),
    cell: ({ row }) => {
      const date = new Date(row.original.createdAt);
      return (
        <span className="text-zinc-400 font-mono">
          {date.toLocaleString("zh-TW")}
        </span>
      );
    },
  },
  {
    accessorKey: "totalTokens",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Token 消耗"
        className="flex justify-center"
      />
    ),
    filterFn: "inNumberRange",
    cell: ({ row }) => {
      const tokens = row.original.totalTokens;
      return (
        <div className="text-center font-mono text-xs text-indigo-400 font-bold">
          {tokens !== undefined && tokens > 0 ? tokens.toLocaleString() : "-"}
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="結果"
        className="flex justify-center"
        customFilter={(context) => (
          <SelectFilter
            context={context}
            items={[
              { label: "未開始", value: "pending" },
              { label: "進行中", value: "running" },
              { label: "成功", value: "passed" },
              { label: "失敗", value: "failed" },
              { label: "錯誤", value: "error" },
            ]}
          />
        )}
      />
    ),
    cell: ({ row }) => {
      const { status } = row.original;
      return (
        <div className="flex justify-center">
          <StatusBadge status={status} size={16} />
        </div>
      );
    },
  },
];
