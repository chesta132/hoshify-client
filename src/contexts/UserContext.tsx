import api from "@/class/server/Api";
import type { DataType, ReturnByDataType } from "@/class/server/ServerSuccess";
import { createRequestHandler, type FetchProps } from "@/services/requestHandler";
import type { InitiateUser, User } from "@/types/models";
import { createMergeSetter } from "@/utils/hookUtils";
import dayjs from "dayjs";
import { createContext, useEffect, useMemo, useState } from "react";

type UserValues = {
  user: InitiateUser;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  isSignIn: boolean;
  setIsSignIn: React.Dispatch<React.SetStateAction<boolean>>;
  initiate: <T extends DataType | undefined = undefined>(props?: FetchProps<InitiateUser, T>) => Promise<ReturnByDataType<T, InitiateUser> | null>;
  getUser: <T extends DataType | undefined = undefined>(props?: FetchProps<User, T>) => Promise<ReturnByDataType<T, User> | null>;
  signIn: <T extends DataType | undefined = undefined>(
    data: Partial<User>,
    props?: Omit<FetchProps<User, T>, "directOnAuthError">
  ) => Promise<ReturnByDataType<T, User> | null>;
  signUp: <T extends DataType | undefined = undefined>(
    data: Partial<User>,
    props?: Omit<FetchProps<User, T>, "directOnAuthError">
  ) => Promise<ReturnByDataType<T, User> | null>;
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
  initiate: async () => null,
  getUser: async () => null,
  signIn: async () => null,
  signUp: async () => null,
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
  const [isSignIn, setIsSignIn] = useState(false);

  const setUserMerge = useMemo(() => createMergeSetter(setUser), [setUser]);
  const handleReq = createRequestHandler({ setLoading, setState: setUserMerge });

  const initiate = <T extends DataType | undefined>(props?: FetchProps<InitiateUser, T>) => {
    return handleReq(() => api.get<InitiateUser>("/initiate"), { directOnAuthError: true, ...props });
  };

  useEffect(() => {
    initiate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getUser = <T extends DataType | undefined>(props?: FetchProps<User, T>) => {
    return handleReq(() => api.get<User>("/auth/"), props);
  };

  const signIn = <T extends DataType | undefined>(data: Partial<User>, props?: Omit<FetchProps<User, T>, "directOnAuthError">) => {
    return handleReq(() => api.post<User>("/auth/signin", data), props);
  };

  const signUp = <T extends DataType | undefined>(data: Partial<User>, props?: Omit<FetchProps<User, T>, "directOnAuthError">) => {
    return handleReq(() => api.post<User>("/auth/signup", data), props);
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
