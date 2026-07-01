import { BaseDialog } from "../../../components/custom/BaseDialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ArrowLeft, LoaderCircle, Trash2 } from "lucide-react";

interface GroupDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isDeleting: boolean;
  onConfirm: () => Promise<void>;
}

export default function GroupDeleteDialog({
  open,
  onOpenChange,
  isDeleting,
  onConfirm,
}: GroupDeleteDialogProps) {
  const dialogFooter = (
    <div className="flex items-center justify-between w-full">
      <Button
        type="button"
        variant="ghost"
        onClick={() => onOpenChange(false)}
        className="text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 flex items-center gap-1.5"
        disabled={isDeleting}
      >
        <ArrowLeft size={14} />
        取消
      </Button>
      <Button
        type="button"
        onClick={onConfirm}
        disabled={isDeleting}
        className="bg-rose-600 hover:bg-rose-500 text-white font-semibold flex items-center gap-1.5 border-none shadow-lg shadow-rose-900/20"
      >
        {isDeleting ? (
          <LoaderCircle size={14} className="animate-spin" />
        ) : (
          <>
            <Trash2 size={14} />
            確定永久刪除
          </>
        )}
      </Button>
    </div>
  );

  return (
    <BaseDialog
      open={open}
      onOpenChange={onOpenChange}
      title={
        <div className="flex items-center gap-2 text-rose-500">
          <AlertTriangle size={18} />
          <span>確定要刪除此群組嗎？</span>
        </div>
      }
      description="此操作將會永久刪除此群組，且該群組其下的所有子群組與測試案例也將一併被永久刪除，此操作無法復原！"
      footer={dialogFooter}
      className="max-w-[425px]"
      height="auto"
    >
      <div className="py-2">
        <p className="text-xs text-zinc-400 leading-relaxed">
          請確認您要刪除此群組，刪除後將無法還原該群組的設定與底下關聯的測試資料。
        </p>
      </div>
    </BaseDialog>
  );
}
