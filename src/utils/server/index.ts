import { isIsoDateValid } from "@/utils/manipulate/date";
import dayjs from "dayjs";

export const normalizeDatesInObject = (obj: any) => {
  if (typeof obj !== "object" || obj === null) {
    return obj;
  }
  const sanitized = { ...obj };

  for (const key in sanitized) {
    if (!Object.prototype.hasOwnProperty.call(sanitized, key)) {
      continue;
    }
    const value = sanitized[key];

    if (isIsoDateValid(value)) {
      sanitized[key] = dayjs(value);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map((item) => normalizeDatesInObject(item));
    } else if (typeof value === "object" && value !== null) {
      normalizeDatesInObject(value);
    }
  }
  return sanitized;
};
