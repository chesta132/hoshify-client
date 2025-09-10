import { useHeader } from "@/contexts";
import { useViewportWidth } from "@/hooks/useViewport";
import { getLabelFromPath } from "@/utils/aria";
import { Home, LucideOctagonX, Settings } from "lucide-react";
import { motion } from "motion/react";
import { Link, useLocation } from "react-router";
import { useClickOutside } from "@/hooks/useEventListener";
import { SidebarToggle } from "./SidebarToggle";
import clsx from "clsx";

type Pages = {
  path: string;
  label: string;
  icon: React.ReactNode;
}[];

export const Sidebar = () => {
  const { sidebarRef, setSidebar, headerRef, headerHeight, sidebar, setIsAnimating } = useHeader();
  const { isDesktop } = useViewportWidth();
  const location = useLocation();

  useClickOutside(headerRef, () => !isDesktop && setSidebar(false));

  const pages: Pages = [
    { path: "/", label: "Dashboard", icon: <Home size={19} /> },
    { path: "/settings", label: "Settings", icon: <Settings size={19} /> },
  ];

  const logoOnly = isDesktop && !sidebar;

  return (
    <>
      <motion.div
        id="sidebar"
        ref={sidebarRef}
        className="fixed h-dvh bg-sidebar-accent overflow-hidden"
        style={{ top: isDesktop ? 0 : headerHeight }}
        initial={{ left: "-50%" }}
        animate={{
          left: 0,
          width: logoOnly ? 80 : "min(50vw, 18rem)",
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        exit={{ left: "-50%" }}
        layout
        onAnimationStart={() => setIsAnimating(true)}
        onAnimationComplete={() => setIsAnimating(false)}
      >
        <div
          className="border-b flex justify-between items-center relative overflow-hidden"
          style={{
            height: isDesktop ? headerHeight : undefined,
            padding: logoOnly ? "0" : isDesktop ? "0 1.25rem" : "1.5rem 0.75rem",
          }}
        >
          <motion.div
            className="flex items-center gap-2"
            animate={{
              x: logoOnly ? -300 : 0,
              opacity: logoOnly ? 0 : 1,
            }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <LucideOctagonX />
            <h1 className="font-heading font-bold text-[18px] leading-4.5">Hoshify</h1>
          </motion.div>

          {isDesktop && (
            <div className={clsx(logoOnly && "absolute inset-0 flex items-center justify-center")}>
              <SidebarToggle />
            </div>
          )}
        </div>

        <div className="pt-5 flex flex-col gap-2 py-5 relative overflow-hidden">
          <motion.div
            className="flex flex-col gap-2"
            animate={{
              x: logoOnly ? -300 : 0,
              opacity: logoOnly ? 0 : 1,
            }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            {pages.map(({ icon, label, path }) => (
              <Link
                key={path}
                to={path}
                className={clsx(
                  "relative h-15 flex items-center focus:outline-0 focus:bg-sidebar-accent-foreground/10 hover:bg-sidebar-accent-foreground/10 transition-all duration-200"
                )}
                onClick={() => setSidebar((prev) => isDesktop && prev)}
                aria-label={getLabelFromPath(path)}
              >
                {location.pathname === path && (
                  <motion.div
                    layoutId="page-nav-highlight"
                    transition={{ duration: 0.2 }}
                    className="absolute bg-sidebar-accent-foreground w-1 h-full rounded-r-md"
                  ></motion.div>
                )}
                <div className="px-5 flex gap-2 items-center">
                  {icon}
                  <span className="font-bold text-[14px]">{label}</span>
                </div>
              </Link>
            ))}
          </motion.div>

          <motion.div
            className="absolute inset-0 pt-5 flex flex-col gap-4 items-center"
            animate={{
              opacity: logoOnly ? 1 : 0,
              x: logoOnly ? 0 : 300,
            }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            {pages.map(({ icon, label, path }) => (
              <Link
                key={`logo-${path}`}
                to={path}
                className={clsx(
                  "relative w-12 h-12 flex items-center justify-center rounded-lg focus:outline-0 focus:bg-sidebar-accent-foreground/10 hover:bg-sidebar-accent-foreground/10 transition-all duration-200",
                  location.pathname === path && "bg-sidebar-accent-foreground/8"
                )}
                onClick={() => setSidebar((prev) => isDesktop && prev)}
                aria-label={getLabelFromPath(path)}
                title={label}
              >
                {icon}
                {location.pathname === path && (
                  <motion.div
                    layoutId="page-nav-highlight-logo"
                    transition={{ duration: 0.2 }}
                    className="absolute -left-4 bg-sidebar-accent-foreground w-1 h-8 rounded-r-md"
                  ></motion.div>
                )}
              </Link>
            ))}
          </motion.div>
        </div>

        <motion.div
          className="absolute bottom-0 left-0 right-0 mb-5 flex justify-center"
          animate={{
            opacity: logoOnly ? 1 : 0,
            y: logoOnly ? 0 : 50,
          }}
          transition={{ duration: 0.3, ease: "easeInOut", delay: logoOnly ? 0.1 : 0 }}
        >
          <div className="w-8 h-8 flex items-center justify-center">
            <LucideOctagonX size={20} />
          </div>
        </motion.div>
      </motion.div>
    </>
  );
};
