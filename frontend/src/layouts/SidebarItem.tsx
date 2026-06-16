import { useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { DynamicIcon, type IconName } from "lucide-react/dynamic";
import { SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";

interface SidebarItemProps {
  icon: IconName;
  children: React.ReactNode;
  path: string;
}

export default function SidebarItem(props: SidebarItemProps) {
  const { icon, children, path } = props;
  const location = useLocation();

  const isActive = useMemo(() => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  }, [location.pathname, path]);

  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={isActive}>
        <Link
          to={path}
          className="flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-lg"
        >
          {icon && <DynamicIcon name={icon} size={16} />}
          <span>{children}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}
