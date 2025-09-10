import { Header } from "@/components/header/Header";
import { useHeader } from "@/contexts";
import { useViewportWidth } from "@/hooks/useViewport";
import { useLayoutEffect, useState } from "react";
import { Outlet } from "react-router";

const useLayoutPaddingLeft = () => {
  const [paddingLeft, setPaddingLeft] = useState<undefined | number>(undefined);
  const { sidebar, sidebarRef, isAnimating } = useHeader();
  const { isDesktop } = useViewportWidth();

  useLayoutEffect(() => {
    if (sidebarRef.current && isDesktop) {
      setPaddingLeft(sidebarRef.current.getBoundingClientRect().width);
    }
  }, [sidebar, sidebarRef, isDesktop, isAnimating]);

  return { paddingLeft: paddingLeft && paddingLeft + 20, sidebar, isDesktop };
};

export const Layout = () => {
  const { sidebar, paddingLeft, isDesktop } = useLayoutPaddingLeft();

  return (
    <>
      <Header />
      <main
        className="transition-[padding] duration-400 md:px-7 md:pt-8 lg:px-10 lg:pt-11 px-5 pt-6"
        style={(isDesktop && (sidebar ? { paddingLeft } : { paddingLeft: "6.5%" })) || undefined}
      >
        <Outlet />
      </main>
    </>
  );
};
