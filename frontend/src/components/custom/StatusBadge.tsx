import React from "react";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { cn } from "../../lib/utils";

export interface StatusBadgeProps {
  status: "pending" | "running" | "passed" | "failed" | "error";
  className?: string;
  showText?: boolean;
  size?: number;
}

export function StatusBadge({
  status,
  className,
  showText = true,
  size = 12,
}: StatusBadgeProps) {
  const config: Record<
    "pending" | "running" | "passed" | "failed" | "error",
    {
      bg: string;
      icon: React.ComponentType<{ size?: number; className?: string }>;
      text: string;
      animate?: boolean;
    }
  > = {
    pending: {
      bg: "text-zinc-400",
      icon: Clock,
      text: "排隊中",
    },
    running: {
      bg: "text-emerald-400",
      icon: Loader2,
      text: "執行中",
      animate: true,
    },
    passed: {
      bg: "text-emerald-400",
      icon: CheckCircle2,
      text: "成功",
    },
    failed: {
      bg: "text-rose-400",
      icon: XCircle,
      text: "失敗",
    },
    error: {
      bg: "text-amber-400",
      icon: AlertCircle,
      text: "異常",
    },
  };

  const current = config[status] || config.pending;
  const Icon = current.icon;

  return (
    <span
      className={cn(
        "flex items-center gap-1.5 px-2.5 py-0.5 text-[10px] font-semibold w-max select-none",
        current.bg,
        className,
      )}
    >
      <Icon
        size={size}
        className={cn("flex-shrink-0", current.animate && "animate-spin")}
      />
      {showText && <span>{current.text}</span>}
    </span>
  );
}
