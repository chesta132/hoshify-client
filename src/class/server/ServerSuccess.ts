import type { Response } from "@/types/server";
import type { AxiosResponse } from "axios";

export type DataType = "FULL_AXIOS" | "FULL_RES" | "FULL_API_INSTANCE" | "DATA_RES";

export type ReturnByDataType<T extends DataType | undefined, D> = T extends "FULL_AXIOS"
  ? AxiosResponse<Response<D>>
  : T extends "FULL_RES"
  ? Response<D>
  : T extends "FULL_API_INSTANCE"
  ? ServerSuccess<D>
  : D;

export class ServerSuccess<T> {
  readonly data: T;
  readonly meta: Response<T>["meta"];
  readonly axios: AxiosResponse<Response<T>>;

  constructor(response: AxiosResponse<Response<T>>) {
    this.axios = response;
    this.data = response.data.data;
    this.meta = response.data.meta;
  }

  getInfo() {
    return this.meta.information;
  }

  getPagination() {
    const meta = this.meta;
    const hasNext = meta.hasNext;
    const nextOffset = meta.nextOffset;
    return { hasNext, nextOffset };
  }

  setToState(setState: React.Dispatch<React.SetStateAction<T>>) {
    setState(this.data);
  }

  getByDataType<DT extends DataType | undefined>(dataType?: DT): ReturnByDataType<DT, T> {
    switch (dataType) {
      case "FULL_AXIOS":
        return this.axios as any;
      case "FULL_RES":
        return this.axios.data as any;
      case "FULL_API_INSTANCE":
        return this as any;
      default:
        return this.data as any;
    }
  }
}
