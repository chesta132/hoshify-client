import api, { type ApiConfig } from "@/class/server/ApiClient";
import { Request } from "@/class/server/Request";
import type { InitiateUser } from "@/types/models";
import { useMemo } from "react";

type UserServiceProps = {
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setUser: React.Dispatch<React.SetStateAction<InitiateUser>>;
};

export const useUserService = ({ setLoading, setUser }: UserServiceProps) => {
  const initiate = useMemo(
    () => new Request(({ signal }) => api.user.get<InitiateUser>("/initiate", { signal })).loading(setLoading).mergeState(setUser).retry(3),
    [setLoading, setUser]
  );

  const getUser = useMemo(
    () => new Request(({ signal }, config?: ApiConfig) => api.user.get("/", { signal, ...config })).loading(setLoading).mergeState(setUser).retry(2),
    [setLoading, setUser]
  );

  return { initiate, getUser };
};
