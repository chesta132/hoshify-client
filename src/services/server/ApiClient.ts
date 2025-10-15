import axios, { isAxiosError, type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from "axios";
import { ServerSuccess } from "@/services/server/ServerSuccess";
import { ServerError } from "@/services/server/ServerError";
import type { Response } from "@/types/server";
import { VITE_ENV, VITE_SERVER_URL } from "@/config";
import { normalizeDates } from "@/utils/manipulate/date";
import type { ModelNames } from "@/types/models";
import { pick } from "@/utils/manipulate/object";
import type {
  AuthEndpoints,
  BodyOf,
  Endpoints,
  LinkEndpoints,
  MoneyEndpoints,
  NoteEndpoints,
  QueryOf,
  ResponseOf,
  ScheduleEndpoints,
  SearchEndpoints,
  TodoEndpoints,
  TransactionEndpoints,
  UserEndpoints,
} from "@/types/server/endpoints";

type LogType = "default" | "none" | "no trace" | "table";
type SetEndpoints<E extends Endpoints, O extends string = ""> = Omit<
  ApiClient<E["get"], E["put"], E["post"], E["delete"], E["patch"]>,
  ModelNames | "auth" | "search" | keyof PickByValueStrict<E, never> | O
>;
type DefaultArgs<T, E extends Endpoints[keyof Endpoints], P extends E["path"]> = [T] extends [never] ? ResponseOf<E, P> : T;

export type ApiConfig<D = any, Q = any> = AxiosRequestConfig<D> & { logType?: LogType; query?: Q };

export class ApiClient<
  Get extends Endpoints["get"] = any,
  Put extends Endpoints["put"] = any,
  Post extends Endpoints["post"] = any,
  Delete extends Endpoints["delete"] = any,
  Patch extends Endpoints["patch"] = any
> {
  private api: AxiosInstance;
  private endpoint: string;

  readonly auth!: SetEndpoints<AuthEndpoints>;
  readonly user!: SetEndpoints<UserEndpoints>;
  readonly todo!: SetEndpoints<TodoEndpoints>;
  readonly schedule!: SetEndpoints<ScheduleEndpoints>;
  readonly money!: SetEndpoints<MoneyEndpoints>;
  readonly transaction!: SetEndpoints<TransactionEndpoints>;
  readonly link!: SetEndpoints<LinkEndpoints>;
  readonly note!: SetEndpoints<NoteEndpoints>;
  readonly search!: SetEndpoints<SearchEndpoints>;

  constructor(baseURL: string, endpoint = "", initiate = false) {
    this.endpoint = endpoint;
    this.api = axios.create({
      baseURL,
      withCredentials: true,
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (initiate) {
      this.auth = new ApiClient(baseURL, "/auth");
      this.user = new ApiClient(baseURL, "/user");
      this.todo = new ApiClient(baseURL, "/todos");
      this.schedule = new ApiClient(baseURL, "/schedules");
      this.money = new ApiClient(baseURL, "/money");
      this.transaction = new ApiClient(baseURL, "/transactions");
      this.link = new ApiClient(baseURL, "/links");
      this.note = new ApiClient(baseURL, "/notes");
      this.search = new ApiClient(baseURL, "/search");
    }

    this.api.interceptors.response.use(
      (response) => {
        if (response.data.data) {
          response.data.data = normalizeDates(response.data.data);
        }
        return response;
      },
      (error) => {
        if (VITE_ENV !== "production") console.error("Error in API call:\n", error);
        else console.error("Server request failed.\n", { ...pick(error, ["code", "message", "status"]), ...error?.response?.data?.data });
        if (error.response?.data?.code === "CLIENT_REFRESH") {
          location.reload();
          return;
        }
        return Promise.reject(error);
      }
    );
  }

  private logResponse(response: AxiosResponse<Response<any>>, logType?: LogType) {
    const endpoint = `Endpoints:\n${response.config.url}\n\nResponse:\n`;
    if (logType !== "none") {
      switch (logType) {
        case "no trace":
          console.debug("NO_TRACE", endpoint, response);
          break;
        case "table":
          console.debugTable(response, [endpoint]);
          break;
        default:
          console.debug(endpoint, response);
          break;
      }
    }
  }

  private async request<T>(config: ApiConfig): Promise<ServerSuccess<T>> {
    try {
      const response = (await this.api.request<T>({
        ...config,
        url: `${this.endpoint}${config.url}`.replace(/\/{2,}/g, "/") + this.generateQuery(config.query),
      })) as AxiosResponse<Response<T>>;
      this.logResponse(response, config.logType);
      return new ServerSuccess(response);
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        throw new ServerError(error);
      }
      throw error;
    }
  }

  generateQuery(query: Record<string, any> | undefined) {
    if (!query) return "";
    const entries = Object.typedEntries(query);
    if (entries.length === 0) return "";
    return "?" + entries.map(([key, val]) => `${encodeURIComponent(key)}=${encodeURIComponent(val)}`).join("&");
  }

  get<T extends Get["response"] = never, U extends Get["path"] = Get["path"]>(url: U, config?: ApiConfig<DefaultArgs<T, Get, U>, QueryOf<Get, U>>) {
    return this.request<DefaultArgs<T, Get, U>>({ ...config, url, method: "GET" });
  }

  post<T extends Post["response"] = never, U extends Post["path"] = Post["path"]>(
    url: U,
    data?: BodyOf<Post, U>,
    config?: ApiConfig<DefaultArgs<T, Post, U>, QueryOf<Post, U>>
  ) {
    return this.request<DefaultArgs<T, Post, U>>({ ...config, url, method: "POST", data });
  }

  patch<T extends Patch["response"] = never, U extends Patch["path"] = Patch["path"]>(
    url: U,
    data?: BodyOf<Patch, U>,
    config?: ApiConfig<DefaultArgs<T, Patch, U>, QueryOf<Patch, U>>
  ) {
    return this.request<DefaultArgs<T, Patch, U>>({ ...config, url, method: "PATCH", data });
  }

  put<T extends Put["response"] = never, U extends Put["path"] = Put["path"]>(
    url: U,
    data?: BodyOf<Put, U>,
    config?: ApiConfig<DefaultArgs<T, Put, U>, QueryOf<Put, U>>
  ) {
    return this.request<DefaultArgs<T, Put, U>>({ ...config, url, method: "PUT", data });
  }

  delete<T extends Delete["response"] = never, U extends Delete["path"] = Delete["path"]>(
    url: U,
    config?: ApiConfig<DefaultArgs<T, Delete, U>, QueryOf<Delete, U>>
  ) {
    return this.request<DefaultArgs<T, Delete, U>>({ ...config, url, method: "DELETE" });
  }
}

const api = new ApiClient(VITE_SERVER_URL, "", true);
export default api;
