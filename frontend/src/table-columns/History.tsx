import type { Task } from "@/types/api";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "../components/custom/table/ColumnHeader";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

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
      <DataTableColumnHeader column={column} title="範圍" />
    ),
    cell: ({ row }) => {
      const scope = row.original.scope;
      return scope === "project"
        ? "專案"
        : scope === "group"
          ? "群組"
          : "單一案例";
    },
  },
  {
    accessorKey: "progress",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="進度 (完成 / 總數)" />
    ),
    cell: ({ row }) => (
      <span className="font-mono text-xs">
        {row.original.doneCount} / {row.original.totalCount}
      </span>
    ),
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="建立時間"
        className="flex justify-center"
      />
    ),
    cell: ({ row }) => (
      <div className="text-center text-xs font-mono text-zinc-400">
        {row.original.createdAt ? new Date(row.original.createdAt).toLocaleString() : "-"}
      </div>
    ),
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
      const { status, finalResult } = row.original;
      return (
        <div className="flex justify-center">
          {status !== "done" ? (
            <span className="flex items-center gap-1 text-[10px] text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full font-medium w-max">
              <Loader2 size={10} className="animate-spin text-emerald-500" />{" "}
              執行中
            </span>
          ) : finalResult === "PASS" ? (
            <CheckCircle size={16} className="text-emerald-400" />
          ) : (
            <XCircle size={16} className="text-red-400" />
          )}
        </div>
      );
    },
  },
];
