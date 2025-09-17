import api from "@/class/server/Api";
import type { ServerSuccess } from "@/class/server/ServerSuccess";
import { createRequestHandler, type CreateReqHandlerOptions } from "@/services/requestHandler";
import type { InitiateUser, User } from "@/types/models";
import { createMergeState } from "@/utils/hookUtils";
import dayjs from "dayjs";
import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router";

type UserValues = {
  user: InitiateUser;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  isSignIn: boolean;
  setIsSignIn: React.Dispatch<React.SetStateAction<boolean>>;
  initiate: (options?: CreateReqHandlerOptions<InitiateUser>) => Promise<ServerSuccess<InitiateUser>>;
  getUser: (options?: CreateReqHandlerOptions<User>) => Promise<ServerSuccess<User>>;
  signIn: (data: Partial<User>, options?: Omit<CreateReqHandlerOptions<InitiateUser>, "directOnAuthError">) => Promise<ServerSuccess<InitiateUser>>;
  signUp: (data: Partial<User>, options?: Omit<CreateReqHandlerOptions<InitiateUser>, "directOnAuthError">) => Promise<ServerSuccess<InitiateUser>>;
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
  initiate: async () => defaultUser as any,
  getUser: async () => defaultUser as any,
  signIn: async () => defaultUser as any,
  signUp: async () => defaultUser as any,
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
  const [isSignIn, setIsSignIn] = useState<boolean>(Boolean(localStorage.getItem("is-sign-in") || "false"));
  const [isInitiated, setIsInitiated] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isSignPage = location.pathname === "/signin" || location.pathname === "/signup";

  const mergeUser = useMemo(() => createMergeState<InitiateUser, User>(setUser), [setUser]);
  const createReqConfig = {
    setLoading,
    onSuccess() {
      setIsSignIn(true);
    },
  } as const;
  const reqInitial = createRequestHandler({ ...createReqConfig, setState: setUser });
  const reqUser = createRequestHandler({ ...createReqConfig, setState: mergeUser });

  const initiate = useCallback(
    (options?: CreateReqHandlerOptions<InitiateUser>) => {
      return reqInitial<InitiateUser>(() => api.user.get("/initiate"), { directOnAuthError: navigate, ...options });
    },
    [reqInitial, navigate]
  );

  useEffect(() => {
    initiate()
      // PREVENT ERROR LOG
      .catch(() => {})
      .finally(() => setIsInitiated(true));
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

  const getUser = useCallback(
    (options?: CreateReqHandlerOptions<User>) => {
      return reqUser(() => api.user.get("/"), options);
    },
    [reqUser]
  );

  const signIn = useCallback(
    (data: Partial<User>, options?: Omit<CreateReqHandlerOptions<InitiateUser>, "directOnAuthError">) => {
      return reqInitial<InitiateUser>(() => api.auth.post("/signin", data), options);
    },
    [reqInitial]
  );

  const signUp = useCallback(
    (data: Partial<User>, options?: Omit<CreateReqHandlerOptions<InitiateUser>, "directOnAuthError">) => {
      return reqInitial<InitiateUser>(() => api.auth.post("/signup", data), options);
    },
    [reqInitial]
  );

  const value: UserValues = {
    initiate,
    user,
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
