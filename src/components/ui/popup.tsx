import { cn } from "@/lib/utils";
import type React from "react";

type Position = "center" | "bottom" | "top";

type PopupProps = {
  position?: Position | Position[];
  blur?: boolean;
  children: React.ReactNode;
  className?: string;
};

export const Popup = ({ position = "center", blur = false, className, children }: PopupProps) => {
  const arrPosition = position as Position[];

  return (
    <div
      className={cn(
        "fixed-center flex flex-col size-full z-[9999]",
        position === "center" && "justify-center items-center",
        position === "top" && "justify-start",
        position === "bottom" && "justify-end",
        arrPosition.some?.((p) => p === "center") && "justify-center items-center!",
        arrPosition.some?.((p) => p === "top") && "justify-start!",
        arrPosition.some?.((p) => p === "bottom") && "justify-end!",
        blur && "backdrop-blur-xs",
        className
      )}
    >
      {children}
    </div>
  );
};
