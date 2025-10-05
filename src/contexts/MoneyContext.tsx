import api from "@/services/server/ApiClient";
import { Request } from "@/services/server/Request";
import { useMoneyService, type MoneyServices } from "@/services/models/moneyService";
import type { Money } from "@/types/models";
import { createContext, useEffect, useState } from "react";
import { useUser } from ".";
import dayjs from "dayjs";

type MoneyValues = {
  money: Money;
  setMoney: React.Dispatch<React.SetStateAction<Money>>;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
} & MoneyServices;

const defaultMonet: Money = {
  id: "",
  userId: "",
  income: "$0.00",
  outcome: "$0.00",
  total: "$0.00",
  updatedAt: dayjs(0),
  createdAt: dayjs(),
};

const defaultValues: MoneyValues = {
  money: defaultMonet,
  setMoney() {},
  loading: true,
  setLoading() {},
  getMoney: new Request(() => api.money.get("/")),
};

// eslint-disable-next-line react-refresh/only-export-components
export const MoneyContext = createContext<MoneyValues>(defaultValues);

export const MoneyProvider = ({ children }: { children: React.ReactNode }) => {
  const { isInitiated, isSignIn } = useUser();
  const [money, setMoney] = useState(defaultMonet);
  const [loading, setLoading] = useState(false);

  const { getMoney } = useMoneyService({ setLoading, setMoney });

  useEffect(() => {
    if (isInitiated && isSignIn) {
      getMoney.clone().safeExec();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInitiated, isSignIn]);

  const value: MoneyValues = {
    money,
    setMoney,
    loading,
    setLoading,
    getMoney,
  };

  return <MoneyContext.Provider value={value}>{children}</MoneyContext.Provider>;
};
