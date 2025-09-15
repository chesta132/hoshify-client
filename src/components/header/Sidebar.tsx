import { useHeader } from "@/contexts";
import { useViewportWidth } from "@/hooks/useViewport";
import { getLabelFromPath } from "@/utils/aria";
import { CalendarDays, CheckSquare, LayoutDashboard, NotebookText, Settings, Wallet2 } from "lucide-react";
import { motion } from "motion/react";
import { Link, useLocation } from "react-router";
import { useClickOutside } from "@/hooks/useEventListener";
import { SidebarToggle } from "./SidebarToggle";
import clsx from "clsx";
import { HoshifyLogo } from "../ui/logo";

type Pages = {
  path: string;
  label: string;
  icon: React.ReactNode;
}[];

export const Sidebar = () => {
  const { sidebarRef, setSidebar, headerRef, headerHeight, sidebar, sidebarWidth } = useHeader();
  const { isDesktop } = useViewportWidth();
  const location = useLocation();

  useClickOutside(headerRef, () => !isDesktop && setSidebar(false));

  const pages: Pages = [
    { path: "/", label: "Dashboard", icon: <LayoutDashboard size={19} /> },
    { path: "/todos", label: "To-Do List", icon: <CheckSquare size={19} /> },
    { path: "/notes", label: "Notes", icon: <NotebookText size={19} /> },
    { path: "/money", label: "Money", icon: <Wallet2 size={19} /> },
    { path: "/calendar", label: "Calendar", icon: <CalendarDays size={19} /> },
    { path: "/settings", label: "Settings", icon: <Settings size={19} /> },
  ];

  const logoOnly = isDesktop && !sidebar;

  return (
    <>
      <motion.div
        id="sidebar"
        ref={sidebarRef}
        className="fixed h-dvh bg-sidebar overflow-hidden"
        style={{ top: isDesktop ? 0 : headerHeight }}
        initial={{ left: "-50%" }}
        animate={{
          left: 0,
          width: logoOnly ? 80 : "min(50vw, 18rem)",
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        exit={{ left: "-50%" }}
        layoutRoot
        onUpdate={(latest) => {
          if (typeof latest.width === "number") {
            sidebarWidth.set(latest.width);
          } else {
            const width = sidebarRef.current?.getBoundingClientRect().width;
            if (width) {
              sidebarWidth.set(width);
            }
          }
        }}
      >
        <div
          className="border-b flex justify-between items-center relative"
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
            <HoshifyLogo />
            <h1 className="font-heading font-bold text-[18px] leading-4.5">Hoshify</h1>
          </motion.div>

          {isDesktop && (
            <motion.div
              layout
              className={logoOnly ? "absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center" : undefined}
              animate={{
                x: logoOnly ? 0 : undefined,
              }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <SidebarToggle />
            </motion.div>
          )}
        </div>

        <div className="mt-5 flex flex-col gap-2 my-5 relative overflow-hidden">
          <motion.div
            className="flex flex-col gap-2"
            animate={{
              x: logoOnly ? -300 : 0,
              opacity: logoOnly ? 0 : 1,
              visibility: logoOnly ? "hidden" : "visible",
            }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            {pages.map(({ icon, label, path }) => (
              <Link
                key={path}
                to={path}
                className={clsx(
                  "relative h-13 flex items-center focus:outline-0 focus:bg-sidebar-accent-foreground/10 hover:bg-sidebar-accent-foreground/10 transition-all duration-200",
                  location.pathname === path && "bg-sidebar-accent-foreground/15"
                )}
                onClick={(e) => {
                  if (location.pathname === path) {
                    window.scrollTo({
                      top: 0,
                      behavior: "smooth",
                    });
                  }
                  setSidebar((prev) => isDesktop && prev);
                  e.currentTarget.blur();
                }}
                aria-label={location.pathname === path ? `Back to top page of ${getLabelFromPath(path).toLowerCase()}` : getLabelFromPath(path)}
              >
                {location.pathname === path && (
                  <motion.div
                    layoutId="page-nav-highlight"
                    transition={{ duration: 0.2 }}
                    className="absolute bg-sidebar-accent-foreground w-1 h-full rounded-r-md"
                  />
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
              visibility: logoOnly ? "visible" : "hidden",
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
                  />
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
          <div className="size-5 flex items-center justify-center">
            <HoshifyLogo />
          </div>
        </motion.div>
      </motion.div>
    </>
  );
};
