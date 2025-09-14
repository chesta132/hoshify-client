import axios, { isAxiosError, type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from "axios";
import { ServerSuccess } from "@/class/server/ServerSuccess";
import { ServerError } from "@/class/server/ServerError";
import type { Response } from "@/types/server";
import { VITE_ENV, VITE_SERVER_URL } from "@/config";
import { normalizeDatesInObject } from "@/utils/server";
import type { Models, InitiateUser, User, ModelNames, Todo, Schedule, Money, Transaction, Link } from "@/types/models";

type LogType = "default" | "none" | "super" | "no trace";
type Endpoint<T extends Models, E extends string, O extends string = ""> = Omit<ApiClient<T, E>, ModelNames | "auth" | O>;
type BaseEndpoint = "/" | `/${string}`;
type RestoreEndPoint = "/restores" | `/restores/${string}`;

export type AuthEndpoints =
  | "/signup"
  | "/signin"
  | "/google"
  | "/google/callback"
  | "/signout"
  | "/send-email-verif"
  | "/verify-email"
  | "/bind-local"
  | "/google-bind"
  | "/google-bind/callback"
  | "/send-otp"
  | "/update-email"
  | "/reset-password"
  | "/update-password"
  | "/request-role"
  | "/accept-request-role";
export type UserEndpoints = "/initiate" | "/";
export type TodoEndpoints = BaseEndpoint | RestoreEndPoint;
export type ScheduleEndpoints = BaseEndpoint | RestoreEndPoint;
export type MoneyEndpoints = `/refresh/${string}` | BaseEndpoint;
export type TransactionEndpoints = BaseEndpoint | RestoreEndPoint;
export type LinkEndpoints = BaseEndpoint;

export class ApiClient<M extends Models = any, E extends string = string> {
  private api: AxiosInstance;
  private endpoint: string;

  readonly auth!: Endpoint<InitiateUser | User, AuthEndpoints>;
  readonly user!: Endpoint<User, UserEndpoints, "patch">;
  readonly todo!: Endpoint<Todo, TodoEndpoints>;
  readonly schedule!: Endpoint<Schedule, ScheduleEndpoints>;
  readonly money!: Endpoint<Money, MoneyEndpoints, "delete">;
  readonly transaction!: Endpoint<Transaction, TransactionEndpoints>;
  readonly link!: Endpoint<Link, LinkEndpoints, "patch">;

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
      (response) => response,
      (error) => {
        if (VITE_ENV !== "production") console.error("Error in API call:", error);
        if (error.response?.data?.code === "CLIENT_REFRESH") {
          location.reload();
          return;
        }
        return Promise.reject(error);
      }
    );
  }

  private logResponse(response: AxiosResponse<Response<any>>, logType?: LogType) {
    const callerStack = new Error().stack;
    const callerLine = callerStack
      ?.slice(callerStack.indexOf(")", callerStack.indexOf("ApiClient.request")) + 1)
      .trim()
      .slice(3);
    const endpoint = `Endpoint:\n${response.config.url}\n\nResponse:`;
    if (logType !== "none") {
      switch (logType) {
        case "super":
          console.debug("SUPER_TRACE", endpoint, response);
          break;
        case "no trace":
          console.debug("NO_TRACE", endpoint, response);
          break;
        default:
          console.debug("NO_TRACE", `Trace:\n${callerLine}\n\n${endpoint}`, response);
          break;
      }
    }
  }

  private async request<T = M>(config: AxiosRequestConfig & { logType?: LogType }): Promise<ServerSuccess<T>> {
    try {
      const response = (await this.api.request<T>({
        ...config,
        url: `${this.endpoint}${config.url}`.replace(/\/{2,}/g, "/"),
      })) as AxiosResponse<Response<T>>;
      response.data = normalizeDatesInObject(response.data);
      this.logResponse(response, config.logType);
      return new ServerSuccess(response);
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        throw new ServerError(error.response.data);
      }
      throw error;
    }
  }

  get<T = M>(url: E, config?: AxiosRequestConfig) {
    return this.request<T>({ ...config, url, method: "GET" });
  }

  post<T = M>(url: E, data?: any, config?: AxiosRequestConfig) {
    return this.request<T>({ ...config, url, method: "POST", data });
  }

  patch<T = M>(url: E, data?: any, config?: AxiosRequestConfig) {
    return this.request<T>({ ...config, url, method: "PATCH", data });
  }

  put<T = M>(url: E, data?: any, config?: AxiosRequestConfig) {
    return this.request<T>({ ...config, url, method: "PUT", data });
  }

  delete<T = M>(url: E, config?: AxiosRequestConfig) {
    return this.request<T>({ ...config, url, method: "DELETE" });
  }
}

const api = new ApiClient(VITE_SERVER_URL);
export default api;
