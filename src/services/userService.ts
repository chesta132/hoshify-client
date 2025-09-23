import api, { type ApiConfig } from "@/class/server/ApiClient";
import { Request } from "@/class/server/Request";
import type { InitiateUser } from "@/types/models";
import { useEffect, useMemo, useState } from "react";

type UserServiceProps = {
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setUser: React.Dispatch<React.SetStateAction<InitiateUser>>;
};

export const useUserService = ({ setLoading, setUser }: UserServiceProps) => {
  const [isInitiated, setIsInitiated] = useState(false);

  const initiate = useMemo(
    () => new Request(({ signal }) => api.user.get<InitiateUser>("/initiate", { signal })).loading(setLoading).mergeState(setUser).retry(3),
    [setLoading, setUser]
  );

  useEffect(() => {
    initiate.safeExec().finally(() => setIsInitiated(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getUser = useMemo(
    () => new Request(({ signal }, config?: ApiConfig) => api.user.get("/", { signal, ...config })).loading(setLoading).mergeState(setUser).retry(2),
    [setLoading, setUser]
  );

  return { isInitiated, initiate, getUser };
};
