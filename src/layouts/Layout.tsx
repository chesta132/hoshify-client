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
      <motion.main className="md:px-7 md:pt-10 px-5 pt-8" style={{ marginLeft: isDesktop ? sidebarWidth : 0 }}>
        <Outlet />
      </motion.main>
    </>
  );
};
