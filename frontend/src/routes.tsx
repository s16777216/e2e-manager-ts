import { createBrowserRouter, Navigate, type Params } from "react-router-dom";
import RootLayout from "./layouts/RootLayout";
import WelcomeView from "./views/WelcomeView";
import ProjectsView from "./views/ProjectsView";
import ProjectDetailView from "./views/ProjectDetailView";
import TestCaseDetailView from "./views/TestCaseDetailView";
import SSEConsoleView from "./views/SSEConsoleView";
import TaskDetailView from "./views/TaskDetailView";
import HistoryView from "./views/HistoryView";
import ProjectCreateView from "./views/ProjectCreateView";
import ProjectEditView from "./views/ProjectEditView";
import SettingsView from "./views/SettingsView";
import TestFormView from "./views/TestFormView";

import type { RouteHandle } from "./types/breadcrumb";
import {
  projectLoader,
  projectAndTestcaseLoader,
  projectAndTaskLoader,
} from "./lib/loaders";
import { FoldersIcon } from "./components/icon/folders";
import { FolderPlusIcon } from "./components/icon/folder-plus";
import { HistoryIcon } from "./components/icon/history";
import { FileTextIcon } from "./components/icon/file-text";
import { SettingsIcon } from "./components/icon/settings";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    handle: {
      crumb: () => [],
    } satisfies RouteHandle,
    children: [
      {
        index: true,
        element: <WelcomeView />,
      },
      {
        path: "project",
        element: <ProjectsView />,
        handle: {
          crumb: () => [
            { label: "專案管理", iconNode: <FoldersIcon size={14} /> },
          ],
        } satisfies RouteHandle,
      },
      {
        path: "project/new",
        element: <ProjectCreateView />,
        handle: {
          crumb: () => [
            {
              label: "專案管理",
              to: "/project",
              iconNode: <FoldersIcon size={14} />,
            },
            { label: "建立新專案", iconNode: <FolderPlusIcon size={14} /> },
          ],
        } satisfies RouteHandle,
      },
      {
        path: "project/:projectId/edit",
        loader: projectLoader,
        element: <ProjectEditView />,
        handle: {
          crumb: (data, params) => [
            {
              label: "專案管理",
              to: "/project",
              iconNode: <FoldersIcon size={14} />,
            },
            {
              label: data?.name ?? "載入中...",
              to: `/project/${params.projectId}`,
            },
            { label: "編輯專案", icon: "edit" },
          ],
        } satisfies RouteHandle<typeof projectLoader>,
      },
      {
        path: "tasks",
        element: <HistoryView />,
        handle: {
          crumb: () => [
            { label: "執行紀錄", iconNode: <HistoryIcon size={14} /> },
          ],
        } satisfies RouteHandle,
      },
      {
        path: "project/:projectId",
        loader: projectLoader,
        element: <ProjectDetailView />,
        handle: {
          crumb: (data) => [
            {
              label: "專案管理",
              to: "/project",
              iconNode: <FoldersIcon size={14} />,
            },
            { label: data?.name ?? "載入中..." },
          ],
        } satisfies RouteHandle<typeof projectLoader>,
      },
      {
        path: "project/:projectId/testCase/:testCaseId",
        loader: projectAndTestcaseLoader,
        element: <TestCaseDetailView />,
        handle: {
          crumb: (
            data: Awaited<ReturnType<typeof projectAndTestcaseLoader>>,
            params: Params<string>,
          ) => [
            {
              label: "專案管理",
              to: "/project",
              iconNode: <FoldersIcon size={14} />,
            },
            {
              label: data?.project?.name ?? "載入中...",
              to: `/project/${params.projectId}`,
            },
            {
              label: data?.testcase?.name ?? "載入中...",
              iconNode: <FileTextIcon size={14} />,
            },
          ],
        } satisfies RouteHandle,
      },
      {
        path: "project/:projectId/run/:runId",
        loader: projectLoader,
        element: <SSEConsoleView />,
        handle: {
          crumb: (data, params) => [
            {
              label: "專案管理",
              to: "/project",
              iconNode: <FoldersIcon size={14} />,
            },
            {
              label: data?.name ?? "載入中...",
              to: `/project/${params.projectId}`,
            },
            {
              label: `執行 #${params.runId ? params.runId.substring(0, 8) : "..."}`,
              icon: "play",
            },
          ],
        } satisfies RouteHandle<typeof projectLoader>,
      },
      {
        path: "project/:projectId/tasks/:taskId",
        loader: projectAndTaskLoader,
        element: <TaskDetailView />,
        handle: {
          crumb: (data, params) => [
            {
              label: "專案管理",
              to: "/project",
              iconNode: <FoldersIcon size={14} />,
            },
            {
              label: data?.project?.name ?? "載入中...",
              to: `/project/${params.projectId}`,
            },
            {
              label: `批次 #${params.taskId ? params.taskId.substring(0, 8) : "..."}`,
              iconNode: <HistoryIcon size={14} />,
            },
          ],
        } satisfies RouteHandle<typeof projectAndTaskLoader>,
      },
      {
        path: "settings",
        element: <SettingsView />,
        handle: {
          crumb: () => [
            { label: "系統設定", iconNode: <SettingsIcon size={14} /> },
          ],
        } satisfies RouteHandle,
      },
      {
        path: "testform",
        element: <TestFormView />,
        handle: {
          crumb: () => [{ label: "測試表單", icon: "test-tube" }],
        } satisfies RouteHandle,
      },
      {
        path: "*",
        element: <Navigate to="/" replace />,
      },
    ],
  },
]);
