import { Settings } from "lucide-react";
import { Button } from "../ui/button";
import { Link } from "react-router";
import { ThemeDropdown } from "./ThemeDropdown";
import { Search } from "./search/Search";
import { Nav } from "./Nav";
import { useHeader } from "@/contexts";
import { useViewportWidth } from "@/hooks/useViewport";
import { motion } from "motion/react";

export const Header = () => {
  const { headerHeight, headerRef, sidebarWidth } = useHeader();
  const { isDesktop } = useViewportWidth();

  return (
    <>
      <motion.header
        ref={headerRef}
        className="px-5 py-4 flex items-center gap-5 justify-between fixed w-full bg-background z-50 border-b-2 border-b-border right-0 transition-[top] duration-400"
        style={isDesktop ? { paddingLeft: sidebarWidth } : undefined}
      >
        <Nav />
        <Search />
        <div className="flex items-center gap-2">
          <ThemeDropdown />
          <Button variant={"outline"} asChild name="to-settings" role="link">
            <Link to={"/settings"} aria-label="Navigate to settings">
              <Settings />
            </Link>
          </Button>
        </div>
      </motion.header>
      <div style={{ height: headerHeight }} />
    </>
  );
};
