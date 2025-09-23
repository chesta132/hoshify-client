import api, { type ApiConfig } from "@/class/server/ApiClient";
import { Request } from "@/class/server/Request";
import { useAuthService } from "@/services/authService";
import { useUserService } from "@/services/userService";
import type { InitiateUser, User } from "@/types/models";
import dayjs from "dayjs";
import { createContext, useState } from "react";

type ConfigProp = [config?: ApiConfig];
type SignAuth = Request<InitiateUser, [body: Partial<User>, ...ConfigProp]>;

type UserValues = {
  user: InitiateUser;
  setUser: React.Dispatch<React.SetStateAction<InitiateUser>>;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  isSignIn: boolean;
  initiate: Request<InitiateUser, ConfigProp>;
  getUser: Request<User, ConfigProp>;
  signIn: SignAuth;
  signUp: SignAuth;
  isInitiated: boolean;
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
  loading: true,
  setLoading() {},
  isSignIn: false,
  isInitiated: false,
};

// eslint-disable-next-line react-refresh/only-export-components
export const UserContext = createContext<UserValues>(defaultValues);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<InitiateUser>(defaultUser);
  const [loading, setLoading] = useState(false);

  const { getUser, initiate, isInitiated } = useUserService({ setLoading, setUser });
  const { isSignIn, signIn, signUp } = useAuthService({ isInitiated, setLoading, setUser, user });

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
    isInitiated,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
