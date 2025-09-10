import { getForeground } from "@/utils/color";
import { changeColor } from "./AppearanceContext";

export type Accent = "default" | (string & {});

export const applyAccent = (accent: Accent) => {
  if (accent === "default") return;
  const root = window.document.documentElement;
  const accentForeground = getForeground(accent);

  changeColor();

  root.style.setProperty("--accent-foreground", accentForeground);
  root.style.setProperty("--accent", accent);
};
