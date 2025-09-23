import api, { type ApiConfig } from "@/class/server/ApiClient";
import { Request } from "@/class/server/Request";
import type { InitiateUser, User } from "@/types/models";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router";

type AuthServiceProps = {
  isInitiated: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  user: InitiateUser;
  setUser: React.Dispatch<React.SetStateAction<InitiateUser>>;
};

export const useAuthService = ({ isInitiated, setLoading, setUser, user }: AuthServiceProps) => {
  const [isSignIn, setIsSignIn] = useState<boolean>(JSON.safeParse(localStorage.getItem("is-sign-in")!, false));
  const navigate = useNavigate();
  const location = useLocation();
  const isSignPage = location.pathname === "/signin" || location.pathname === "/signup";

  useEffect(() => {
    localStorage.setItem("is-sign-in", JSON.stringify(isSignIn));
  }, [isSignIn]);

  useEffect(() => {
    if (user.id === "" && isInitiated) {
      setIsSignIn(false);
    }
  }, [isInitiated, user.id]);

  useEffect(() => {
    if (!isSignIn && isInitiated && !isSignPage) {
      navigate("/signin");
    }
  }, [isInitiated, isSignIn, isSignPage, navigate]);

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
