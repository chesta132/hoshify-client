import type { ErrorResponse, Response, StateErrorServer } from "@/types/server";
import { omit } from "@/utils/manipulate/object";
import type { AxiosError } from "axios";

export class ServerError {
  // AxiosError<any> because response props replaced to non undefined
  readonly axios: AxiosError<any> & { response: { data: Response<ErrorResponse, false> } };
  readonly data: Response<ErrorResponse, false>["data"];
  readonly meta: Response<ErrorResponse, false>["meta"];

  constructor(error: AxiosError<Response<ErrorResponse, false>>) {
    if (!error.response?.data) {
      throw new Error("Invalid server error: missing response data");
    }
    this.axios = error as AxiosError<any> & { response: { data: Response<ErrorResponse, false> } };
    this.data = error.response.data.data;
    this.meta = error.response.data.meta;
  }

  getCode() {
    return this.data.code;
  }

  getMessage() {
    return this.data.message;
  }

  getField() {
    return this.data.field;
  }

  getDetails() {
    return this.data.details;
  }

  getTitle() {
    return this.data.title;
  }

  setToState(setState: React.Dispatch<React.SetStateAction<StateErrorServer | null>>) {
    setState(omit(this.data, ["field"]));
  }
}
