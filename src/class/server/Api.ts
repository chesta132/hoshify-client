import axios, { isAxiosError, type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from "axios";
import { ServerSuccess } from "@/class/server/ServerSuccess";
import { ServerError } from "@/class/server/ServerError";
import type { Response } from "@/types/server";
import { VITE_ENV, VITE_SERVER_URL } from "@/config";
import { normalizeDatesInObject } from "@/utils/server";

type LogType = "default" | "none" | "super" | "no trace";

export class ApiClient {
  private api: AxiosInstance;

  constructor(baseURL: string) {
    this.api = axios.create({
      baseURL,
      withCredentials: true,
      headers: {
        "Content-Type": "application/json",
      },
    });

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
    if (logType !== "none") {
      const endpoint = `Endpoint:\n${response.config.url?.slice(VITE_SERVER_URL.length)}`;
      switch (logType) {
        case "super":
          console.debug("SUPER_TRACE", endpoint, response);
          break;
        case "no trace":
          console.debug("NO_TRACE", endpoint, response);
          break;
        default:
          console.debug(endpoint, response);
          break;
      }
    }
  }

  private async request<T = any>(config: AxiosRequestConfig & { logType?: LogType }): Promise<ServerSuccess<T>> {
    try {
      const response = (await this.api.request<T>(config)) as AxiosResponse<Response<T>>;
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

  get<T = any>(url: string, config?: AxiosRequestConfig) {
    return this.request<T>({ ...config, url, method: "GET" });
  }

  post<T = any>(url: string, data?: any, config?: AxiosRequestConfig) {
    return this.request<T>({ ...config, url, method: "POST", data });
  }

  patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig) {
    return this.request<T>({ ...config, url, method: "PATCH", data });
  }

  put<T = any>(url: string, data?: any, config?: AxiosRequestConfig) {
    return this.request<T>({ ...config, url, method: "PUT", data });
  }

  delete<T = any>(url: string, config?: AxiosRequestConfig) {
    return this.request<T>({ ...config, url, method: "DELETE" });
  }
}

const api = new ApiClient(VITE_SERVER_URL);
export default api;
