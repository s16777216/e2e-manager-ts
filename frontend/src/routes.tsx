import { createBrowserRouter, Navigate } from "react-router-dom"
import RootLayout from "./layouts/RootLayout"
import WelcomeView from "./views/WelcomeView"
import ProjectsView from "./views/ProjectsView"
import ProjectDetailView from "./views/ProjectDetailView"
import TestCaseDetailView from "./views/TestCaseDetailView"
import SSEConsoleView from "./views/SSEConsoleView"
import SelectGroupPrompt from "./views/SelectGroupPrompt"

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
        element: <ProjectDetailView />,
        children: [
          {
            index: true,
            element: <SelectGroupPrompt />
          },
          {
            path: "testCase/:testCaseId",
            element: <TestCaseDetailView />
          },
          {
            path: "run/:runId",
            element: <SSEConsoleView />
          }
        ]
      },
      {
        path: "*",
        element: <Navigate to="/" replace />
      }
    ]
  }
])


