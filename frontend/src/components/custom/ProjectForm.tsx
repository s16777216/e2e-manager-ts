import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Trash2, AlertTriangle, ArrowLeft } from "lucide-react";
import { JsonEditorAccordion } from "./JsonEditorAccordion";
import { BaseDialog } from "./BaseDialog";
import type { CookiesData, LocalStorageData } from "@/types/api";

interface ProjectFormProps {
  initialData?: {
    name: string;
    description: string;
    initCookies: CookiesData | null;
    initLocalStorage: LocalStorageData | null;
  };
  submitLabel: string;
  isSubmitting: boolean;
  onSubmit: (
    name: string,
    description: string,
    initCookies: CookiesData | null,
    initLocalStorage: LocalStorageData | null,
  ) => Promise<void>;
  onCancel: () => void;
  onDelete?: () => Promise<void>;
}

export function ProjectForm({
  initialData,
  submitLabel,
  isSubmitting,
  onSubmit,
  onCancel,
  onDelete,
}: ProjectFormProps) {
  const [name, setName] = useState(initialData?.name || "");
  const [description, setDescription] = useState(initialData?.description || "");

  // 進階環境設定狀態
  const [initCookies, setInitCookies] = useState<CookiesData | null>(initialData?.initCookies || null);
  const [initLocalStorage, setInitLocalStorage] = useState<LocalStorageData | null>(
    initialData?.initLocalStorage || null,
  );
  const [isJsonValid, setIsJsonValid] = useState(true);

  // 刪除相關狀態
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [confirmName, setConfirmName] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !isJsonValid || isSubmitting) return;
    await onSubmit(name.trim(), description.trim(), initCookies, initLocalStorage);
  };

  const handleDelete = async () => {
    if (!onDelete || confirmName !== initialData?.name || isDeleting) return;
    setIsDeleting(true);
    try {
      await onDelete();
    } finally {
      setIsDeleting(false);
    }
  };

  const deleteDialogFooter = (
    <div className="flex items-center justify-between w-full">
      <Button
        type="button"
        variant="ghost"
        onClick={() => setIsDeleteDialogOpen(false)}
        className="text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 flex items-center gap-1.5"
        disabled={isDeleting}
      >
        <ArrowLeft size={14} />
        返回編輯
      </Button>

      <Button
        type="button"
        onClick={handleDelete}
        disabled={isDeleting || confirmName !== initialData?.name}
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
    </div>
  );

  return (
    <>
      <form onSubmit={handleSubmit} className="flex flex-col gap-6 max-w-xl w-full mx-auto my-4 bg-zinc-950/40 p-6 rounded-2xl border border-zinc-900 shadow-xl">
        {/* 專案名稱 */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
            專案名稱 <span className="text-rose-500">*</span>
          </label>
          <Input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-zinc-950 border-zinc-800 text-zinc-100"
            placeholder="請輸入專案名稱"
            required
          />
        </div>

        {/* 專案描述 */}
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

        {/* 進階設定摺疊面板 */}
        <JsonEditorAccordion
          initCookies={initCookies}
          initLocalStorage={initLocalStorage}
          onChange={({ cookies, localStorage, isValid }) => {
            setInitCookies(cookies);
            setInitLocalStorage(localStorage);
            setIsJsonValid(isValid);
          }}
        />

        {/* 刪除專案入口 (僅在編輯模式下展示) */}
        {onDelete && initialData && (
          <div className="border-t border-zinc-900/60 pt-5 mt-2 flex flex-col gap-2">
            <label className="text-[10px] font-bold text-rose-500/80 uppercase tracking-wider">
              危險區域
            </label>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsDeleteDialogOpen(true)}
              className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 flex items-center gap-1.5 self-start"
            >
              <Trash2 size={14} />
              刪除專案
            </Button>
          </div>
        )}

        {/* 送出與取消按鈕 */}
        <div className="flex justify-end gap-3 border-t border-zinc-900 pt-5 mt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="border-zinc-800 text-zinc-300 hover:bg-zinc-950"
            disabled={isSubmitting}
          >
            取消
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || !name.trim() || !isJsonValid}
            className="bg-zinc-100 text-zinc-950 hover:bg-zinc-200 font-semibold flex items-center gap-1.5"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                處理中...
              </>
            ) : (
              submitLabel
            )}
          </Button>
        </div>
      </form>

      {/* 刪除專案二次確認彈窗 */}
      {onDelete && initialData && (
        <BaseDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          title={
            <div className="flex items-center gap-2 text-rose-500">
              <AlertTriangle size={18} />
              <span>危險區域：刪除專案</span>
            </div>
          }
          description="此操作無法復原！刪除專案將永久刪除該專案下的所有群組、測試案例及歷史執行紀錄。"
          footer={deleteDialogFooter}
          className="max-w-[425px]"
          height="auto"
        >
          <div className="flex flex-col gap-4 py-2">
            <p className="text-xs text-rose-400 font-medium">
              若要確定刪除，請在下方輸入此專案的完整名稱以進行確認：
              <br />
              <span className="font-mono font-extrabold select-all text-zinc-100 block mt-2 text-center text-sm tracking-wide bg-zinc-950 py-1.5 px-3 rounded border border-zinc-800">
                {initialData.name}
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
        </BaseDialog>
      )}
    </>
  );
}
