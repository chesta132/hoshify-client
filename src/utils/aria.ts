import { capital } from "./manipulate/string";

export const getLabelFromPath = (path: string) => {
  const firstChar = path[0];
  if (firstChar === "/") path = path.slice(1);
  return capital(path).replaceAll("/", " ");
};
