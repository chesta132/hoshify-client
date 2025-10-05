import api from "@/services/server/ApiClient";
import { Request } from "@/services/server/Request";
import { useError } from "@/contexts";
import type { Money } from "@/types/models";
import { useMemo } from "react";

type MoneyServiceProps = {
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setMoney: React.Dispatch<React.SetStateAction<Money>>;
};

export type MoneyServices = {
  getMoney: Request<Money, []>;
};

export function useMoneyService({ setLoading, setMoney }: MoneyServiceProps): MoneyServices {
  const { setError } = useError();

  const getMoney = useMemo(
    () =>
      new Request(({ signal }) => api.money.get("/", { signal }))
        .retry(3)
        .loading(setLoading)
        .config({ handleError: { setError } })
        .mergeState(setMoney),
    [setError, setLoading, setMoney]
  );

  return { getMoney };
}
