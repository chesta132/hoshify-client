import api, { type ApiConfig } from "@/class/server/ApiClient";
import { Request } from "@/class/server/Request";
import type { InitiateUser } from "@/types/models";
import type { ResponseOf, AuthEndpoints, BodyOf } from "@/types/server/endpoints";
import { useMemo, useState } from "react";

type AuthServiceProps = {
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setUser: React.Dispatch<React.SetStateAction<InitiateUser>>;
};

export const useAuthService = ({ setLoading, setUser }: AuthServiceProps) => {
  const [isSignIn, setIsSignIn] = useState<boolean>(JSON.safeParse(localStorage.getItem("is-sign-in")!, false));

  const signAuthFetcher =
    <P extends "/signin" | "/signup">(path: P) =>
    ({ signal }: { signal: AbortSignal }, body: BodyOf<AuthEndpoints["post"], P>, config?: ApiConfig) =>
      api.auth.post<ResponseOf<AuthEndpoints["post"], P>>(path, body, { signal, ...config });

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
