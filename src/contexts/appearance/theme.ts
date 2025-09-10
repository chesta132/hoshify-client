import { changeColor } from "./AppearanceContext";

export type Theme = "dark" | "light" | "system";

export const applyTheme = (theme: Theme) => {
  const root = window.document.documentElement;
  changeColor();

  root.classList.remove("light", "dark");

  if (theme === "system") {
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    root.classList.add(systemTheme);
    return;
  }
  root.classList.add(theme);
};
