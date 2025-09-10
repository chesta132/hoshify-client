import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from "axios";
import { ServerSuccess } from "@/class/server/ServerSuccess";
import { ServerError } from "@/class/server/ServerError";
import type { Response } from "@/types/server";
import { SERVER_URL } from "@/config";
import { normalizeDatesInObject } from "@/utils/server";

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
        if (error.response?.data?.code === "CLIENT_REFRESH") {
          location.reload();
          return;
        }
        return Promise.reject(error);
      }
    );
  }

  private async request<T = any>(config: AxiosRequestConfig): Promise<ServerSuccess<T>> {
    try {
      const response = (await this.api.request<T>(config)) as AxiosResponse<Response<T>>;
      response.data = normalizeDatesInObject(response.data);
      return new ServerSuccess(response);
    } catch (error: any) {
      if (error.response) {
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

const api = new ApiClient(SERVER_URL);
export default api;
