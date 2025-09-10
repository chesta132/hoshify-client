import type { ServerFields } from "./form";

/**
 * Authentication-related error codes.
 */
export const codeErrorAuth: CodeAuthError[] = ["INVALID_AUTH", "INVALID_TOKEN", "IS_BOUND", "NOT_BOUND", "INVALID_ROLE"];

/**
 * Field validation-related error codes.
 */
export const codeErrorField: CodeFieldError[] = ["MISSING_FIELDS", "CLIENT_FIELD"];

/**
 * Client-side related error codes.
 */
export const codeErrorClient: CodeClientError[] = [
  "TOO_MUCH_REQUEST",
  "SELF_REQUEST",
  "CLIENT_REFRESH",
  "IS_VERIFIED",
  "NOT_VERIFIED",
  "INVALID_CLIENT_TYPE",
  "IS_RECYCLED",
  "NOT_RECYCLED",
];

/**
 * Server-side related error codes.
 */
export const codeErrorServer: CodeServerError[] = ["SERVER_ERROR", "NOT_FOUND", "BAD_GATEWAY"];

/**
 * All possible error code values.
 */
export const CodeErrorValues: CodeError[] = [...codeErrorAuth, ...codeErrorField, ...codeErrorClient, ...codeErrorServer];

/**
 * Structure of an error response payload.
 */
export interface ErrorResponse {
  /** Unique error code */
  code: CodeError;
  /** Human-readable message */
  message: string;
  /** Optional UI title for displaying error */
  title?: string;
  /** Extra details for debugging */
  details?: string;
  /** Optional field reference (useful for forms) */
  field?: ServerFields;
}

/**
 * Standard response envelope.
 */
export interface Response<T, Success extends boolean = true> {
  meta: {
    /** Status of response (SUCCESS/ERROR) */
    status: IsTruthy<Success, "SUCCESS", "ERROR">;
  } & IsTruthy<
    Success,
    {
      /** Indicates whether there is next data (for pagination) */
      hasNext?: boolean;
      /** Next offset for pagination */
      nextOffset?: number | null;
      /** Optional information message */
      information?: string;
    },
    object
  >;
  /** Response payload data */
  data: T;
}

export type CodeAuthError = "INVALID_AUTH" | "INVALID_TOKEN" | "IS_BOUND" | "NOT_BOUND" | "INVALID_ROLE";
export type CodeFieldError = "MISSING_FIELDS" | "CLIENT_FIELD";
export type CodeClientError =
  | "TOO_MUCH_REQUEST"
  | "SELF_REQUEST"
  | "CLIENT_REFRESH"
  | "IS_VERIFIED"
  | "NOT_VERIFIED"
  | "INVALID_CLIENT_TYPE"
  | "IS_RECYCLED"
  | "NOT_RECYCLED";

export type CodeServerError = "SERVER_ERROR" | "NOT_FOUND" | "BAD_GATEWAY";
export type CodeError = CodeServerError | CodeFieldError | CodeAuthError | CodeClientError;
