import api from "@/services/server/ApiClient";
import { Request } from "@/services/server/Request";
import { useAuthService, type AuthServices } from "@/services/models/authService";
import { useUserService, type UserServices } from "@/services/models/userService";
import type { User } from "@/types/models";
import dayjs from "dayjs";
import { createContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";

type UserValues = {
  user: User;
  setUser: React.Dispatch<React.SetStateAction<User>>;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  isInitiated: boolean;
} & UserServices &
  AuthServices;

const defaultUser: User = {
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
};

const defaultValues: UserValues = {
  user: defaultUser,
  setUser() {},
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
  const [user, setUser] = useState<User>(defaultUser);
  const [loading, setLoading] = useState(false);
  const [isInitiated, setIsInitiated] = useState(false);
  const [isSignIn, setIsSignIn] = useState<boolean>(JSON.safeParse(localStorage.getItem("is-sign-in")!, false));

  const navigate = useNavigate();
  const location = useLocation();
  const isSignPage = location.pathname === "/signin" || location.pathname === "/signup";

  const { getUser } = useUserService({ setLoading, setUser });
  const { signIn, signUp } = useAuthService({ setLoading, setUser });

  useEffect(() => {
    getUser.safeExec().finally(() => setIsInitiated(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    localStorage.setItem("is-sign-in", JSON.stringify(isSignIn));
  }, [isSignIn]);

  useEffect(() => {
    if (isInitiated) {
      if (user.id === "") {
        setIsSignIn(false);
      } else {
        setIsSignIn(true);
        if (isSignPage) {
          navigate("/");
        }
      }
    }
  }, [isInitiated, isSignPage, navigate, user.id]);

  useEffect(() => {
    if (!isSignIn && isInitiated && !isSignPage) {
      navigate("/signin");
    }
  }, [isInitiated, isSignIn, isSignPage, navigate]);

  const value: UserValues = {
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
