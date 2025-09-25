import api, { type ApiConfig } from "@/class/server/ApiClient";
import { Request } from "@/class/server/Request";
import type { InitiateUser, User } from "@/types/models";
import { useMemo, useState } from "react";

type AuthServiceProps = {
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setUser: React.Dispatch<React.SetStateAction<InitiateUser>>;
};

export const useAuthService = ({ setLoading, setUser }: AuthServiceProps) => {
  const [isSignIn, setIsSignIn] = useState<boolean>(JSON.safeParse(localStorage.getItem("is-sign-in")!, false));

  const signAuthFetcher =
    (path: "/signin" | "/signup") =>
    ({ signal }: { signal: AbortSignal }, body: Partial<User>, config?: ApiConfig) =>
      api.auth.post<InitiateUser>(path, body, { signal, ...config });

  const signIn = useMemo(
    () =>
      new Request(signAuthFetcher("/signin"))
        .loading(setLoading)
        .onSuccess(() => setIsSignIn(true))
        .mergeState(setUser)
        .retry(3),
    [setLoading, setUser]
  );

  const signUp = useMemo(() => signIn.clone(signAuthFetcher("/signup")), [signIn]);

  return { signUp, signIn, isSignIn };
};
