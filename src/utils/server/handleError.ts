import { ServerError } from "@/class/server/ServerError";
import { codeErrorAuth, type CodeAuthError, type StateErrorServer } from "@/types/server";

type HandleErrorOptions = { directIfAuth?: boolean };

export const handleError = (err: unknown, setError: React.Dispatch<React.SetStateAction<StateErrorServer | null>>, options?: HandleErrorOptions) => {
  if (err instanceof ServerError) {
    if (options?.directIfAuth) {
      if (codeErrorAuth.includes(err.getCode() as CodeAuthError)) {
        window.location.href = "/signin";
        return;
      }
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
        title: "Error",
        details: err.stack,
      });
    }
  } else {
    setError({
      code: "SERVER_ERROR",
      message: "Something went wrong. Please try again.",
      title: "Unknown Error",
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
