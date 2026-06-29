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

export async function testcaseLoader({ params }: { params: any }) {
  try {
    const { testCaseId } = params;
    if (!testCaseId) return null;
    return await api.getTestcaseDetail(testCaseId);
  } catch (err) {
    console.error("testcaseLoader error:", err);
    return null;
  }
}

export async function taskLoader({ params }: { params: any }) {
  try {
    const { taskId } = params;
    if (!taskId) return null;
    return await api.getTask(taskId);
  } catch (err) {
    console.error("taskLoader error:", err);
    return null;
  }
}

