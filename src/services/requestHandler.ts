import type { DataType, ReturnByDataType, ServerSuccess } from "@/class/server/ServerSuccess";

export type FetchPropsBase = { withLoad?: boolean; directOnError?: boolean };
export type FetchProps<T extends DataType> = FetchPropsBase & { dataType?: T };

export const requestHandler = async <D, T extends DataType>(
  reqCb: () => Promise<ServerSuccess<D>>,
  props?: FetchProps<T>,
  options?: {
    finallyCb?: () => any;
    successCb?: (res: ServerSuccess<D>) => any;
    errorCb?: (err: unknown) => any;
    setLoading?: React.Dispatch<React.SetStateAction<boolean>>;
    setState?: React.Dispatch<React.SetStateAction<D>>;
    stopOnErrorCb?: boolean;
  }
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
