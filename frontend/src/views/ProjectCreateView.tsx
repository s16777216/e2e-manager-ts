import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProjectData } from "../hooks/useProjectData";
import { ProjectForm } from "../components/custom/ProjectForm";
import type { CookiesData, LocalStorageData } from "@/types/api";

export default function ProjectCreateView() {
  const navigate = useNavigate();
  const { handleCreateProject } = useProjectData();
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      const p = await handleCreateProject(
        name,
        description,
        initCookies,
        initLocalStorage,
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
