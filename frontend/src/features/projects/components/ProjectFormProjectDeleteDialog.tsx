import { BaseDialog } from "@/components/custom/BaseDialog";
import Typography from "@/components/custom/Typography";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertTriangle, ArrowLeft, LoaderCircle, Trash2 } from "lucide-react";
import { useState } from "react";

interface ProjectFormProjectDeleteDialogProps {
  projectName: string;
  onProjectDelete: () => void;
  isDialogOpen: boolean;
  setDialogOpen: (value: boolean) => void;
  isDeleting: boolean;
}

export default function ProjectFormProjectDeleteDialog({
  projectName,
  onProjectDelete,
  isDialogOpen,
  setDialogOpen,
  isDeleting,
}: ProjectFormProjectDeleteDialogProps) {
  const [confirmName, setConfirmName] = useState("");

  const deleteDialogFooter = (
    <div className="flex items-center justify-between w-full">
      <Button
        variant="outline"
        onClick={() => {
          setDialogOpen(false);
          setConfirmName("");
        }}
        disabled={isDeleting}
      >
        <ArrowLeft size={14} />
        取消
      </Button>

      <Button
        variant="destructive"
        onClick={onProjectDelete}
        disabled={isDeleting || confirmName !== projectName}
      >
        {isDeleting ? (
          <LoaderCircle size={14} />
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
      open={isDialogOpen}
      onOpenChange={(open) => {
        setDialogOpen(open);
        if (!open) setConfirmName("");
      }}
      title={
        <div className="flex items-center gap-2 text-rose-500">
          <AlertTriangle size={18} />
          <span>刪除專案</span>
        </div>
      }
      description="此操作無法復原！刪除專案將永久刪除該專案下的所有群組、測試案例及歷史執行紀錄。"
      footer={deleteDialogFooter}
      className="max-w-[425px]"
      height="auto"
    >
      <div className="flex flex-col gap-4 py-2">
        <Typography type="small" className="text-rose-400 font-medium block">
          若要確定刪除，請在下方輸入此專案的完整名稱以進行確認：
          <br />
          <Typography
            type="inlineCode"
            className="font-extrabold select-all text-zinc-100 block mt-2 text-center text-sm tracking-wide bg-zinc-950 py-1.5 px-3 rounded border border-zinc-800"
          >
            {projectName}
          </Typography>
        </Typography>

        <div className="flex flex-col gap-1.5">
          <Input
            type="text"
            value={confirmName}
            onChange={(e) => setConfirmName(e.target.value)}
            className="bg-zinc-950 text-zinc-100 font-mono text-center"
            placeholder="請在此輸入專案名稱"
            autoFocus
          />
        </div>
      </div>
    </BaseDialog>
  );
}
