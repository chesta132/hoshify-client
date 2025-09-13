import type { Response } from "@/types/server";
import type { AxiosResponse } from "axios";
import { omit } from "@/utils/manipulate/object";

export type DataType = "FULL_AXIOS" | "FULL_RES" | "FULL_API_INSTANCE" | "DATA_RES";

export type ReturnByDataType<T extends DataType | undefined, D> = T extends "FULL_AXIOS"
  ? AxiosResponse<Response<D>>
  : T extends "FULL_RES"
  ? Response<D>
  : T extends "FULL_API_INSTANCE"
  ? ServerSuccess<D>
  : D;

export class ServerSuccess<T> {
  data: Response<T>;
  resMeta: Omit<AxiosResponse, "data">;

  constructor(response: AxiosResponse<Response<T>>) {
    this.data = response.data;
    this.resMeta = omit(response, ["data"]);
  }

  getMeta() {
    return this.data.meta;
  }

  getData() {
    return this.data.data;
  }

  getInfo() {
    return this.getMeta().information;
  }

  getPagination() {
    const meta = this.getMeta();
    const hasNext = meta.hasNext;
    const nextOffset = meta.nextOffset;
    return { hasNext, nextOffset };
  }

  setToState(setState: React.Dispatch<React.SetStateAction<T>>) {
    setState(this.getData());
  }

  getByDataType<DT extends DataType | undefined>(dataType?: DT): ReturnByDataType<DT, T> {
    switch (dataType) {
      case "FULL_AXIOS":
        return { ...this.data, ...this.resMeta } as any;
      case "FULL_RES":
        return this.data as any;
      case "FULL_API_INSTANCE":
        return this as any;
      default:
        return this.getData() as any;
    }
  }
}
