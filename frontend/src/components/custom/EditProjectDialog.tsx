import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Trash2, AlertTriangle, ArrowLeft } from "lucide-react";
import type { Project } from "@/types/api";

interface EditProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: Project;
  onUpdate: (name: string, description?: string) => Promise<unknown>;
  onDelete: () => Promise<boolean>;
}

export function EditProjectDialog({
  open,
  onOpenChange,
  project,
  onUpdate,
  onDelete,
}: EditProjectDialogProps) {
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description || "");
  const [isSaving, setIsSaving] = useState(false);

  // 刪除相關狀態
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [confirmName, setConfirmName] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) return;
    setIsSaving(true);
    try {
      await onUpdate(name.trim(), description.trim());
      onOpenChange(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (confirmName !== project.name) return;
    setIsDeleting(true);
    try {
      const success = await onDelete();
      if (success) {
        onOpenChange(false);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-zinc-900 border-zinc-800 text-zinc-100 animate-fadeIn">
        {!showDeleteConfirm ? (
          <>
            <DialogHeader>
              <DialogTitle>編輯專案資訊</DialogTitle>
              <DialogDescription className="text-zinc-400 text-xs">
                修改專案的名稱與描述資訊。
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-4 my-2">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                  專案名稱 <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-zinc-950 border-zinc-800 text-zinc-100"
                  placeholder="請輸入專案名稱"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                  專案描述
                </label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="bg-zinc-950 border-zinc-800 text-zinc-100 resize-none"
                  placeholder="請輸入專案描述"
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter className="border-t border-zinc-850 pt-3 flex items-center justify-between gap-2 sm:justify-between">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowDeleteConfirm(true)}
                className="text-red-400 hover:text-red-300 hover:bg-red-500/10 flex items-center gap-1.5 self-start"
              >
                <Trash2 size={14} />
                刪除專案
              </Button>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="border-zinc-800 text-zinc-300 hover:bg-zinc-950"
                >
                  取消
                </Button>
                <Button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving || !name.trim()}
                  className="bg-zinc-100 text-zinc-950 hover:bg-zinc-200 font-semibold"
                >
                  {isSaving ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    "儲存修改"
                  )}
                </Button>
              </div>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <div className="flex items-center gap-2 text-rose-500 mb-1">
                <AlertTriangle size={20} />
                <DialogTitle className="text-rose-500">
                  危險區域：刪除專案
                </DialogTitle>
              </div>
              <DialogDescription className="text-zinc-400 text-xs">
                此操作無法復原！刪除專案將永久刪除該專案下的所有群組、測試案例及歷史執行紀錄。
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-4 my-2 border border-rose-900/30 bg-rose-950/10 p-4 rounded-xl">
              <p className="text-xs text-rose-400 font-medium">
                若要確定刪除，請在下方輸入此專案的完整名稱以進行確認：
                <br />
                <span className="font-mono font-extrabold select-all text-zinc-100 block mt-2 text-center text-sm tracking-wide bg-zinc-950 py-1.5 px-3 rounded border border-zinc-800">
                  {project.name}
                </span>
              </p>

              <div className="flex flex-col gap-1.5">
                <Input
                  type="text"
                  value={confirmName}
                  onChange={(e) => setConfirmName(e.target.value)}
                  className="bg-zinc-950 border-rose-900/50 focus-visible:ring-rose-500 text-zinc-100 font-mono text-center"
                  placeholder="請在此輸入專案名稱"
                  autoFocus
                />
              </div>
            </div>

            <DialogFooter className="border-t border-zinc-850 pt-3 flex items-center justify-between gap-2 sm:justify-between">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowDeleteConfirm(false)}
                className="text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40 flex items-center gap-1.5"
                disabled={isDeleting}
              >
                <ArrowLeft size={14} />
                返回編輯
              </Button>

              <Button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting || confirmName !== project.name}
                className="bg-rose-600 hover:bg-rose-500 text-white font-semibold flex items-center gap-1.5 border-none shadow-lg shadow-rose-900/20 disabled:bg-rose-950 disabled:text-rose-800 disabled:opacity-40"
              >
                {isDeleting ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <>
                    <Trash2 size={14} />
                    確定永久刪除
                  </>
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
