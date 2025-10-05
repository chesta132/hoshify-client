import type { Response } from "@/types/server";
import type { AxiosResponse } from "axios";

export type PaginationResult = {
  hasNext?: boolean;
  nextOffset?: number | null;
};

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

  getPagination(): PaginationResult {
    const meta = this.meta;
    const hasNext = meta.hasNext;
    const nextOffset = meta.nextOffset;
    return { hasNext, nextOffset };
  }

  setToState(setState: React.Dispatch<React.SetStateAction<T>>) {
    setState(this.data);
  }
}
