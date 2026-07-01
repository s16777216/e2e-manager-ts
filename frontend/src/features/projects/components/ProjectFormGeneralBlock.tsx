import { FormBlock, FormField } from "@/components/custom/form";
import type { generalFormSchema } from "../schema";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { UseFormProps } from "react-hook-form";
import z from "zod";

interface ProjectFormGeneralBlockProps {
  formSchema: typeof generalFormSchema;
  defaultValues: UseFormProps<z.infer<typeof generalFormSchema>>["defaultValues"];
  onSubmit: (data: z.infer<typeof generalFormSchema>) => void | Promise<void>;
  submitLabel?: string;
}

export default function ProjectFormGeneralBlock({
  formSchema,
  defaultValues,
  onSubmit,
  submitLabel,
}: ProjectFormGeneralBlockProps) {
  return (
    <FormBlock
      label="基本資訊"
      description="設定專案的基本資訊。"
      formSchema={formSchema}
      defaultValues={defaultValues}
      onSubmit={onSubmit}
      submitText={submitLabel}
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
  );
}
