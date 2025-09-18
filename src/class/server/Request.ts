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

export class Request<T, A extends any[] = [], E extends boolean = false, N extends NavigateFunction | undefined = undefined> {
  private _fetcher: RequestFetcher<T, A>;
  private _setState?: React.Dispatch<React.SetStateAction<T>>;
  private _navigate?: N;
  private _config: Config<N> = {};
  private _throwError = false;
  private _onSuccess?: (response: ServerSuccess<T>) => any;
  private _onError?: (error: unknown) => any;
  private _onFinally?: () => any;
  private _retry?: Retry;
  private _transform?: (res: ServerSuccess<T>) => ServerSuccess<T>;
  private _setLoading?: React.Dispatch<React.SetStateAction<boolean>>;

  constructor(fetcher: RequestFetcher<T, A>) {
    this._fetcher = fetcher;
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
    (this._navigate as any) = navigate;
    return this as Request<T, A, E, NavigateFunction>;
  }

  setConfig(config: Config<N>) {
    this._config = { ...this._config, ...config };
    return this;
  }

  setLoading(setLoading: React.Dispatch<React.SetStateAction<boolean>>) {
    this._setLoading = setLoading;
    return this;
  }

  throwError<B extends boolean>(throwErr: B) {
    this._throwError = throwErr;
    return this as Request<T, A, B, N>;
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
  }

  abort = new AbortController().abort;

  async initiate(...args: A) {
    await this.exec(...args);
    return this;
  }

  exec: E extends false ? (...args: A) => Promise<ServerSuccess<T> | void> : (...args: A) => Promise<ServerSuccess<T>> = async (...args: A) => {
    const controller = new AbortController();
    this.abort = controller.abort;
    const { _config, _fetcher, _navigate, _throwError, _onError, _onFinally, _onSuccess, _setState, _retry, _transform, _setLoading } = this;
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
      if ((err as Error).name === "AbortError") return;
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
          directOnAuthError(err, _navigate!);
        }
      }
      if (_config.handleError) {
        handleError(err, _config.handleError.setError, _config.handleError);
      }
      if (_throwError) throw err;
      return undefined as any;
    } finally {
      _setLoading?.(false);
      await _onFinally?.();
    }
  };
}

type RequestProps<T, A extends any[], N extends NavigateFunction | undefined = undefined> = Partial<
  Omit<Request<T, A, false, N>, "exec" | "controller">
>;

export function createRequestSchema<T, A extends any[] = [], N extends NavigateFunction | undefined = undefined>(
  defaultProps?: RequestProps<T, A, N>
) {
  return (fetcher: RequestFetcher<T, A>, overrideProps?: RequestProps<T, A, N>) => {
    const req = new Request<T, A, false, N>(fetcher);

    // assign defaultProps + overrideProps ke instance
    Object.assign(req, defaultProps || {}, overrideProps || {});

    return req;
  };
}
