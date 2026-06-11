import { Outlet, useOutletContext } from "react-router-dom"

export default function ProjectLayout() {
  const context = useOutletContext()
  return <Outlet context={context} />
}
