import { createBrowserRouter, Navigate } from "react-router-dom"
import RootLayout from "./layouts/RootLayout"
import ProjectLayout from "./layouts/ProjectLayout"
import WelcomeView from "./views/WelcomeView"
import SelectGroupPrompt from "./views/SelectGroupPrompt"
import GroupDashboardView from "./views/GroupDashboardView"
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
        path: "projects/:projectId",
        element: <ProjectLayout />,
        children: [
          {
            index: true,
            element: <SelectGroupPrompt />
          },
          {
            path: "groups/:groupId",
            element: <GroupDashboardView />
          }
        ]
      },
      {
        path: "runs/:runId",
        element: <SSEConsoleView />
      },
      {
        path: "*",
        element: <Navigate to="/" replace />
      }
    ]
  }
])
