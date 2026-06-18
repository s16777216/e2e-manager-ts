import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BaseDialog } from "./BaseDialog";

interface NewProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateProject: (name: string) => Promise<void>;
}

export function NewProjectDialog({
  open,
  onOpenChange,
  onCreateProject,
}: NewProjectDialogProps) {
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) return;
    setIsSubmitting(true);
    try {
      await onCreateProject(name);
      setName("");
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const dialogFooter = (
    <div className="flex justify-end gap-2 w-full">
      <Button
        variant="outline"
        onClick={() => onOpenChange(false)}
        className="border-zinc-800 text-zinc-300 hover:bg-zinc-950"
      >
        取消
      </Button>
      <Button
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="bg-zinc-100 text-zinc-950 hover:bg-zinc-200 font-semibold"
      >
        {isSubmitting ? "建立中..." : "確定建立"}
      </Button>
    </div>
  );

  return (
    <BaseDialog
      open={open}
      onOpenChange={onOpenChange}
      title="建立新專案"
      footer={dialogFooter}
      className="max-w-[425px]"
      height="auto"
    >
      <div className="flex flex-col gap-4 py-2">
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="newProjectName"
            className="text-xs font-bold text-muted-foreground uppercase tracking-wider"
          >
            專案名稱
          </label>
          <Input
            id="newProjectName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="例如: 公司後台測試"
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            className="bg-zinc-950 border-zinc-800 text-zinc-100"
          />
        </div>
      </div>
    </BaseDialog>
  );
}

