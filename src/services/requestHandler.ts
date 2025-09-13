import type { DataType, ReturnByDataType, ServerSuccess } from "@/class/server/ServerSuccess";

export type FetchProps<T extends DataType | undefined> = { withLoad?: boolean; directOnError?: boolean; dataType?: T };
export type ReqHandlerOptions<D> = {
  finallyCb?: () => any;
  successCb?: (res: ServerSuccess<D>) => any;
  errorCb?: (err: unknown) => any;
  setLoading?: React.Dispatch<React.SetStateAction<boolean>>;
  setState?: React.Dispatch<React.SetStateAction<D>>;
  stopOnErrorCb?: boolean;
};

export const requestHandler = async <D, T extends DataType | undefined>(
  reqCb: () => Promise<ServerSuccess<D>>,
  props?: FetchProps<T>,
  options?: ReqHandlerOptions<D>
): Promise<ReturnByDataType<T, D> | null> => {
  const { directOnError, dataType, withLoad } = props || {};
  const { finallyCb, successCb, errorCb, setLoading, setState, stopOnErrorCb } = options || {};
  try {
    if (withLoad) setLoading?.(true);
    const res = await reqCb();
    setState?.((prev) => ({ ...prev, ...res.getData() }));
    await successCb?.(res);
    return res.getByDataType(dataType);
  } catch (err) {
    await errorCb?.(err);
    if (stopOnErrorCb && errorCb) return null;
    // WIP HANDLE ERROR
    if (directOnError) throw err;
    return null;
  } finally {
    setLoading?.(false);
    await finallyCb?.();
  }
};

export const createRequestHandler =
  <O>(optionSchema: ReqHandlerOptions<O>) =>
  async <D extends O, T extends DataType | undefined = undefined>(
    reqCb: () => Promise<ServerSuccess<D>>,
    props?: FetchProps<T>,
    options?: Partial<ReqHandlerOptions<D>>
  ): Promise<ReturnByDataType<T, D> | null> => {
    const merged: ReqHandlerOptions<D & O> = { ...optionSchema, ...options } as any;
    return requestHandler(reqCb, props, merged);
  };
