import { type NavigateFunction } from "react-router";
import type { ServerSuccess } from "./ServerSuccess";
import { directOnAuthError, handleError, type HandleErrorOptions } from "@/services/handleError";
import { type StateErrorServer } from "@/types/server/codes";
import { ServerError } from "./ServerError";
import { createMergeState } from "@/utils/hookUtils";

export type Config<N> = {
  directOnAuthError?: N extends undefined ? never : boolean;
  handleError?: { setError: React.Dispatch<React.SetStateAction<StateErrorServer | null>> } & HandleErrorOptions;
  withLoad?: boolean;
};
type OnRetryCallback = (err: unknown) => any;
export type Retry = { counted: number; count: number; interval: number; onRetry?: OnRetryCallback };
export type RequestFetcher<T, A extends any[]> = (controller: AbortController, ...args: A) => Promise<ServerSuccess<T>>;
export type SafeExcResult<T> = { ok: true; data: T } | { ok: false; error: unknown };

type RetryOptions = { interval?: number; onRetry?: OnRetryCallback };

type ResponsePrivates =
  | "_fetcher"
  | "_setState"
  | "_navigate"
  | "_config"
  | "_onSuccess"
  | "_onError"
  | "_onFinally"
  | "_retry"
  | "_transform"
  | "_loading"
  | "_controller";
type PrettyResponsePrivates = Replace<ResponsePrivates, "_", "">;

export class Request<T, A extends any[] = [], N extends NavigateFunction | undefined = undefined, L = boolean> {
  private _fetcher: RequestFetcher<T, A>;
  private _setState?: React.Dispatch<React.SetStateAction<T>>;
  private _navigate?: N;
  private _config: Config<N> = { withLoad: true };
  private _onSuccess?: (response: ServerSuccess<T>) => any;
  private _onError?: (error: unknown) => any;
  private _onFinally?: () => any;
  private _retry?: Retry;
  private _transform: ((res: ServerSuccess<T>) => ServerSuccess<T>)[] = [];
  private _loading?: { set: React.Dispatch<React.SetStateAction<L>>; load: L; unLoad: L };
  private _controller = new AbortController();

  constructor(fetcher: RequestFetcher<T, A>) {
    this._fetcher = fetcher;
  }

  static from<T, A extends any[] = [], N extends NavigateFunction | undefined = undefined, L = boolean>(instance: Request<T, A, N, L>) {
    return instance.clone();
  }

  reset<K extends Exclude<PrettyResponsePrivates, "fetcher">>(...keys: K[]) {
    keys.forEach((k) => {
      const key = `_${k}` as ResponsePrivates;
      switch (key) {
        case "_config":
          this[key] = { withLoad: true };
          break;
        case "_controller":
          this[key] = new AbortController();
          break;
        default:
          delete this[key];
      }
    });

    type NN = "navigate" extends K ? undefined : N;
    type NL = "loading" extends K ? boolean : L;
    return this as Request<T, A, NN, NL>;
  }

  clone<NT = T, NA extends any[] = A>(fetcher?: RequestFetcher<NT, NA>) {
    const newInstance = new Request<NT, NA, N, L>((fetcher as any) ?? this._fetcher);
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
    return this as unknown as Request<NT, NA, N, L>;
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
    return this as Request<T, A, NavigateFunction, L>;
  }

  config(config: Config<N>) {
    this._config = { ...this._config, ...config };
    return this;
  }

  loading(setLoading: React.Dispatch<React.SetStateAction<boolean>>, value?: { load: boolean; unLoad: boolean }): Request<T, A, N, boolean>;
  loading<L>(setLoading: React.Dispatch<React.SetStateAction<L>>, value: { load: L; unLoad: L }): Request<T, A, N, L>;
  loading<L>(setLoading: React.Dispatch<React.SetStateAction<L>>, value?: { load: L; unLoad: L }) {
    if (!value) {
      value = { load: true, unLoad: false } as any;
    }
    this._loading = { set: setLoading as any, load: value?.load as any, unLoad: value?.unLoad as any };
    return this as Request<T, A, N, L>;
  }

  onSuccess(cb: (res: ServerSuccess<T>) => any) {
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

  retry(count: number, { interval = 1000, onRetry }: RetryOptions = {}) {
    this._retry = { count, counted: 1, interval, onRetry };
    return this;
  }

  transform(cb: (res: ServerSuccess<T>) => ServerSuccess<T>) {
    this._transform.push(cb);
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
    const { _config, _fetcher, _navigate, _onError, _onFinally, _onSuccess, _setState, _retry, _transform, _loading } = this;
    if (_config.withLoad !== false) {
      _loading?.set(_loading.load);
    }
    try {
      let res = await _fetcher(controller, ...args);

      _transform.forEach((t) => {
        res = t(res);
      });

      _setState?.(res.data);
      await _onSuccess?.(res);

      return res;
    } catch (err) {
      if ((err as Error).name === "AbortError") throw err;

      if (_retry) {
        _retry.counted++;
        if (_retry.counted <= _retry.count) {
          _retry.onRetry?.(err);
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
      _loading?.set(_loading.unLoad);
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
