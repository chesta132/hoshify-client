import axios, { AxiosError, type AxiosResponse } from "axios";
import { codeErrorAuth, type ErrorResponse, type Response } from "@/types/server";
import { VITE_ENV, VITE_SERVER_URL } from "@/config";
import { ServerError } from "@/class/server/ServerError";
import { ServerSuccess } from "@/class/server/ServerSuccess";
import { normalizeDatesInObject } from ".";

type Options =
  | {
      method: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
      body?: null | object;
      headers?: object;
      directToken?: boolean;
    }
  | undefined;

export default async function deprecated_api<T = any>(endpoint: string = "", options: Options = { method: "GET", body: null, headers: {}, directToken: false }) {
  const callerLine = new Error().stack?.split("\n")[2];

  try {
    const response = (await axios({
      method: options.method,
      url: `${VITE_SERVER_URL}${endpoint}`,
      ...(options.body && { data: options.body }),
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      withCredentials: true,
    })) as AxiosResponse<Response<T>>;

    if (VITE_ENV !== "production") {
      console.log(`Endpoint:\n${response.config.url?.slice(VITE_SERVER_URL.length)}\n\nCalled by: ${callerLine?.trim()}\n\n`, response);
    }
    normalizeDatesInObject(response.data);
    return new ServerSuccess(response);
  } catch (error) {
    if (VITE_ENV !== "production") console.error("Error in API call:", error);

    const isAxiosError = axios.isAxiosError(error);
    const errorServer = isAxiosError && (error as AxiosError<Response<ErrorResponse, false>>);
    const { response } = errorServer || {};
    if (options.directToken && isAxiosError) {
      if (codeErrorAuth.slice(0, 2).includes(response?.data.data.code as (typeof codeErrorAuth)[number])) {
        window.location.href = "/signin";
      }
    }
    if (response) {
      throw new ServerError(response.data);
    }
    throw error;
  }
}
