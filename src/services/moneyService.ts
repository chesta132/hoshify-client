import api from "@/class/server/ApiClient";
import { Request } from "@/class/server/Request";
import { useError } from "@/contexts";
import type { Money } from "@/types/models";
import { useMemo } from "react";

type MoneyServiceProps = {
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
};

export type MoneyServices = {
  getMoney: Request<Money, []>;
};

export function useMoneyService({ setLoading }: MoneyServiceProps): MoneyServices {
  const { setError } = useError();

  const getMoney = useMemo(
    () => new Request(({ signal }) => api.money.get("/", { signal })).retry(3).loading(setLoading).config({ handleError: { setError } }),
    [setError, setLoading]
  );

  return { getMoney };
}
