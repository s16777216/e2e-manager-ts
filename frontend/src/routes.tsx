import { createBrowserRouter, Navigate } from "react-router-dom"
import RootLayout from "./layouts/RootLayout"
import WelcomeView from "./views/WelcomeView"
import ProjectsView from "./views/ProjectsView"
import ProjectDetailView from "./views/ProjectDetailView"
import TestCaseDetailView from "./views/TestCaseDetailView"
import SSEConsoleView from "./views/SSEConsoleView"

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <WelcomeView />
      },
      {
        path: "project",
        element: <ProjectsView />
      },
      {
        path: "project/:projectId",
        element: <ProjectDetailView />
      },
      {
        path: "project/:projectId/testCase/:testCaseId",
        element: <TestCaseDetailView />
      },
      {
        path: "project/:projectId/run/:runId",
        element: <SSEConsoleView />
      },
      {
        path: "*",
        element: <Navigate to="/" replace />
      }
    ]
  }
])

