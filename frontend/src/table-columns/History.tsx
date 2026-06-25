import type { Task } from "@/types/api";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "../components/custom/table/ColumnHeader";
import { StatusBadge } from "../components/custom/StatusBadge";

export const columns: ColumnDef<Task>[] = [
  {
    accessorKey: "id",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="任務編號" />
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
      <DataTableColumnHeader column={column} title="執行範圍" />
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
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="案例總數" />
    ),
    cell: ({ row }) => (
      <span className="font-mono text-zinc-400">{row.original.totalCount}</span>
    ),
  },
  {
    accessorKey: "doneCount",
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
