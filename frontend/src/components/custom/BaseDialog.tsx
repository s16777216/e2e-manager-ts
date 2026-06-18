import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from "../ui/scroll-area";
import { useCallback, useMemo } from "react";
import { cn } from "@/lib/utils";
import type { ClassValue } from "clsx";

interface BaseDialogProps {
  open: boolean;
  onOpenChange?: (open: boolean) => unknown;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  height?: string;
  maxHeight?: string;
  className?: ClassValue;
}

export function BaseDialog(props: BaseDialogProps) {
  const {
    open,
    onOpenChange,
    title,
    description,
    children,
    footer,
    height = "400px",
    maxHeight = "90vh",
    className,
  } = props;

  const _onOpenChange = useCallback(
    (value: boolean) => {
      onOpenChange?.(value);
    },
    [onOpenChange],
  );

  const contentStyle = useMemo<React.CSSProperties>(() => {
    const style: React.CSSProperties = {};
    if (maxHeight) style.maxHeight = maxHeight;
    if (height) style.height = height;
    return style;
  }, [maxHeight, height]);

  return (
    <Dialog open={open} onOpenChange={_onOpenChange}>
      <DialogContent
        className={cn("bg-zinc-900 border-zinc-800 text-zinc-100", className)}
        style={contentStyle}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <ScrollArea>
          <div className="flex flex-col w-full h-full">{children}</div>
        </ScrollArea>
        <DialogFooter className="border-t border-zinc-850 pt-3">
          {footer}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
