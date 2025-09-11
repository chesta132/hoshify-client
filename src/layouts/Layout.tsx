import { Header } from "@/components/header/Header";
import { useHeader } from "@/contexts";
import { useViewportWidth } from "@/hooks/useViewport";
import { Outlet } from "react-router";
import { motion } from "motion/react";

export const Layout = () => {
  const { isDesktop } = useViewportWidth();
  const { sidebarWidth } = useHeader();

  return (
    <>
      <Header />
      <motion.main className="md:px-7 md:pt-8 lg:pt-11 px-5 pt-6" style={isDesktop ? { marginLeft: sidebarWidth } : undefined}>
        <Outlet />
      </motion.main>
    </>
  );
};
