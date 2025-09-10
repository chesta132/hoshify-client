import type { Response } from "@/types/server";
import type { AxiosResponse } from "axios";
import { omit } from "@/utils/manipulate/object";

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
}
