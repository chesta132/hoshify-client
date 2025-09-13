import { ServerSuccess, type DataType, type ReturnByDataType } from "@/class/server/ServerSuccess";
import type { StateErrorServer } from "@/types/server";
import { handleError } from "@/utils/server/handleError";

export type FetchProps<D, T extends DataType | undefined> = {
  withLoad?: boolean;
  directOnAuthError?: boolean;
  dataType?: T;
  throwOnError?: boolean;
  finallyCb?: () => any;
  successCb?: (res: ServerSuccess<D>) => any;
  errorCb?: (err: unknown) => any;
  setError?: React.Dispatch<React.SetStateAction<StateErrorServer | null>>;
};

export type ReqHandlerOptions<D> = {
  finallyCb?: () => any;
  successCb?: (res: ServerSuccess<D>) => any;
  errorCb?: (err: unknown) => any;
  setLoading?: React.Dispatch<React.SetStateAction<boolean>>;
  setState?: React.Dispatch<React.SetStateAction<D>>;
  setError?: React.Dispatch<React.SetStateAction<StateErrorServer | null>>;
  stopOnErrorCb?: boolean;
};

export const requestHandler = async <D, T extends DataType | undefined, P extends FetchProps<D, T>>(
  reqCb: () => Promise<ServerSuccess<D>>,
  props?: P,
  options?: ReqHandlerOptions<D>
): Promise<ReturnByDataType<T, D> | null> => {
  const { directOnAuthError, dataType, withLoad, throwOnError } = props || {};
  const { finallyCb, successCb, errorCb, setLoading, setState, setError, stopOnErrorCb } = options || {};
  try {
    if (withLoad) setLoading?.(true);
    const res = await reqCb();
    setState?.((prev) => ({ ...prev, ...res.getData() }));
    await successCb?.(res);
    await props?.successCb?.(res);
    return res.getByDataType(dataType);
  } catch (err) {
    if (throwOnError) throw err;
    await errorCb?.(err);
    await props?.errorCb?.(err);
    if (stopOnErrorCb && errorCb) return null;

    if (props?.setError) {
      handleError(err, props.setError);
    } else if (setError) {
      handleError(err, setError);
    }

    if (directOnAuthError) throw err;
    return null;
  } finally {
    setLoading?.(false);
    await finallyCb?.();
    await props?.finallyCb?.();
  }
};

export const createRequestHandler =
  <O>(optionSchema: ReqHandlerOptions<O>) =>
  async <D extends O, T extends DataType | undefined = undefined>(
    reqCb: () => Promise<ServerSuccess<D>>,
    props?: FetchProps<D, T>,
    options?: Partial<ReqHandlerOptions<D>>
  ): Promise<ReturnByDataType<T, D> | null> => {
    const merged: ReqHandlerOptions<D & O> = { ...optionSchema, ...options } as any;
    return requestHandler(reqCb, props, merged);
  };
