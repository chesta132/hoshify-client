import axios, { isAxiosError, type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from "axios";
import { ServerSuccess } from "@/class/server/ServerSuccess";
import { ServerError } from "@/class/server/ServerError";
import type { Response } from "@/types/server";
import { VITE_ENV, VITE_SERVER_URL } from "@/config";
import { normalizeDates } from "@/utils/manipulate/date";
import type { Models, InitiateUser, User, ModelNames, Todo, Schedule, Money, Transaction, Link } from "@/types/models";
import { pick } from "@/utils/manipulate/object";
import type {
  AuthEndpoints,
  BodyOf,
  Endpoints,
  LinkEndpoints,
  MoneyEndpoints,
  ResponseOf,
  ScheduleEndpoints,
  TodoEndpoints,
  TransactionEndpoints,
  UserEndpoints,
} from "@/types/server/endpoints";

type LogType = "default" | "none" | "no trace" | "table";
type SetEndpoints<T extends Models, E extends Endpoints, O extends string = ""> = Omit<
  ApiClient<T, E["get"], E["put"], E["post"], E["delete"], E["patch"]>,
  ModelNames | "auth" | O
>;

export type ApiConfig<D = any> = AxiosRequestConfig<D> & { logType?: LogType };

export class ApiClient<
  M extends Models = any,
  Get extends Endpoints["get"] = any,
  Put extends Endpoints["put"] = any,
  Post extends Endpoints["post"] = any,
  Delete extends Endpoints["delete"] = any,
  Patch extends Endpoints["patch"] = any
> {
  private api: AxiosInstance;
  private endpoint: string;

  readonly auth!: SetEndpoints<InitiateUser | User, AuthEndpoints>;
  readonly user!: SetEndpoints<User, UserEndpoints, "patch">;
  readonly todo!: SetEndpoints<Todo, TodoEndpoints>;
  readonly schedule!: SetEndpoints<Schedule, ScheduleEndpoints>;
  readonly money!: SetEndpoints<Money, MoneyEndpoints, "delete">;
  readonly transaction!: SetEndpoints<Transaction, TransactionEndpoints>;
  readonly link!: SetEndpoints<Link, LinkEndpoints, "patch">;

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

  private async request<T = M>(config: ApiConfig): Promise<ServerSuccess<T>> {
    try {
      const response = (await this.api.request<T>({
        ...config,
        url: `${this.endpoint}${config.url}`.replace(/\/{2,}/g, "/"),
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

  get<T extends Get["response"] | undefined = undefined, U extends Get["path"] = Get["path"]>(url: U, config?: ApiConfig) {
    return this.request<T extends undefined ? ResponseOf<Get, U> : T>({ ...config, url, method: "GET" });
  }

  post<T extends Post["response"] | undefined = undefined, U extends Post["path"] = Post["path"]>(
    url: U,
    data?: BodyOf<Post, U>,
    config?: ApiConfig
  ) {
    return this.request<T extends undefined ? ResponseOf<Get, U> : T>({ ...config, url, method: "POST", data });
  }

  patch<T extends Patch["response"] | undefined = undefined, U extends Patch["path"] = Patch["path"]>(
    url: U,
    data?: BodyOf<Patch, U>,
    config?: ApiConfig
  ) {
    return this.request<T extends undefined ? ResponseOf<Get, U> : T>({ ...config, url, method: "PATCH", data });
  }

  put<T extends Put["response"] | undefined = undefined, U extends Put["path"] = Put["path"]>(
    url: U,
    data?: BodyOf<Put, U>,
    config?: ApiConfig
  ) {
    return this.request<T extends undefined ? ResponseOf<Get, U> : T>({ ...config, url, method: "PUT", data });
  }

  delete<T extends Delete["response"] | undefined = undefined, U extends Delete["path"] = Delete["path"]>(
    url: U,
    config?: ApiConfig
  ) {
    return this.request<T extends undefined ? ResponseOf<Get, U> : T>({ ...config, url, method: "DELETE" });
  }
}

const api = new ApiClient(VITE_SERVER_URL, "", true);
export default api;
