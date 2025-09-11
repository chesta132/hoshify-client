/* eslint-disable react-refresh/only-export-components */
import { useViewportWidth } from "@/hooks/useViewport";
import { MotionValue } from "motion";
import { useMotionValue } from "motion/react";
import { createContext, useEffect, useLayoutEffect, useRef, useState } from "react";

type SidebarValues = {
  sidebar: boolean;
  setSidebar: React.Dispatch<React.SetStateAction<boolean>>;
  sidebarRef: React.RefObject<HTMLDivElement | null>;
  headerRef: React.RefObject<HTMLHeadElement | null>;
  headerHeight: number;
  sidebarWidth: MotionValue<number>;
};

const defaultRef = { current: null };

export const HeaderContext = createContext<SidebarValues>({
  sidebar: false,
  setSidebar: () => {},
  sidebarRef: defaultRef,
  headerRef: defaultRef,
  headerHeight: 0,
  sidebarWidth: new MotionValue(0),
});

export const HeaderProvider = ({ children }: { children: React.ReactNode }) => {
  const { isDesktop } = useViewportWidth();

  const [sidebar, setSidebar] = useState(isDesktop);
  const [headerHeight, setHeaderHeight] = useState(0);
  const sidebarWidth = useMotionValue(0);

  const sidebarRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLHeadElement>(null);

  useEffect(() => {
    setSidebar((prev) => {
      if (isDesktop || prev) return true;
      return false;
    });
  }, [isDesktop]);

  useLayoutEffect(() => {
    if (headerRef.current) {
      setHeaderHeight(headerRef.current.getBoundingClientRect().height);
    }
  }, [headerRef]);

  const values: SidebarValues = { headerHeight, headerRef, setSidebar, sidebar, sidebarRef, sidebarWidth };

  return <HeaderContext.Provider value={values}>{children}</HeaderContext.Provider>;
};
