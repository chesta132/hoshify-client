import { cn } from "@/lib/utils";
import type React from "react";
import { useEffect } from "react";

type Position = "center" | "bottom" | "top" | "left" | "right";

type PopupProps = {
  position?: Position | Position[];
  blur?: boolean;
  children: React.ReactNode;
  className?: string;
  bodyScroll?: boolean;
};

export const Popup = ({ position = "center", blur, className, children, bodyScroll }: PopupProps) => {
  useEffect(() => {
    if (!bodyScroll) {
      document.body.classList.add("overflow-hidden");
      return () => document.body.classList.remove("overflow-hidden");
    }
  }, [bodyScroll]);

  return (
    <div
      className={cn(
        "fixed-center flex flex-col size-full z-[9999]",
        position.includes("center") && "justify-center items-center",
        position.includes("top") && "justify-start",
        position.includes("bottom") && "justify-end",
        position.includes("left") && "items-start",
        position.includes("right") && "items-end",
        blur && "backdrop-blur-xs",
        className
      )}
    >
      {children}
    </div>
  );
};
