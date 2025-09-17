import { useError } from "@/contexts";
import { useCallback, useEffect, useMemo, useState } from "react";
import { handleError as errorHandler, type HandleErrorOptions } from "@/utils/server/handleError";
import type { ServerSuccess } from "@/class/server/ServerSuccess";
import { createRequestHandler, type CreateReqHandlerOptions } from "@/services/requestHandler";
import { createMergeState } from "@/utils/hookUtils";
import { omit } from "@/utils/manipulate/object";
import type { OneFieldOnly } from "@/types";

type Stop = "stop" | Promise<"stop">;

type ReqHandlerInConfig<T> = Omit<CreateReqHandlerOptions<T>, "setLoading" | "setState">;
type FetchConfig<T> = {
  auto?: boolean;
  defaultValue?: T;
  onSuccess?: (res: ServerSuccess<T>) => any;
  handleError?: boolean | HandleErrorOptions;
  state?: [T, React.Dispatch<React.SetStateAction<T>>];
} & ReqHandlerInConfig<T> &
  OneFieldOnly<{ onError?: (err: unknown) => Stop | void; throwError?: boolean }>;

type DataType<T, C extends FetchConfig<T>> = C extends { auto?: true } ? T : T | undefined;

type FetchFunctionOptions<T> = ReqHandlerInConfig<T> & Pick<FetchConfig<T>, "handleError" | "throwError">;
type ResolveReturn<O, C, T> = O extends { onError: (...args: any) => Stop }
  ? Promise<T | undefined>
  : O extends { throwError: true }
  ? Promise<T>
  : C extends { throwError: true }
  ? Promise<T>
  : Promise<T | undefined>;
type FetchFunction<T, C extends FetchFunctionOptions<T>> = <O extends FetchFunctionOptions<T>>(options?: O) => ResolveReturn<O, C, ServerSuccess<T>>;

export function useFetch<T, C extends FetchConfig<T>>(fetcher: () => Promise<ServerSuccess<T>>, config?: C, deps: any[] = []) {
  const { auto = true, defaultValue, onError, state } = config || {};
  const internalData = useState<DataType<T, C>>(defaultValue as DataType<T, C>);
  const [data, setData] = state || internalData;
  const [loading, setLoading] = useState(false);
  const { setError, error } = useError();

  const mergeData = useMemo(() => createMergeState<DataType<T, C>, T>(setData as any), [setData]);

  const req = createRequestHandler({ setLoading, withLoad: true, setState: mergeData, ...omit(config || ({} as C), ["onError"]) }, fetcher);

  const run = useCallback(
    async (options?: FetchFunctionOptions<T>) => {
      const { handleError, throwError } = { ...config, ...options };
      try {
        const res = await req(options);
        return res;
      } catch (err) {
        if ((await onError?.(err)) === "stop") return;
        if (handleError) {
          errorHandler(err, setError, handleError === true ? undefined : handleError);
        }
        if (throwError) throw err;
      }
    },
    [config, onError, req, setError]
  ) as FetchFunction<T, C>;

  useEffect(() => {
    if (auto) run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auto, run, ...deps]);

  return {
    data,
    refetch: run,
    error,
    isLoading: loading,
  };
}
