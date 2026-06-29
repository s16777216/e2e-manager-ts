import { useState } from "react";
import { useNavigate, useParams, useLoaderData } from "react-router-dom";
import { useProjectData } from "../hooks/useProjectData";
import { ProjectForm } from "../components/custom/ProjectForm";
import type { CookiesData, LocalStorageData, Project } from "@/types/api";

export default function ProjectEditView() {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const activeProject = useLoaderData() as Project | null;
  const { handleUpdateProject, handleDeleteProject } = useProjectData();
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (
    name: string,
    description: string,
    initCookies: CookiesData | null,
    initLocalStorage: LocalStorageData | null,
  ) => {
    if (!activeProject) return;
    setIsSaving(true);
    try {
      await handleUpdateProject(
        activeProject.id,
        name,
        description,
        initCookies,
        initLocalStorage,
      );
      navigate(`/project/${activeProject.id}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!activeProject) return;
    const success = await handleDeleteProject(activeProject.id);
    if (success) {
      navigate("/project");
    }
  };

  if (!activeProject) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-zinc-950 text-zinc-400 gap-4">
        <div>找不到指定的專案。</div>
        <button
          onClick={() => navigate("/project")}
          className="text-zinc-100 hover:underline text-sm font-medium"
        >
          返回專案列表
        </button>
      </div>
    );
  }

  const initialFormVal = {
    name: activeProject.name,
    description: activeProject.description || "",
    initCookies: activeProject.initCookies || null,
    initLocalStorage: activeProject.initLocalStorage || null,
  };

  return (
    <div className="flex-1 flex flex-col bg-zinc-950 text-foreground select-none p-8">
      <ProjectForm
        key={activeProject.id}
        initialData={initialFormVal}
        submitLabel="儲存修改"
        isSubmitting={isSaving}
        onSubmit={handleSubmit}
        onCancel={() => navigate(`/project/${activeProject.id}`)}
        onDelete={handleDelete}
      />
    </div>
  );
}
