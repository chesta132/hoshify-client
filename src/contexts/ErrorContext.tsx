import type { StateErrorServer } from "@/types/server";
import { createContext, useCallback, useState } from "react";

type ErrorValues = {
  error: StateErrorServer | null;
  setError: React.Dispatch<React.SetStateAction<StateErrorServer | null>>;
  clearError: () => void;
};

const defaultValues: ErrorValues = {
  error: null,
  setError() {},
  clearError() {},
};

// eslint-disable-next-line react-refresh/only-export-components
export const ErrorContext = createContext<ErrorValues>(defaultValues);

export const ErrorProvider = ({ children }: { children: React.ReactNode }) => {
  const [error, setError] = useState<StateErrorServer | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return <ErrorContext.Provider value={{ error, setError, clearError }}>{children}</ErrorContext.Provider>;
};
