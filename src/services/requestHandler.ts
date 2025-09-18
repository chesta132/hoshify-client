import { ServerError } from "@/class/server/ServerError";
import { ServerSuccess } from "@/class/server/ServerSuccess";
import { codeErrorAuth, type CodeAuthError } from "@/types/server/codes";
import { type NavigateFunction } from "react-router";

export type ReqHandlerOptions<D> = {
  setLoading?: React.Dispatch<React.SetStateAction<boolean>>;
  setState?: React.Dispatch<React.SetStateAction<D>>;
  withLoad?: boolean;
  directOnAuthError?: NavigateFunction;
};

export type CreateReqHandlerOptions<D> = {
  onFinally?: () => any;
  onSuccess?: (res: ServerSuccess<D>) => any;
  onError?: (err: unknown) => any;
} & ReqHandlerOptions<D>;

export const requestHandler = async <D>(reqCb: () => Promise<ServerSuccess<D>>, options?: ReqHandlerOptions<D>) => {
  const { setLoading, setState, directOnAuthError, withLoad } = options || {};
  try {
    if (withLoad) setLoading?.(true);
    const res = await reqCb();
    setState?.(res.data);
    return res;
  } catch (err) {
    if (err instanceof ServerError) {
      if (directOnAuthError && codeErrorAuth.includes(err.getCode() as CodeAuthError)) {
        if (window.location.pathname !== "/signin" && window.location.pathname !== "/signup") {
          directOnAuthError("/signin");
        }
      }
    }
    throw err;
  } finally {
    setLoading?.(false);
  }
};

export function createRequestHandler<S>(
  optionSchema: CreateReqHandlerOptions<S>
): <D extends S = S>(reqCb: () => Promise<ServerSuccess<D>>, options?: Partial<CreateReqHandlerOptions<D>>) => Promise<ServerSuccess<D>>;
export function createRequestHandler<S>(
  optionSchema: CreateReqHandlerOptions<S>,
  fetcher: () => Promise<ServerSuccess<S>>
): <D extends S = S>(options?: Partial<CreateReqHandlerOptions<D>>, reqCb?: () => Promise<ServerSuccess<D>>) => Promise<ServerSuccess<D>>;

export function createRequestHandler<S>(optionSchema: CreateReqHandlerOptions<S>, fetcher?: () => Promise<ServerSuccess<S>>) {
  const { onError, onSuccess, onFinally } = optionSchema;
  if (fetcher) {
    return <D = S>(options?: Partial<CreateReqHandlerOptions<D>>, reqCb?: () => Promise<ServerSuccess<D>>) => {
      const merged = { ...optionSchema, ...options } as CreateReqHandlerOptions<S>;
      return requestHandler(reqCb ?? (fetcher as any), merged)
        .then(onSuccess)
        .catch(onError)
        .finally(onFinally);
    };
  }

  return <D = S>(reqCb: () => Promise<ServerSuccess<D>>, options?: Partial<CreateReqHandlerOptions<D>>) => {
    const merged = { ...optionSchema, ...options } as CreateReqHandlerOptions<D>;
    return requestHandler(reqCb, merged)
      .then(onSuccess as any)
      .catch(onError)
      .finally(onFinally);
  };
}
