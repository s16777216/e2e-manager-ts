import { PanelLeftCloseIcon } from "@/components/icon/panel-left-close";
import { PanelLeftOpenIcon } from "@/components/icon/panel-left-open";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";

export default function CustomSidebarTrigger(
  props: React.ComponentProps<"button">,
) {
  const { toggleSidebar, open } = useSidebar();
  return (
    <Button {...props} onClick={toggleSidebar} variant="ghost">
      {open ? <PanelLeftCloseIcon /> : <PanelLeftOpenIcon />}
    </Button>
  );
}
