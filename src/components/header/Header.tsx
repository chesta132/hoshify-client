import { Settings } from "lucide-react";
import { Button } from "../ui/button";
import { Link } from "react-router";
import { ThemeDropdown } from "./ThemeDropdown";
import { Search } from "./Search";
import { Nav } from "./Nav";
import { useHeader } from "@/contexts";
import { useViewportWidth } from "@/hooks/useViewport";
import { motion } from "motion/react";

export const Header = () => {
  const { headerHeight, headerRef, sidebar, isAnimating, sidebarRef } = useHeader();
  const { isDesktop, width } = useViewportWidth();

  return (
    <>
      <motion.header
        ref={headerRef}
        className="px-5 py-4 flex items-center gap-5 justify-between fixed w-full bg-background z-50 transition-all duration-500 border-b-2 border-b-border right-0"
        animate={{
          width: (sidebar && isDesktop && !isAnimating && `${width - (sidebarRef.current?.getBoundingClientRect().width || 288)}px`) || "100%",
        }}
        transition={{ duration: 0.15 }}
      >
        <Nav />
        <Search />
        <div className="flex items-center gap-2">
          <ThemeDropdown />
          <Link to={"/settings"} aria-label="Navigate to settings" tabIndex={-1}>
            <Button variant={"outline"} name="to-settings" role="link">
              <Settings />
            </Button>
          </Link>
        </div>
      </motion.header>
      <div style={{ height: headerHeight }} />
    </>
  );
};
