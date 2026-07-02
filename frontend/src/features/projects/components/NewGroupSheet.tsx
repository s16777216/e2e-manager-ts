import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormBlock, FormField } from "@/components/custom/form";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import * as z from "zod";
import { XIcon } from "lucide-react";

interface NewGroupSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parentId: string | null;
  onCreateGroup: (name: string, parentId: string | null) => Promise<unknown>;
}

const formSchema = z.object({
  name: z.string().trim().min(1, "群組名稱為必填欄位"),
});

type FormValues = z.infer<typeof formSchema>;

export function NewGroupSheet({
  open,
  onOpenChange,
  parentId,
  onCreateGroup,
}: NewGroupSheetProps) {
  const [loading, setLoading] = useState(false);

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    try {
      await onCreateGroup(values.name, parentId);
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right">
        <FormBlock
          label="新增群組"
          description="在當前位置新增一個子群組，用來分類管理測試案例。"
          layout="vertical"
          formSchema={formSchema}
          defaultValues={{}}
          onSubmit={onSubmit}
          submitText={loading ? "建立中..." : "建立群組"}
          submitIcon="plus"
          footerFront={
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              <XIcon></XIcon>
              取消
            </Button>
          }
        >
          <FormField name="name" label="群組名稱" description="">
            <Input
              id="newSubgroupName"
              placeholder="例如: 帳戶中心"
              className="bg-zinc-950 border-zinc-850 text-zinc-100"
              autoFocus
            />
          </FormField>
        </FormBlock>
      </SheetContent>
    </Sheet>
  );
}
