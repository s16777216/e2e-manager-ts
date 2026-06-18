import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Loader2,
  Trash2,
  AlertTriangle,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { BaseDialog } from "./BaseDialog";
import type { CookiesData, LocalStorageData } from "@/types/api";
import { Separator } from "../ui/separator";
import Typography from "./Typography";
import { ScrollArea } from "../ui/scroll-area";

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

// Helpers for validation
function validateCookies(str: string): {
  parsed: CookiesData | null;
  isValid: boolean;
  error: string | null;
} {
  const trimmed = str.trim();
  if (trimmed === "") return { parsed: null, isValid: true, error: null };
  try {
    const parsed = JSON.parse(trimmed);
    if (
      typeof parsed !== "object" ||
      parsed === null ||
      Array.isArray(parsed)
    ) {
      return {
        parsed: null,
        isValid: false,
        error:
          'Cookies 必須為 JSON 物件格式 (例如: { "domain/path": { "name": "value" } })',
      };
    }
    return { parsed: parsed as CookiesData, isValid: true, error: null };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { parsed: null, isValid: false, error: `JSON 解析失敗: ${msg}` };
  }
}

function validateLocalStorage(str: string): {
  parsed: LocalStorageData | null;
  isValid: boolean;
  error: string | null;
} {
  const trimmed = str.trim();
  if (trimmed === "") return { parsed: null, isValid: true, error: null };
  try {
    const parsed = JSON.parse(trimmed);
    if (
      typeof parsed !== "object" ||
      parsed === null ||
      Array.isArray(parsed)
    ) {
      return {
        parsed: null,
        isValid: false,
        error: 'LocalStorage 必須為 JSON 物件格式 (例如: { "key": "value" })',
      };
    }
    return { parsed: parsed as LocalStorageData, isValid: true, error: null };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { parsed: null, isValid: false, error: `JSON 解析失敗: ${msg}` };
  }
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
  const [description, setDescription] = useState(
    initialData?.description || "",
  );

  // JSON 編輯器字串狀態
  const [cookiesStr, setCookiesStr] = useState(
    initialData?.initCookies
      ? JSON.stringify(initialData.initCookies, null, 2)
      : "",
  );
  const [localStorageStr, setLocalStorageStr] = useState(
    initialData?.initLocalStorage
      ? JSON.stringify(initialData.initLocalStorage, null, 2)
      : "",
  );

  // 刪除相關狀態
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [confirmName, setConfirmName] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // 即時 JSON 格式驗證
  const {
    parsed: parsedCookies,
    isValid: isCookiesValid,
    error: cookiesError,
  } = validateCookies(cookiesStr);
  const {
    parsed: parsedLocalStorage,
    isValid: isLocalStorageValid,
    error: localStorageError,
  } = validateLocalStorage(localStorageStr);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !isCookiesValid || !isLocalStorageValid || isSubmitting)
      return;
    await onSubmit(
      name.trim(),
      description.trim(),
      parsedCookies,
      parsedLocalStorage,
    );
  };

  const handleDelete = async () => {
    if (!onDelete || confirmName !== initialData?.name || isDeleting) return;
    setIsDeleting(true);
    try {
      await onDelete();
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
      setConfirmName("");
    }
  };

  const deleteDialogFooter = (
    <div className="flex items-center justify-between w-full">
      <Button
        type="button"
        variant="ghost"
        onClick={() => {
          setIsDeleteDialogOpen(false);
          setConfirmName("");
        }}
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
      <ScrollArea>
        <form
          id="project-form"
          onSubmit={handleSubmit}
          className="flex flex-col gap-6 max-w-xl w-full mx-auto my-4 p-6"
        >
          <div className="flex flex-col gap-6 max-w-xl w-full">
            <Typography type="h2">基本資訊</Typography>
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
          </div>
          <Separator />

          {/* 初始 Cookies - 平鋪展開 */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                Cookies
              </label>
              {cookiesStr.trim() !== "" &&
                (cookiesError ? (
                  <span className="text-[9px] text-rose-400 flex items-center gap-0.5 font-medium">
                    <AlertCircle size={10} /> 格式錯誤
                  </span>
                ) : (
                  <span className="text-[9px] text-emerald-400 flex items-center gap-0.5 font-medium">
                    <CheckCircle2 size={10} /> 格式正確
                  </span>
                ))}
            </div>
            <Textarea
              value={cookiesStr}
              onChange={(e) => setCookiesStr(e.target.value)}
              placeholder={`{\n  "localhost/": {\n    "token": "jwt-token-here"\n  }\n}`}
              className={`bg-zinc-950/80 border text-zinc-100 font-mono text-xs resize-y placeholder:text-zinc-700 no-scrollbar ${
                cookiesError
                  ? "border-rose-900/50 focus-visible:ring-rose-500"
                  : "border-zinc-850"
              }`}
            />
            {cookiesError ? (
              <span className="text-[10px] text-rose-400 leading-tight mt-0.5">
                {cookiesError}
              </span>
            ) : (
              <Typography type="muted" className="text-[10px] leading-tight">
                格式為 JSON 物件，例如 {'`{"domain/path": {"key": "value"}}`'}
              </Typography>
            )}
          </div>

          {/* 初始 LocalStorage - 平鋪展開 */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                LocalStorage
              </label>
              {localStorageStr.trim() !== "" &&
                (localStorageError ? (
                  <span className="text-[9px] text-rose-400 flex items-center gap-0.5 font-medium">
                    <AlertCircle size={10} /> 格式錯誤
                  </span>
                ) : (
                  <span className="text-[9px] text-emerald-400 flex items-center gap-0.5 font-medium">
                    <CheckCircle2 size={10} /> 格式正確
                  </span>
                ))}
            </div>
            <Textarea
              value={localStorageStr}
              onChange={(e) => setLocalStorageStr(e.target.value)}
              placeholder={`{\n  "theme": "dark",\n  "version": "1.0"\n}`}
              className={`bg-zinc-950/80 border text-zinc-100 font-mono text-xs resize-y placeholder:text-zinc-700 no-scrollbar ${
                localStorageError
                  ? "border-rose-900/50 focus-visible:ring-rose-500"
                  : "border-zinc-850"
              }`}
            />
            {localStorageError ? (
              <span className="text-[10px] text-rose-400 leading-tight mt-0.5">
                {localStorageError}
              </span>
            ) : (
              <Typography type="muted" className="text-[10px] leading-tight">
                格式為 JSON 物件，例如 {'`{"key": "value"}`'}
              </Typography>
            )}
          </div>

          {/* 刪除專案入口 (僅在編輯模式且提供 onDelete 時展示) */}
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
        </form>
      </ScrollArea>
      {/* 送出與取消按鈕 */}
      <div className="flex justify-end gap-3 border-t border-zinc-900 pt-5 mt-3">
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
          form="project-form"
          disabled={
            isSubmitting ||
            !name.trim() ||
            !isCookiesValid ||
            !isLocalStorageValid
          }
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
      {/* 刪除專案二次確認彈窗 */}
      {onDelete && initialData && (
        <BaseDialog
          open={isDeleteDialogOpen}
          onOpenChange={(open) => {
            setIsDeleteDialogOpen(open);
            if (!open) setConfirmName("");
          }}
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
            <Typography
              type="small"
              className="text-rose-400 font-medium block"
            >
              若要確定刪除，請在下方輸入此專案的完整名稱以進行確認：
              <br />
              <span className="font-mono font-extrabold select-all text-zinc-100 block mt-2 text-center text-sm tracking-wide bg-zinc-950 py-1.5 px-3 rounded border border-zinc-800">
                {initialData.name}
              </span>
            </Typography>

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
