import api, { type ApiConfig } from "@/class/server/ApiClient";
import { Request } from "@/class/server/Request";
import { useError } from "@/contexts";
import type { InitiateUser, User } from "@/types/models";
import { useMemo } from "react";

type UserServiceProps = {
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setUser: React.Dispatch<React.SetStateAction<InitiateUser>>;
};

export type UserServices = {
  initiate: Request<InitiateUser>;
  getUser: Request<User, [config?: ApiConfig | undefined]>;
};

export const useUserService = ({ setLoading, setUser }: UserServiceProps): UserServices => {
  const { setError } = useError();

  const initiate = useMemo(
    () =>
      new Request(({ signal }) => api.user.get<InitiateUser>("/initiate", { signal }))
        .loading(setLoading)
        .mergeState(setUser)
        .retry(3)
        .config({ handleError: { setError } }),
    [setLoading, setUser, setError]
  );

  const getUser = useMemo(() => initiate.clone(({ signal }, config?: ApiConfig) => api.user.get("/", { signal, ...config })).retry(2), [initiate]);

  return { initiate, getUser };
};
