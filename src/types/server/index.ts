import type { ServerFields } from "../form";
import type { CodeError } from "./codes";

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
  field?: keyof ServerFields;
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
