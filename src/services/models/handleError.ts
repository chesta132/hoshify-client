import { ServerError } from "@/services/server/ServerError";
import { codeErrorAuth, type CodeAuthError, type StateErrorServer } from "@/types/server/codes";
import type { NavigateFunction } from "react-router";

export type HandleErrorOptions = { directOnAuthError?: NavigateFunction | boolean };

export const directOnAuthError = (err: ServerError, nav?: NavigateFunction) => {
  if (window.location.pathname !== "/signin" && window.location.pathname !== "/signup") {
    if (codeErrorAuth.includes(err.getCode() as CodeAuthError)) {
      if (nav) nav("/signin");
      else window.location.href = "/signin";
    }
  }
};

export const handleError = (err: unknown, setError: React.Dispatch<React.SetStateAction<StateErrorServer | null>>, options?: HandleErrorOptions) => {
  if (err instanceof ServerError) {
    const direct = options?.directOnAuthError;
    if (direct) {
      directOnAuthError(err, direct === true ? undefined : direct);
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
