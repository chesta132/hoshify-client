import { SidebarIcon } from "lucide-react";
import { Button } from "../form/button";
import { useHeader } from "@/contexts";

export const SidebarToggle = ({ className }: { className?: string }) => {
  const { sidebar, setSidebar } = useHeader();

  return (
    <Button
      name="open-sidebar"
      aria-controls="sidebar"
      aria-expanded={sidebar}
      variant={sidebar ? "default" : "outline"}
      size="icon"
      onClick={() => setSidebar(!sidebar)}
      aria-label="Open sidebar"
      className={className}
    >
      <SidebarIcon />
    </Button>
  );
};
