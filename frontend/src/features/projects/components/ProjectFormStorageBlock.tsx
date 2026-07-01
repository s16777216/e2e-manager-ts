import { FormBlock, FormField } from "@/components/custom/form";
import Typography from "@/components/custom/Typography";
import { Textarea } from "@/components/ui/textarea";
import type { storageFormSchema } from "../schema";
import type { UseFormProps } from "react-hook-form";
import z from "zod";

interface ProjectFormStorageBlockProps {
  formSchema: typeof storageFormSchema;
  defaultValues: UseFormProps<z.infer<typeof storageFormSchema>>["defaultValues"];
  onSubmit: (data: z.infer<typeof storageFormSchema>) => void | Promise<void>;
  submitLabel?: string;
}

export default function ProjectFormStorageBlock({
  formSchema,
  defaultValues,
  onSubmit,
  submitLabel,
}: ProjectFormStorageBlockProps) {
  return (
    <FormBlock
      label="Cookies 與 LocalStorage"
      description="設定專案的 Cookies 與 LocalStorage，將在每次執行測試時自動注入。"
      formSchema={formSchema}
      defaultValues={defaultValues}
      onSubmit={onSubmit}
      submitText={submitLabel}
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
  );
}
