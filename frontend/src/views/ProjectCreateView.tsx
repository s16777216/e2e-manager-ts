import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProjectData } from "../hooks/useProjectData";
import { ProjectForm } from "../components/custom/ProjectForm";
import type { CookiesData, LocalStorageData, VariableItem } from "@/types/api";

export default function ProjectCreateView() {
  const navigate = useNavigate();
  const { handleCreateProject } = useProjectData();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (
    name: string,
    description: string,
    initCookies: CookiesData | null,
    initLocalStorage: LocalStorageData | null,
    variables?: Record<string, VariableItem>,
  ) => {
    setIsSubmitting(true);
    try {
      const p = await handleCreateProject(
        name,
        description,
        initCookies,
        initLocalStorage,
        variables,
      );
      if (p) {
        navigate(`/project/${p.id}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-zinc-950 text-foreground select-none p-8">
      <ProjectForm
        submitLabel="確定建立"
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
        onCancel={() => navigate("/project")}
      />
    </div>
  );
}
