/* eslint-disable react-refresh/only-export-components */
import { useViewportWidth } from "@/hooks/useViewport";
import { createContext, useEffect, useLayoutEffect, useRef, useState } from "react";

type SidebarValues = {
  sidebar: boolean;
  setSidebar: React.Dispatch<React.SetStateAction<boolean>>;
  sidebarRef: React.RefObject<HTMLDivElement | null>;
  headerRef: React.RefObject<HTMLHeadElement | null>;
  headerHeight: number;
  isAnimating: boolean;
  setIsAnimating: React.Dispatch<React.SetStateAction<boolean>>;
};

const defaultRef = { current: null };

export const HeaderContext = createContext<SidebarValues>({
  sidebar: false,
  setSidebar: () => {},
  sidebarRef: defaultRef,
  headerRef: defaultRef,
  headerHeight: 0,
  isAnimating: false,
  setIsAnimating() {},
});

export const HeaderProvider = ({ children }: { children: React.ReactNode }) => {
  const { isDesktop } = useViewportWidth();

  const [sidebar, setSidebar] = useState(isDesktop);
  const [headerHeight, setHeaderHeight] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

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

  const values: SidebarValues = { headerHeight, headerRef, isAnimating, setIsAnimating, setSidebar, sidebar, sidebarRef };

  return <HeaderContext.Provider value={values}>{children}</HeaderContext.Provider>;
};
