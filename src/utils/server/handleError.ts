import { ServerError } from "@/class/server/ServerError";
import { codeErrorAuth, type CodeAuthError, type StateErrorServer } from "@/types/server";
import type { NavigateFunction } from "react-router";

export type HandleErrorOptions = { directOnAuthError?: NavigateFunction };

export const directOnAuthError = (err: ServerError, nav: NavigateFunction) => {
  if (window.location.pathname !== "/signin" && window.location.pathname !== "/signup") {
    if (codeErrorAuth.includes(err.getCode() as CodeAuthError)) {
      nav("/signin");
    }
  }
};

export const handleError = (err: unknown, setError: React.Dispatch<React.SetStateAction<StateErrorServer | null>>, options?: HandleErrorOptions) => {
  if (err instanceof ServerError) {
    if (options?.directOnAuthError) {
      directOnAuthError(err, options.directOnAuthError);
    }
    err.setToState(setError);
  } else if (err instanceof Error) {
    if (err.message.includes("Network Error") || err.message.includes("fetch")) {
      setError({
        code: "BAD_GATEWAY",
        message: "Unable to connect to server. Please check your connection.",
        title: "Connection Error",
      });
    } else {
      setError({
        code: "SERVER_ERROR",
        message: err.message,
        title: "Oops! Something went wrong",
        details: err.stack,
      });
    }
  } else {
    setError({
      code: "SERVER_ERROR",
      title: "Oops! Something went wrong",
      message: "We encountered an unexpected error. Please try again or contact support if the problem persists.",
    });
  }
};

export const handleFormError = <T>(
  err: unknown,
  setFormError: React.Dispatch<React.SetStateAction<T>>,
  setError: React.Dispatch<React.SetStateAction<StateErrorServer | null>>,
  options?: HandleErrorOptions
) => {
  const field = err instanceof ServerError && err.getField();
  if (field) {
    setFormError((prev) => ({ ...prev, [field]: err.getMessage() }));
  } else handleError(err, setError, options);
};
