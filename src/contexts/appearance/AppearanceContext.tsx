/* eslint-disable react-refresh/only-export-components */
import { createContext, useEffect, useLayoutEffect, useMemo, useState } from "react";
import { applyTheme, type Theme } from "./theme";
import { applyAccent, type Accent } from "./accent";

export type Appearance = { theme: Theme; accent: Accent };

type AppearanceProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type AppearanceValues = {
  appearance: Appearance;
  setTheme: React.Dispatch<React.SetStateAction<Theme>>;
  setAccent: React.Dispatch<React.SetStateAction<Accent>>;
} & Appearance;

const defaultValue: Appearance = {
  theme: "system",
  accent: "default",
};

const initialState: AppearanceValues = {
  ...defaultValue,
  setTheme: () => {},
  setAccent: () => {},
  appearance: defaultValue,
};

export const changeColor = () => {
  document.body.classList.add("change-theme");
  setTimeout(() => {
    document.body.classList.remove("change-theme");
  }, 500);
};

export const AppearanceContext = createContext<AppearanceValues>(initialState);

export function AppearanceProvider({ children, storageKey = "appearance", ...props }: AppearanceProviderProps) {
  const local = JSON.parse(localStorage.getItem(storageKey) || "null") as Appearance | null;
  const [theme, setTheme] = useState(local?.theme || defaultValue.theme);
  const [accent, setAccent] = useState(local?.accent || defaultValue.accent);
  const appearance = useMemo((): Appearance => ({ theme, accent }), [theme, accent]);

  useLayoutEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useLayoutEffect(() => {
    applyAccent(accent);
  }, [accent]);

  useEffect(() => {
    if (!local) {
      localStorage.setItem(storageKey, JSON.stringify(defaultValue));
    } else if (!Object.compare(local, appearance)) {
      localStorage.setItem(storageKey, JSON.stringify(appearance));
    }
  }, [appearance, storageKey, local]);

  const value = {
    appearance,
    theme,
    accent,
    setTheme,
    setAccent,
  };

  return (
    <AppearanceContext.Provider {...props} value={value}>
      {children}
    </AppearanceContext.Provider>
  );
}
