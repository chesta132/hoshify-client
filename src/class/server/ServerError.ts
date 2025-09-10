import type { ErrorResponse, Response } from "@/types/server";

export class ServerError {
  error: Response<ErrorResponse, false>;
  constructor(error: Response<ErrorResponse, false>) {
    this.error = error;
  }

  getMeta() {
    return this.error.meta;
  }

  getError() {
    return this.error.data;
  }

  getCode() {
    return this.error.data.code;
  }

  getMessage() {
    return this.error.data.message;
  }

  getField() {
    return this.error.data.field;
  }

  getDetails() {
    return this.error.data.details;
  }

  getTitle() {
    return this.error.data.title;
  }

  setToState(setState: React.Dispatch<React.SetStateAction<ErrorResponse>>) {
    setState(this.getError());
  }
}
