import api from "@/class/server/Api";
import type { DataType, ReturnByDataType } from "@/class/server/ServerSuccess";
import { createRequestHandler, type ReqHandlerOptions } from "@/services/requestHandler";
import type { InitiateUser, User } from "@/types/models";
import { createMergeState } from "@/utils/hookUtils";
import dayjs from "dayjs";
import { createContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";

type UserValues = {
  user: InitiateUser;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  isSignIn: boolean;
  setIsSignIn: React.Dispatch<React.SetStateAction<boolean>>;
  initiate: <T extends DataType>(options?: ReqHandlerOptions<InitiateUser, T>) => Promise<ReturnByDataType<T, InitiateUser>>;
  getUser: <T extends DataType>(options?: ReqHandlerOptions<User, T>) => Promise<ReturnByDataType<T, User>>;
  signIn: <T extends DataType>(
    data: Partial<User>,
    options?: Omit<ReqHandlerOptions<InitiateUser, T>, "directOnAuthError">
  ) => Promise<ReturnByDataType<T, InitiateUser>>;
  signUp: <T extends DataType>(
    data: Partial<User>,
    options?: Omit<ReqHandlerOptions<InitiateUser, T>, "directOnAuthError">
  ) => Promise<ReturnByDataType<T, InitiateUser>>;
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
  const [isSignIn, setIsSignIn] = useState<boolean>(JSON.parse(localStorage.getItem("is-sign-in") || "false"));
  const navigate = useNavigate();

  const setUserMerge = useMemo(() => createMergeState<InitiateUser, User>(setUser), [setUser]);
  const handleReq = createRequestHandler({
    setLoading,
    setState: setUserMerge,
    successCb() {
      setIsSignIn(true);
    },
  });

  const initiate = <T extends DataType>(options?: ReqHandlerOptions<InitiateUser, T>) => {
    return handleReq<InitiateUser, T>(() => api.user.get("/initiate"), { directOnAuthError: navigate, ...options });
  };

  useEffect(() => {
    // disable log on throw
    initiate().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    localStorage.setItem("is-sign-in", JSON.stringify(isSignIn));
  }, [isSignIn]);

  useEffect(() => {
    if (user.id === "") setIsSignIn(false);
  }, [user.id]);

  const getUser = <T extends DataType>(options?: ReqHandlerOptions<User, T>) => {
    return handleReq<User, T>(() => api.user.get("/"), options);
  };

  const signIn = <T extends DataType>(data: Partial<User>, options?: Omit<ReqHandlerOptions<InitiateUser, T>, "directOnAuthError">) => {
    return handleReq<InitiateUser, T>(() => api.auth.post("/signin", data), options);
  };

  const signUp = <T extends DataType>(data: Partial<User>, options?: Omit<ReqHandlerOptions<InitiateUser, T>, "directOnAuthError">) => {
    return handleReq<InitiateUser, T>(() => api.auth.post("/signup", data), options);
  };

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
