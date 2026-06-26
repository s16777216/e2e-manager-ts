import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Trash2, AlertTriangle, ArrowLeft } from "lucide-react";
import { BaseDialog } from "./BaseDialog";
import type { CookiesData, LocalStorageData } from "@/types/api";
import { Separator } from "../ui/separator";
import Typography from "./Typography";
import { FormBlock, FormField } from "./form";
import z from "zod";
import { Card, CardContent } from "../ui/card";
import { toast } from "sonner";

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
  onDelete,
}: ProjectFormProps) {
  // 刪除相關狀態
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [confirmName, setConfirmName] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

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

  const baseSettingSchema = z.object({
    name: z.string().min(1, "專案名稱為必填"),
    description: z.string().optional(),
  });

  type BaseSettingFormData = z.infer<typeof baseSettingSchema>;

  const [baseSettings, setBaseSettings] = useState<BaseSettingFormData>({
    name: initialData?.name || "",
    description: initialData?.description || "",
  });

  const cookiesSettingSchema = z.object({
    initCookies: z
      .custom<string>(
        (val) => {
          const { parsed, isValid, error } = validateCookies(val);
          if (!isValid) {
            throw new Error(error || "Cookies 格式錯誤");
          }
          return parsed;
        },
        {
          message:
            'Cookies 必須為 JSON 物件格式 (例如: { "domain/path": { "name": "value" } })',
        },
      )
      .optional(),
    initLocalStorage: z
      .custom<string>(
        (val) => {
          const { parsed, isValid, error } = validateLocalStorage(val);
          if (!isValid) {
            throw new Error(error || "LocalStorage 格式錯誤");
          }
          return parsed;
        },
        {
          message:
            'LocalStorage 必須為 JSON 物件格式 (例如: { "key": "value" })',
        },
      )
      .optional(),
  });
  type CookiesSettingFormData = z.infer<typeof cookiesSettingSchema>;

  const [cookiesSettings, setCookiesSettings] =
    useState<CookiesSettingFormData>({
      initCookies: initialData?.initCookies
        ? JSON.stringify(initialData.initCookies, null, 2)
        : "",
      initLocalStorage: initialData?.initLocalStorage
        ? JSON.stringify(initialData.initLocalStorage, null, 2)
        : "",
    });

  const handleBaseSettingsSave = async (data: BaseSettingFormData) => {
    setBaseSettings(data);
    try {
      const parsedCookies: CookiesData = cookiesSettings?.initCookies
        ? JSON.parse(cookiesSettings.initCookies)
        : {};
      const parsedLocalStorage: LocalStorageData =
        cookiesSettings?.initLocalStorage
          ? JSON.parse(cookiesSettings.initLocalStorage)
          : {};
      await onSubmit(
        data.name,
        data.description || "",
        parsedCookies,
        parsedLocalStorage,
      );
      toast.success("設定已儲存");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "儲存失敗，請稍後再試";
      toast.error(msg);
    }
  };

  const handleCookiesSettingsSave = async (data: CookiesSettingFormData) => {
    setCookiesSettings(data);
    try {
      const parsedCookies: CookiesData = data.initCookies
        ? JSON.parse(data.initCookies)
        : {};
      const parsedLocalStorage: LocalStorageData = data.initLocalStorage
        ? JSON.parse(data.initLocalStorage)
        : {};

      await onSubmit(
        baseSettings.name,
        baseSettings.description || "",
        parsedCookies,
        parsedLocalStorage,
      );
      toast.success("設定已儲存");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "儲存失敗，請稍後再試";
      toast.error(msg);
    }
  };

  return (
    <>
      <div className="mx-auto w-full space-y-10">
        <FormBlock
          label="基本資訊"
          description="設定專案的基本資訊。"
          formSchema={baseSettingSchema}
          defaultValues={baseSettings}
          onSubmit={handleBaseSettingsSave}
          submitText={isSubmitting ? "儲存中..." : submitLabel}
          submitIcon="save"
        >
          <FormField
            name="name"
            label="專案名稱"
            description="設定專案的基本資訊。"
          >
            <Input placeholder="請輸入專案名稱" />
          </FormField>

          <FormField
            name="description"
            label="專案描述"
            description="設定專案的描述。"
          >
            <Textarea placeholder="請輸入專案描述" />
          </FormField>
        </FormBlock>
        <Separator className="my-10" />
        <FormBlock
          label="Cookies 與 LocalStorage"
          description="設定專案的 Cookies 與 LocalStorage，將在每次執行測試時自動注入。"
          formSchema={cookiesSettingSchema}
          defaultValues={cookiesSettings}
          onSubmit={handleCookiesSettingsSave}
          submitText={isSubmitting ? "儲存中..." : submitLabel}
          submitIcon="save"
        >
          <FormField
            name="initCookies"
            label="Cookies"
            description={
              <Typography type="muted" className="text-[10px] leading-tight">
                格式為 JSON 物件，例如 {'`{"domain/path": {"key": "value"}}`'}
              </Typography>
            }
          >
            <Textarea
              placeholder={`{\n  "localhost/": {\n    "token": "jwt-token-here"\n  }\n}`}
              className={`bg-zinc-950/80 border text-zinc-100 font-mono text-xs resize-y placeholder:text-zinc-700 no-scrollbar`}
            />
          </FormField>
          <FormField
            name="initLocalStorage"
            label="LocalStorage"
            description={
              <Typography type="muted" className="text-[10px] leading-tight">
                格式為 JSON 物件，例如 {'`{"key": "value"}`'}
              </Typography>
            }
          >
            <Textarea
              placeholder={`{\n  "theme": "dark",\n  "version": "1.0"\n}`}
              className={`bg-zinc-950/80 border text-zinc-100 font-mono text-xs resize-y placeholder:text-zinc-700 no-scrollbar`}
            />
          </FormField>
        </FormBlock>
        {/* 危險區域 */}
        {/* 刪除專案入口 (僅在編輯模式且提供 onDelete 時展示) */}
        {onDelete && initialData && (
          <>
            <Separator className="my-10" />

            <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
              <div className="flex flex-col space-y-1">
                <h3 className="font-semibold text-lg text-red-400">危險區域</h3>
                <p className="text-muted-foreground text-sm">
                  此處的操作具備破壞性且不可逆，請謹慎執行。
                </p>
              </div>

              <div className="space-y-6 lg:col-span-2">
                <Card className="border-red-900/30 bg-red-950/10">
                  <CardContent>
                    <div className="flex justify-between gap-4 max-lg:flex-col lg:items-center">
                      <div className="space-y-1">
                        <Typography type="h6" className="text-red-400">
                          刪除專案
                        </Typography>
                        <Typography type="p" className="text-zinc-400">
                          刪除專案將永久刪除該專案下的所有群組、測試案例及歷史執行紀錄。
                        </Typography>
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        onClick={() => setIsDeleteDialogOpen(true)}
                        className="bg-red-950/40 border border-red-800/60 hover:bg-red-900 hover:text-white cursor-pointer"
                      >
                        <Trash2 size={16} className="mr-2" />
                        刪除專案
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        )}
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
