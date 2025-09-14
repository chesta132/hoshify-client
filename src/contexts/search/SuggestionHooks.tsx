import type { SuggestionSource } from "@/components/form/Suggestion";
import { noClone } from "@/utils/manipulate/array";
import { History } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

type UseSuggestionProps = {
  setSearchVal: React.Dispatch<React.SetStateAction<string>>;
  search: (search?: string) => void;
  searchVal: string;
};

export function useSuggestion({ setSearchVal, search, searchVal }: UseSuggestionProps) {
  const getHistoryFromLocal = () => {
    const local = noClone(JSON.parse(localStorage.getItem("search-history") || "[]")) as string[];
    while (local.length > 100) {
      local.pop();
    }
    return local;
  };

  const [history, setHistory] = useState(getHistoryFromLocal());
  const [suggestion, setSuggestion] = useState<SuggestionSource>([]);

  const saveHistory = useCallback((data: string[]) => {
    localStorage.setItem("search-history", JSON.stringify(noClone(data)));
  }, []);

  const getHistory = useCallback((save: boolean = true) => {
    const local = getHistoryFromLocal();
    if (save) setHistory(local);
    return local;
  }, []);

  useEffect(() => {
    const suggests: SuggestionSource = history
      .filter((history) => history.includes(searchVal))
      .sort((a, b) => {
        const aStarts = a.startsWith(searchVal) ? 0 : 1;
        const bStarts = b.startsWith(searchVal) ? 0 : 1;
        return aStarts - bStarts;
      })
      .map((suggestion) => ({
        suggestion,
        deletes(suggest) {
          setHistory((prev) => noClone(prev.filter((history) => history !== suggest)));
        },
        action(suggest) {
          setSearchVal(suggest);
          search(suggest);
          setHistory((prev) => noClone([suggest, ...prev.filter((history) => history !== suggest)]));
        },
        icon: <History size={18} />,
      }));

    setSuggestion(suggests);
  }, [history, search, searchVal, setSearchVal]);

  useEffect(() => {
    saveHistory(history.filter((h) => h.trim() !== ""));
  }, [history, saveHistory]);

  return { getHistory, history, setHistory, setSuggestion, suggestion };
}
