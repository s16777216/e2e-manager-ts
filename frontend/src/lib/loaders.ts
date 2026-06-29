import { api } from "./api";

export async function projectLoader({ params }: { params: any }) {
  try {
    const projectId = params.projectId;
    if (!projectId) return null;
    const projects = await api.getProjects();
    return projects.find((p) => p.id === projectId) || null;
  } catch (err) {
    console.error("projectLoader error:", err);
    return null;
  }
}

export async function projectAndTestcaseLoader({ params }: { params: any }) {
  try {
    const { projectId, testCaseId } = params;
    if (!projectId || !testCaseId) return null;
    const [projects, testcase] = await Promise.all([
      api.getProjects(),
      api.getTestcaseDetail(testCaseId),
    ]);
    const project = projects.find((p) => p.id === projectId) || null;
    return { project, testcase };
  } catch (err) {
    console.error("projectAndTestcaseLoader error:", err);
    return null;
  }
}

export async function projectAndTaskLoader({ params }: { params: any }) {
  try {
    const { projectId, taskId } = params;
    if (!projectId || !taskId) return null;
    const [projects, task] = await Promise.all([
      api.getProjects(),
      api.getTask(taskId),
    ]);
    const project = projects.find((p) => p.id === projectId) || null;
    return { project, task };
  } catch (err) {
    console.error("projectAndTaskLoader error:", err);
    return null;
  }
}
