import { type NavigateFunction } from "react-router";
import type { ServerSuccess } from "./ServerSuccess";
import { directOnAuthError, handleError, type HandleErrorOptions } from "@/utils/server/handleError";
import { type StateErrorServer } from "@/types/server";
import { ServerError } from "./ServerError";
import { createMergeState } from "@/utils/hookUtils";

export type Config<N> = {
  directOnAuthError?: N extends undefined ? never : boolean;
  handleError?: { setError: React.Dispatch<React.SetStateAction<StateErrorServer | null>> } & HandleErrorOptions;
  withLoad?: boolean;
};
export type Retry = { counted: number; count: number; interval: number };
export type RequestFetcher<T, A extends any[]> = (controller: AbortController, ...args: A) => Promise<ServerSuccess<T>>;
export type SafeExcResult<T> = { ok: true; data: T } | { ok: false; error: unknown };

export class Request<T, A extends any[] = [], N extends NavigateFunction | undefined = undefined> {
  private _fetcher: RequestFetcher<T, A>;
  private _setState?: React.Dispatch<React.SetStateAction<T>>;
  private _navigate?: N;
  private _config: Config<N> = {};
  private _onSuccess?: (response: ServerSuccess<T>) => any;
  private _onError?: (error: unknown) => any;
  private _onFinally?: () => any;
  private _retry?: Retry;
  private _transform?: (res: ServerSuccess<T>) => ServerSuccess<T>;
  private _setLoading?: React.Dispatch<React.SetStateAction<boolean>>;
  private _controller = new AbortController();

  constructor(fetcher: RequestFetcher<T, A>) {
    this._fetcher = fetcher;
  }

  static from<T, A extends any[] = [], N extends NavigateFunction | undefined = undefined>(instance: Request<T, A, N>) {
    return instance.clone();
  }

  clone<NT = T, NA extends any[] = A>(fetcher?: RequestFetcher<NT, NA>) {
    const newInstance = new Request<NT, NA, N>((fetcher as any) ?? this._fetcher);
    const unclonable = ["_fetcher", "_controller"];
    Object.getOwnPropertyNames(this).forEach((key) => {
      if (!unclonable.includes(key)) {
        (newInstance as any)[key] = (this as any)[key];
      }
    });
    return newInstance;
  }

  setFetcher<NT, NA extends any[]>(fetcher: RequestFetcher<NT, NA>) {
    this._fetcher = fetcher as any;
    return this as unknown as Request<NT, NA, N>;
  }

  mergeState<S extends T>(setState: React.Dispatch<React.SetStateAction<S>>) {
    this._setState = createMergeState(setState) as React.Dispatch<React.SetStateAction<T>>;
    return this;
  }

  setState(setState: React.Dispatch<React.SetStateAction<T>>) {
    this._setState = setState;
    return this;
  }

  navigate(navigate: NavigateFunction) {
    this._navigate = navigate as N;
    return this as Request<T, A, NavigateFunction>;
  }

  setConfig(config: Config<N>) {
    this._config = { ...this._config, ...config };
    return this;
  }

  setLoading(setLoading: React.Dispatch<React.SetStateAction<boolean>>) {
    this._setLoading = setLoading;
    return this;
  }

  onSuccess(cb: (response: ServerSuccess<T>) => any) {
    this._onSuccess = cb;
    return this;
  }

  onError(cb: (error: unknown) => any) {
    this._onError = cb;
    return this;
  }

  onFinally(cb: () => any) {
    this._onFinally = cb;
    return this;
  }

  retry(count: number, intervalMs = 1000) {
    this._retry = { count, counted: 0, interval: intervalMs };
    return this;
  }

  transform(cb: (res: ServerSuccess<T>) => ServerSuccess<T>) {
    this._transform = cb;
    return this;
  }

  abort() {
    this._controller.abort();
  }

  async initiate(...args: A) {
    await this.exec(...args);
    return this;
  }

  async exec(...args: A): Promise<ServerSuccess<T>> {
    const controller = new AbortController();
    this._controller = controller;
    const { _config, _fetcher, _navigate, _onError, _onFinally, _onSuccess, _setState, _retry, _transform, _setLoading } = this;
    if (_config.withLoad !== false) {
      _setLoading?.(true);
    }
    try {
      let res = await _fetcher(controller, ...args);
      if (_transform) {
        res = _transform(res);
      }
      _setState?.(res.data);
      await _onSuccess?.(res);
      return res;
    } catch (err) {
      if ((err as Error).name === "AbortError") throw err;
      if (_retry) {
        _retry.counted++;
        if (_retry.counted <= _retry.count) {
          await new Promise((res) => setTimeout(res, _retry.interval));
          return await this.exec(...args);
        }
      }
      await _onError?.(err);
      if (err instanceof ServerError) {
        if (_config.directOnAuthError) {
          directOnAuthError(err, _navigate);
        }
      }
      if (_config.handleError) {
        handleError(err, _config.handleError.setError, _config.handleError);
      }
      throw err;
    } finally {
      _setLoading?.(false);
      await _onFinally?.();
    }
  }

  async safeExec(...args: A): Promise<SafeExcResult<ServerSuccess<T>>> {
    try {
      const data = await this.exec(...args);
      return { ok: true, data };
    } catch (error) {
      return { ok: false, error };
    }
  }
}
