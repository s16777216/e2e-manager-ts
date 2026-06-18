import { useState, useEffect } from "react";
import { useNavigate, useParams, useOutletContext } from "react-router-dom";
import { useProjectData } from "../hooks/useProjectData";
import { ProjectForm } from "../components/custom/ProjectForm";
import { Sparkles, Loader2 } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  to?: string;
}

interface OutletContextType {
  setBreadcrumbs: (crumbs: BreadcrumbItem[]) => void;
}

export default function ProjectEditView() {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const { setBreadcrumbs } = useOutletContext<OutletContextType>();
  const { projects, handleUpdateProject, handleDeleteProject, isLoading } = useProjectData();
  const [isSaving, setIsSaving] = useState(false);

  const activeProject = projects.find((p) => p.id === projectId);

  useEffect(() => {
    if (activeProject) {
      setBreadcrumbs([
        { label: "專案管理", to: "/project" },
        { label: activeProject.name, to: `/project/${activeProject.id}` },
        { label: "編輯專案" },
      ]);
    } else {
      setBreadcrumbs([
        { label: "專案管理", to: "/project" },
        { label: "載入中..." },
      ]);
    }
    return () => {
      setBreadcrumbs([]);
    };
  }, [activeProject, setBreadcrumbs]);

  const handleSubmit = async (
    name: string,
    description: string,
    initCookies: any,
    initLocalStorage: any,
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

  if (isLoading && !activeProject) {
    return (
      <div className="flex-1 flex items-center justify-center bg-zinc-950 text-zinc-400">
        <Loader2 className="animate-spin mr-2" size={20} />
        載入專案資料中...
      </div>
    );
  }

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
    <div className="flex-1 flex flex-col bg-zinc-950 text-foreground overflow-y-auto select-none p-8">
      {/* 頂部 Header */}
      <div className="max-w-xl w-full mx-auto flex flex-col items-start gap-2 mb-6">
        <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-zinc-100 via-zinc-300 to-zinc-500 bg-clip-text text-transparent flex items-center gap-2">
          <Sparkles size={20} className="text-primary animate-pulse" />
          編輯專案資訊
        </h2>
        <p className="text-zinc-400 text-sm leading-relaxed">
          修改專案的名稱與描述，或在進階設定中更新 Cookies 與 LocalStorage 的預配置。
        </p>
      </div>

      <ProjectForm
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
