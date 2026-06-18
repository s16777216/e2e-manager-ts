import { useState, useEffect } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { useProjectData } from "../hooks/useProjectData";
import { ProjectForm } from "../components/custom/ProjectForm";
import { Sparkles } from "lucide-react";
import Typography from "../components/custom/Typography";
import type { CookiesData, LocalStorageData } from "@/types/api";

interface BreadcrumbItem {
  label: string;
  to?: string;
}

interface OutletContextType {
  setBreadcrumbs: (crumbs: BreadcrumbItem[]) => void;
}

export default function ProjectCreateView() {
  const navigate = useNavigate();
  const { setBreadcrumbs } = useOutletContext<OutletContextType>();
  const { handleCreateProject } = useProjectData();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    Promise.resolve().then(() => {
      setBreadcrumbs([
        { label: "專案管理", to: "/project" },
        { label: "建立新專案" },
      ]);
    });
    return () => {
      Promise.resolve().then(() => {
        setBreadcrumbs([]);
      });
    };
  }, [setBreadcrumbs]);

  const handleSubmit = async (
    name: string,
    description: string,
    initCookies: CookiesData | null,
    initLocalStorage: LocalStorageData | null,
  ) => {
    setIsSubmitting(true);
    try {
      // 這裡需要修改 handleCreateProject 的實作以支援這四個參數，或者呼叫 API 建立後再更新。
      // 等等，讓我們確認 handleCreateProject 原本的定義是否只有 name，或者 handleCreateProject 本身就支持多個參數？
      // 我們來確認一下 useProjectData.ts 中的 handleCreateProject 定義。
      const p = await handleCreateProject(name, description, initCookies, initLocalStorage);
      if (p) {
        navigate(`/project/${p.id}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-zinc-950 text-foreground overflow-y-auto select-none p-8">
      {/* 頂部 Header */}
      <div className="max-w-xl w-full mx-auto flex flex-col items-start gap-2 mb-6">
        <Typography
          type="h2"
          className="border-b-0 pb-0 bg-gradient-to-r from-zinc-100 via-zinc-300 to-zinc-500 bg-clip-text text-transparent flex items-center gap-2"
        >
          <Sparkles size={20} className="text-primary animate-pulse" />
          建立新專案
        </Typography>
        <Typography type="muted" className="text-zinc-400 leading-relaxed">
          填寫下方的名稱、描述，並可選擇性預配置 Cookies 與 LocalStorage，來為您的新測試專案進行初始化。
        </Typography>
      </div>

      <ProjectForm
        submitLabel="確定建立"
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
        onCancel={() => navigate("/project")}
      />
    </div>
  );
}
