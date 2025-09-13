import { useContext } from "react";
import { AppearanceContext } from "./appearance/AppearanceContext";
import { capital } from "@/utils/manipulate/string";
import { HeaderContext } from "./HeaderContext";
import { SearchContext } from "./search/SearchContext";
import { UserContext } from "./UserContext";

const useCreateContext = <T,>(context: React.Context<T>, name: string) => {
  const createdContext = useContext(context);
  if (createdContext === undefined) throw new Error(`use${capital(name)} must be used within a ${capital(name)}Provider`);
  return createdContext;
};

export const useTheme = () => {
  return useCreateContext(AppearanceContext, "appearance");
};

export const useHeader = () => {
  return useCreateContext(HeaderContext, "header");
};

export const useSearch = () => {
  return useCreateContext(SearchContext, "search");
};

export const useUser = () => {
  return useCreateContext(UserContext, "user");
};
