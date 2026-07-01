import { FormBlock } from "@/components/custom/form";
import Typography from "@/components/custom/Typography";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2 } from "lucide-react";
import ProjectFormProjectDeleteDialog from "./ProjectFormProjectDeleteDialog";
import { useState } from "react";

interface ProjectFormDangerBlockProps {
  projectName: string;
  onProjectDelete: () => void | Promise<void>;
}

export default function ProjectFormDangerBlock({
  projectName,
  onProjectDelete,
}: ProjectFormDangerBlockProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteProject = async () => {
    setIsDeleting(true);
    try {
      await onProjectDelete();
    } catch (error) {
      console.error(error);
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  return (
    <>
      <FormBlock
        label={
          <Typography type="h5" className="text-red-400">
            危險區域
          </Typography>
        }
        description="此處的操作具備破壞性且不可逆，請謹慎執行。"
        onSubmit={() => {}}
        showSubmitButton={false}
      >
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
                variant="destructive"
                onClick={() => setIsDeleteDialogOpen(true)}
              >
                <Trash2 size={16} className="mr-2" />
                刪除專案
              </Button>
            </div>
          </CardContent>
        </Card>
      </FormBlock>
      <ProjectFormProjectDeleteDialog
        projectName={projectName}
        onProjectDelete={handleDeleteProject}
        isDialogOpen={isDeleteDialogOpen}
        setDialogOpen={setIsDeleteDialogOpen}
        isDeleting={isDeleting}
      />
    </>
  );
}
