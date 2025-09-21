import api, { type ApiConfig } from "@/class/server/ApiClient";
import { Request, type RequestFetcher } from "@/class/server/Request";
import type { InitiateUser, User } from "@/types/models";
import dayjs from "dayjs";
import { createContext, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router";

type SignAuth = Request<InitiateUser, [body: Partial<User>, config?: ApiConfig | undefined]>;

type UserValues = {
  user: InitiateUser;
  setUser: React.Dispatch<React.SetStateAction<InitiateUser>>;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  isSignIn: boolean;
  setIsSignIn: React.Dispatch<React.SetStateAction<boolean>>;
  initiate: Request<InitiateUser, [config?: ApiConfig | undefined]>;
  getUser: Request<User, [config?: ApiConfig | undefined]>;
  signIn: SignAuth;
  signUp: SignAuth;
};

const defaultUser: InitiateUser = {
  id: "",
  fullName: "",
  email: undefined,
  gmail: undefined,
  verified: false,
  role: "USER",
  currency: "",
  timeToAllowSendEmail: dayjs(0),
  updatedAt: dayjs(0),
  createdAt: dayjs(0),
  money: { id: "", createdAt: dayjs(0), income: "", outcome: "", total: "", updatedAt: dayjs(0), userId: "" },
  links: [],
  notes: [],
  schedules: [],
  todos: [],
  transactions: [],
};

const defaultValues: UserValues = {
  user: defaultUser,
  setUser() {},
  initiate: new Request(() => api.user.get("/")),
  getUser: new Request(() => api.user.get("/")),
  signIn: new Request(() => api.user.get("/")),
  signUp: new Request(() => api.user.get("/")),
  loading: false,
  setLoading() {},
  isSignIn: false,
  setIsSignIn() {},
};

// eslint-disable-next-line react-refresh/only-export-components
export const UserContext = createContext<UserValues>(defaultValues);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<InitiateUser>(defaultUser);
  const [loading, setLoading] = useState(false);
  const [isSignIn, setIsSignIn] = useState<boolean>(JSON.safeParse(localStorage.getItem("is-sign-in")!, false));
  const [isInitiated, setIsInitiated] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isSignPage = location.pathname === "/signin" || location.pathname === "/signup";

  const reqInitial = <A extends any[]>(fetcher: RequestFetcher<InitiateUser, A>) =>
    new Request(fetcher)
      .loading(setLoading)
      .onSuccess(() => setIsSignIn(true))
      .setState(setUser);

  const reqUser = <A extends any[]>(fetcher: RequestFetcher<User, A>) =>
    new Request(fetcher)
      .loading(setLoading)
      .onSuccess(() => setIsSignIn(true))
      .mergeState(setUser);

  const initiate = useMemo(() => reqInitial(({ signal }, config?: ApiConfig) => api.user.get("/initiate", { signal, ...config })), []);

  useEffect(() => {
    initiate.safeExec().finally(() => setIsInitiated(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const getUser = useMemo(() => reqUser(({ signal }, config?: ApiConfig) => api.user.get("/", { signal, ...config })), []).retry(2);

  const signIn = useMemo(
    () => reqInitial(({ signal }, body: Partial<User>, config?: ApiConfig) => api.auth.post("/signin", body, { signal, ...config })).retry(3),
    []
  );

  const signUp = useMemo(
    () => reqInitial(({ signal }, body: Partial<User>, config?: ApiConfig) => api.auth.post("/signup", body, { signal, ...config })).retry(3),
    []
  );

  const value: UserValues = {
    initiate,
    user,
    setUser,
    loading,
    setLoading,
    getUser,
    signIn,
    signUp,
    isSignIn,
    setIsSignIn,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
