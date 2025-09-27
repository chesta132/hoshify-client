import type { StateErrorServer } from "@/types/server/codes";
import { createContext, useCallback, useState } from "react";

export type GlobalError = StateErrorServer | null;
export type SetGlobalError = React.Dispatch<React.SetStateAction<GlobalError>>;

type ErrorValues = {
  error: GlobalError;
  setError: SetGlobalError;
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
  const [error, setError] = useState<GlobalError>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return <ErrorContext.Provider value={{ error, setError, clearError }}>{children}</ErrorContext.Provider>;
};
