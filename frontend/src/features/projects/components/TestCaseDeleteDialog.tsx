import { useState } from "react";
import { BaseDialog } from "../../../components/custom/BaseDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertTriangle, ArrowLeft, LoaderCircle, Trash2 } from "lucide-react";

interface TestCaseDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  testcaseName: string;
  isDeleting: boolean;
  onConfirm: () => Promise<void>;
}

export default function TestCaseDeleteDialog({
  open,
  onOpenChange,
  testcaseName,
  isDeleting,
  onConfirm,
}: TestCaseDeleteDialogProps) {
  const [confirmName, setConfirmName] = useState("");

  const handleClose = (isOpen: boolean) => {
    onOpenChange(isOpen);
    if (!isOpen) {
      setConfirmName("");
    }
  };

  const dialogFooter = (
    <div className="flex items-center justify-between w-full">
      <Button
        type="button"
        variant="ghost"
        onClick={() => handleClose(false)}
        className="text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 flex items-center gap-1.5"
        disabled={isDeleting}
      >
        <ArrowLeft size={14} />
        取消
      </Button>
      <Button
        type="button"
        onClick={onConfirm}
        disabled={isDeleting || confirmName !== testcaseName}
        className="bg-rose-600 hover:bg-rose-500 text-white font-semibold flex items-center gap-1.5 border-none shadow-lg shadow-rose-900/20 disabled:bg-rose-950 disabled:text-rose-800 disabled:opacity-40"
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
      onOpenChange={handleClose}
      title={
        <div className="flex items-center gap-2 text-rose-500">
          <AlertTriangle size={18} />
          <span>確定要刪除此測試案例嗎？</span>
        </div>
      }
      description={
        <span>
          此操作將會永久刪除測試案例{" "}
          <strong className="text-zinc-100 font-mono">{testcaseName}</strong>
          ，此操作無法復原！
        </span>
      }
      footer={dialogFooter}
      className="max-w-[425px]"
      height="auto"
    >
      <div className="flex flex-col gap-4 py-2">
        <p className="text-xs text-rose-400 font-medium">
          若要確定刪除，請在下方輸入此測試案例的完整名稱以進行確認：
          <br />
          <span className="font-mono font-extrabold select-all text-zinc-100 block mt-2 text-center text-sm tracking-wide bg-zinc-950 py-1.5 px-3 rounded border border-zinc-800">
            {testcaseName}
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
  );
}
