import api, { type ApiConfig } from "@/class/server/ApiClient";
import { Request } from "@/class/server/Request";
import { useError } from "@/contexts";
import type { User } from "@/types/models";
import type { ResponseOf, AuthEndpoints, BodyOf, SignInBody, SignUpBody } from "@/types/server/endpoints";
import { useMemo, useState } from "react";

type AuthServiceProps = {
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setUser: React.Dispatch<React.SetStateAction<User>>;
};

export type AuthServices = {
  signUp: Request<User, [body: SignUpBody, config?: ApiConfig | undefined]>;
  signIn: Request<User, [body: SignInBody, config?: ApiConfig | undefined]>;
  isSignIn: boolean;
};

export const useAuthService = ({ setLoading, setUser }: AuthServiceProps): AuthServices => {
  const [isSignIn, setIsSignIn] = useState<boolean>(JSON.safeParse(localStorage.getItem("is-sign-in")!, false));
  const { setError } = useError();

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
        .retry(3)
        .config({ handleError: { setError } }),
    [setLoading, setUser, setError]
  );

  const signUp = useMemo(() => signIn.clone(signAuthFetcher("/signup")), [signIn]);

  return { signUp, signIn, isSignIn };
};
