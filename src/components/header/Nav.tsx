import { useEffect } from "react";
import { useScrollingHeader } from "@/hooks/useScrollingHeader";
import { Sidebar } from "./Sidebar";
import { useHeader } from "@/contexts";
import { useViewportWidth } from "@/hooks/useViewport";
import { SidebarToggle } from "./SidebarToggle";
import { AnimatePresence } from "motion/react";

export const Nav = () => {
  const { setSidebar, sidebar } = useHeader();
  const timelineStatus = useScrollingHeader();
  const { isMobile, isDesktop } = useViewportWidth();

  useEffect(() => {
    if (!timelineStatus && isMobile) {
      setSidebar(false);
    }
  }, [setSidebar, timelineStatus, isMobile]);

  return (
    <nav>
      {!isDesktop && <SidebarToggle />}
      <AnimatePresence>{isDesktop ? <Sidebar /> : sidebar && <Sidebar />}</AnimatePresence>
    </nav>
  );
};
