import { VITE_ENV } from "@/config";

JSON.isJSON = function (item: any) {
  try {
    JSON.parse(item);
    return true;
  } catch {
    return false;
  }
};

Object.compare = function <T extends object>(...objectsProp: T[]) {
  const objects = [...objectsProp];
  let longestObjectKeys = 0;
  let longestObjectKeysIndex = 0;

  objects.forEach((object, index) => {
    const length = Object.entries(object).length;
    if (longestObjectKeys < length) {
      longestObjectKeys = length;
      longestObjectKeysIndex = index;
    }
  });
  const [longestObject] = objects.splice(longestObjectKeysIndex, 1);

  return Object.entries(longestObject).every(([key, value]) => {
    return objects.every((object) => Object.getOwnPropertyNames(object).includes(key) && object[key as keyof T] === value);
  });
};

console.debug = function (message?: ("NO_TRACE" | "SUPER_TRACE") & {}, ...data: any[]) {
  if (VITE_ENV === "production") return;
  const createdError = new Error();
  const callerLine = createdError.stack?.split("\n")[2].trim().slice(2);
  const noTrace = message === "NO_TRACE";
  const superTrace = message === "SUPER_TRACE";

  if (!"[vite]".includes(message || "") && !noTrace) {
    if (superTrace) this.trace();
    else this.log("Called by: " + callerLine);
  }

  if (noTrace || superTrace) {
    this.log(...data);
  } else {
    this.log(message, ...data);
  }
};

console.debugTable = function (tabularData, properties, trace) {
  if (VITE_ENV === "production") return;
  const createdError = new Error();
  const callerLine = createdError.stack?.split("\n")[2].trim().slice(2);
  const noTrace = trace !== "NO_TRACE";
  const superTrace = trace === "SUPER_TRACE";

  if (noTrace) this.log("Called by: " + callerLine);
  else if (superTrace) this.trace();

  this.table(tabularData, properties);
};

Object.isObject = function <T>(object: T) {
  if (typeof object === "object" && object !== null && !(object instanceof Date)) return true;
  return false;
};

Object.typedEntries = function <T extends object>(object: T) {
  return this.entries(object) as [keyof T, T[keyof T]][];
};

Object.typedKeys = function <T extends object>(object: T) {
  return this.keys(object) as (keyof T)[];
};

Object.typedValues = function <T extends object>(object: T) {
  return this.values(object) as T[keyof T][];
};
