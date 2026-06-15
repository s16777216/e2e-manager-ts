import { useCallback, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { DynamicIcon, type IconName } from "lucide-react/dynamic";

interface SidebarItemProps {
  icon: IconName;
  label: string;
  path: string;
}

export default function SidebarItem(props: SidebarItemProps) {
  const { icon, label, path } = props;
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = useMemo(() => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  }, [location.pathname, path]);

  const onClick = useCallback(() => {
    navigate(path);
  }, [navigate, path]);

  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
        isActive
          ? "bg-accent text-accent-foreground border-l-2 border-primary"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      }`}
    >
      {icon && <DynamicIcon name={icon} size={16} />}
      <span>{label}</span>
    </button>
  );
}
