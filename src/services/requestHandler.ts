import { ServerError } from "@/class/server/ServerError";
import { ServerSuccess, type DataType, type ReturnByDataType } from "@/class/server/ServerSuccess";
import { codeErrorAuth, type CodeAuthError, type StateErrorServer } from "@/types/server";
import { handleError } from "@/utils/server/handleError";
import { type NavigateFunction } from "react-router";

export type ReqHandlerOptions<D, T extends DataType> = {
  finallyCb?: () => any;
  successCb?: (res: ServerSuccess<D>) => any;
  errorCb?: (err: unknown) => "stop" | (any & {});
  setLoading?: React.Dispatch<React.SetStateAction<boolean>>;
  setState?: React.Dispatch<React.SetStateAction<D>>;
  setError?: React.Dispatch<React.SetStateAction<StateErrorServer | null>>;
  withLoad?: boolean;
  directOnAuthError?: NavigateFunction;
  dataType?: T;
};

export const requestHandler = async <D, T extends DataType>(
  reqCb: () => Promise<ServerSuccess<D>>,
  options?: ReqHandlerOptions<D, T>
): Promise<ReturnByDataType<T, D>> => {
  const { finallyCb, successCb, errorCb, setLoading, setState, setError, directOnAuthError, dataType, withLoad } = options || {};
  const navigate = directOnAuthError;
  try {
    if (withLoad) setLoading?.(true);
    const res = await reqCb();
    setState?.(res.getData());
    await successCb?.(res);
    return res.getByDataType(dataType);
  } catch (err) {
    await errorCb?.(err);
    if (setError) handleError(err, setError);

    if (err instanceof ServerError) {
      if (directOnAuthError && codeErrorAuth.includes(err.getCode() as CodeAuthError)) {
        if (window.location.pathname !== "/signin" && window.location.pathname !== "/signup") {
          navigate?.("/");
        }
      }
    }
    throw err;
  } finally {
    setLoading?.(false);
    await finallyCb?.();
  }
};

export const createRequestHandler = <S>(optionSchema: ReqHandlerOptions<S, DataType>) => {
  return async <D extends S, T extends DataType>(
    reqCb: () => Promise<ServerSuccess<D>>,
    options?: Partial<ReqHandlerOptions<D, T>>
  ): Promise<ReturnByDataType<T, D>> => {
    const merged = { ...optionSchema, ...options } as ReqHandlerOptions<D, T>;
    return requestHandler<D, T>(reqCb, merged);
  };
};
