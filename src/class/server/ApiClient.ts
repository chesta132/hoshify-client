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
  Endpoints,
  LinkEndpoints,
  MoneyEndpoints,
  ScheduleEndpoints,
  TodoEndpoints,
  TransactionEndpoints,
  UserEndpoints,
} from "@/types/server/endpoints";

type LogType = "default" | "none" | "no trace";
type SetEndpoints<T extends Models, E extends Endpoints, O extends string = ""> = Omit<
  ApiClient<T, E["get"], E["put"], E["post"], E["delete"], E["patch"]>,
  ModelNames | "auth" | O
>;

export type ApiConfig<D = any> = AxiosRequestConfig<D> & { logType?: LogType };

export class ApiClient<
  M extends Models = any,
  Get extends string = string,
  Put extends string = string,
  Post extends string = string,
  Delete extends string = string,
  Patch extends string = string
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

  constructor(baseURL: string, endpoint = "", initiate = true) {
    this.endpoint = endpoint;
    this.api = axios.create({
      baseURL,
      withCredentials: true,
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (initiate) {
      this.auth = new ApiClient(baseURL, "/auth", false);
      this.user = new ApiClient(baseURL, "/user", false);
      this.todo = new ApiClient(baseURL, "/todos", false);
      this.schedule = new ApiClient(baseURL, "/schedules", false);
      this.money = new ApiClient(baseURL, "/money", false);
      this.transaction = new ApiClient(baseURL, "/transactions", false);
      this.link = new ApiClient(baseURL, "/links", false);
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
        default:
          console.debugTrace(endpoint, response);
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

  get<T = M>(url: Get, config?: ApiConfig) {
    return this.request<T>({ ...config, url, method: "GET" });
  }

  post<T = M>(url: Post, data?: any, config?: ApiConfig) {
    return this.request<T>({ ...config, url, method: "POST", data });
  }

  patch<T = M>(url: Patch, data?: any, config?: ApiConfig) {
    return this.request<T>({ ...config, url, method: "PATCH", data });
  }

  put<T = M>(url: Put, data?: any, config?: ApiConfig) {
    return this.request<T>({ ...config, url, method: "PUT", data });
  }

  delete<T = M>(url: Delete, config?: ApiConfig) {
    return this.request<T>({ ...config, url, method: "DELETE" });
  }
}

const api = new ApiClient(VITE_SERVER_URL);
export default api;
