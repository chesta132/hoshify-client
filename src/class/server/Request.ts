import { type NavigateFunction } from "react-router";
import type { ServerSuccess } from "./ServerSuccess";
import { directOnAuthError, handleError, type HandleErrorOptions } from "@/utils/server/handleError";
import { type StateErrorServer } from "@/types/server";
import { ServerError } from "./ServerError";
import { createMergeState } from "@/utils/hookUtils";

export type Config<N> = {
  directOnAuthError?: N extends undefined ? never : boolean;
  handleError?: { setError: React.Dispatch<React.SetStateAction<StateErrorServer | null>> } & HandleErrorOptions;
  setLoading?: React.Dispatch<React.SetStateAction<boolean>>;
};
type StateSetter = "merge" | "state";
export type Retry = { counted: number; count: number; interval: number };

export class Request<
  T,
  A extends any[],
  E extends boolean = false,
  S extends undefined | StateSetter = undefined,
  N extends NavigateFunction | undefined = undefined
> {
  private _fetcher: (...args: A) => Promise<ServerSuccess<T>>;
  private _mergeState?: React.Dispatch<React.SetStateAction<T>>;
  private _setState?: React.Dispatch<React.SetStateAction<T>>;
  private _navigate?: N;
  private _config: Config<N> = {};
  private _throwError = false;
  private _onSuccess?: (response: ServerSuccess<T>) => any;
  private _onError?: (error: unknown) => any;
  private _onFinally?: () => any;
  private _retry?: Retry;

  constructor(fetcher: (...args: A) => Promise<ServerSuccess<T>>) {
    this._fetcher = fetcher;
    return this;
  }

  mergeState: S extends "state" ? never : (setState: React.Dispatch<React.SetStateAction<Partial<T>>>) => Omit<this, "mergeState"> = ((
    setState: React.Dispatch<React.SetStateAction<Partial<T>>>
  ) => {
    this._mergeState = createMergeState(setState);
    return this as Omit<this, "mergeState">;
  }) as any;

  setState: S extends "merge" ? never : (setState: React.Dispatch<React.SetStateAction<T>>) => Omit<this, "setState"> = ((
    setState: React.Dispatch<React.SetStateAction<T>>
  ) => {
    this._setState = setState;
    return this as Omit<this, "setState">;
  }) as any;

  navigate(navigate: NavigateFunction) {
    (this._navigate as any) = navigate;
    return this as Omit<Request<T, A, E, S, NavigateFunction>, "navigate">;
  }

  setConfig(config: Config<N>) {
    this._config = config;
    return this as Omit<this, "config">;
  }

  throwError<B extends boolean>(throwErr: B) {
    this._throwError = throwErr;
    return this as Omit<Request<T, A, B, S, N>, "throwError">;
  }

  onSuccess(cb: (response: ServerSuccess<T>) => any) {
    this._onSuccess = cb;
    return this as Omit<this, "onSuccess">;
  }

  onError(cb: (error: unknown) => any) {
    this._onError = cb;
    return this as Omit<this, "onError">;
  }

  onFinally(cb: () => any) {
    this._onFinally = cb;
    return this as Omit<this, "onFinally">;
  }

  retry(count: number, intervalMs: number) {
    this._retry = { count, counted: 0, interval: intervalMs };
    return this as Omit<this, "retry">;
  }

  exec: E extends false ? (...args: A) => Promise<ServerSuccess<T> | void> : (...args: A) => Promise<ServerSuccess<T>> = async (...args: A) => {
    const { _config, _fetcher, _navigate, _mergeState, _throwError, _onError, _onFinally, _onSuccess, _setState } = this;
    _config.setLoading?.(true);
    try {
      const res = await _fetcher(...args);
      if (_setState) _setState(res.data);
      else _mergeState?.(res.data);
      await _onSuccess?.(res);
      return res;
    } catch (err) {
      await _onError?.(err);
      if (err instanceof ServerError) {
        if (_config.directOnAuthError) {
          directOnAuthError(err, _navigate!);
        }
      }
      if (_config.handleError) {
        handleError(err, _config.handleError.setError, _config.handleError);
      }
      if (_throwError) throw err;
      return undefined as any;
    } finally {
      _config.setLoading?.(false);
      await _onFinally?.();
    }
  };
}
