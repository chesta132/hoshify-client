import api, { type ApiConfig } from "@/class/server/ApiClient";
import { Request } from "@/class/server/Request";
import { useError } from "@/contexts";
import type { User } from "@/types/models";
import { useMemo } from "react";

type UserServiceProps = {
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setUser: React.Dispatch<React.SetStateAction<User>>;
};

export type UserServices = {
  getUser: Request<User, [config?: ApiConfig | undefined]>;
};

export const useUserService = ({ setLoading, setUser }: UserServiceProps): UserServices => {
  const { setError } = useError();

  const getUser = useMemo(
    () =>
      new Request(({ signal }, config?: ApiConfig) => api.user.get("/", { signal, ...config }))
        .loading(setLoading)
        .mergeState(setUser)
        .retry(3)
        .config({ handleError: { setError } }),
    [setLoading, setUser, setError]
  );

  return { getUser };
};
