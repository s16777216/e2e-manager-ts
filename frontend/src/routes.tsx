import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
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
import { projectLoader, testcaseLoader, taskLoader } from "./lib/loaders";
import { FoldersIcon } from "./components/icon/folders";
import { FolderPlusIcon } from "./components/icon/folder-plus";
import { HistoryIcon } from "./components/icon/history";
import { FileTextIcon } from "./components/icon/file-text";
import { SettingsIcon } from "./components/icon/settings";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <WelcomeView />,
      },
      {
        path: "project",
        element: <Outlet />,
        handle: {
          label: "專案管理",
          iconNode: <FoldersIcon size={14} />,
        } satisfies RouteHandle,
        children: [
          {
            index: true,
            element: <ProjectsView />,
          },
          {
            path: "new",
            element: <ProjectCreateView />,
            handle: {
              label: "建立新專案",
              iconNode: <FolderPlusIcon size={14} />,
            } satisfies RouteHandle,
          },
          {
            path: ":projectId",
            id: "project-root",
            loader: projectLoader,
            element: <Outlet />,
            handle: {
              label: (data) => data?.name ?? "載入中...",
            } satisfies RouteHandle<typeof projectLoader>,
            children: [
              {
                index: true,
                element: <ProjectDetailView />,
              },
              {
                path: "edit",
                element: <ProjectEditView />,
                handle: {
                  label: "編輯專案",
                  icon: "edit",
                } satisfies RouteHandle,
              },
              {
                path: "testCase/:testCaseId",
                loader: testcaseLoader,
                element: <TestCaseDetailView />,
                handle: {
                  label: (data) => data?.name ?? "載入中...",
                  iconNode: <FileTextIcon size={14} />,
                } satisfies RouteHandle<typeof testcaseLoader>,
              },
              {
                path: "run/:runId",
                element: <SSEConsoleView />,
                handle: {
                  label: (_data, params) => `執行 #${params.runId ? params.runId.substring(0, 8) : "..."}`,
                  icon: "play",
                } satisfies RouteHandle,
              },
              {
                path: "tasks/:taskId",
                loader: taskLoader,
                element: <TaskDetailView />,
                handle: {
                  label: (_data, params) => `批次 #${params.taskId ? params.taskId.substring(0, 8) : "..."}`,
                  iconNode: <HistoryIcon size={14} />,
                } satisfies RouteHandle<typeof taskLoader>,
              },
            ],
          },
        ],
      },
      {
        path: "tasks",
        element: <HistoryView />,
        handle: {
          label: "執行紀錄",
          iconNode: <HistoryIcon size={14} />,
        } satisfies RouteHandle,
      },
      {
        path: "settings",
        element: <SettingsView />,
        handle: {
          label: "系統設定",
          iconNode: <SettingsIcon size={14} />,
        } satisfies RouteHandle,
      },
      {
        path: "testform",
        element: <TestFormView />,
        handle: {
          label: "測試表單",
          icon: "test-tube",
        } satisfies RouteHandle,
      },
      {
        path: "*",
        element: <Navigate to="/" replace />,
      },
    ],
  },
]);
