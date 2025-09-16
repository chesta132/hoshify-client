import { isIsoDateValid } from "@/utils/manipulate/date";
import dayjs, { Dayjs } from "dayjs";

type NormalizedDates<T> = {
  [K in keyof T]: [T] extends [Date] ? T[K] : Dayjs;
};

export const normalizeDates = <T extends Record<string, any> | any[]>(
  data: T
): T extends any[] ? NormalizedDates<ExtractArray<T>>[] : NormalizedDates<T> => {
  if (typeof data !== "object" || data === null) {
    return data;
  }
  if (Array.isArray(data)) {
    return data.map((arr) => normalizeDates(arr)) as any;
  }
  const sanitized = { ...data } as Record<string, any>;

  for (const key in sanitized) {
    if (!Object.prototype.hasOwnProperty.call(sanitized, key)) {
      continue;
    }
    const value = sanitized[key];

    if (isIsoDateValid(value)) {
      sanitized[key] = dayjs(value);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map((item) => normalizeDates(item));
    } else if (typeof value === "object" && value !== null) {
      normalizeDates(value);
    }
  }
  return sanitized as any;
};
