/* eslint-disable react-refresh/only-export-components */
import type { SuggestionSource } from "@/components/form/Suggestion";
import { useDebounce } from "@/hooks/useDebounce";
import { createContext, useCallback, useEffect, useState } from "react";
import { useSuggestion } from "./SuggestionHooks";

export type SearchValues = {
  history: string[];
  setHistory: React.Dispatch<React.SetStateAction<string[]>>;
  searchVal: string;
  setSearchVal: React.Dispatch<React.SetStateAction<string>>;
  searched: string;
  setSearched: React.Dispatch<React.SetStateAction<string>>;
  search: (searchVal: string) => void;
  suggestion: SuggestionSource;
  setSuggestion: React.Dispatch<React.SetStateAction<SuggestionSource>>;
};

const defaultValues: SearchValues = {
  history: [],
  searchVal: "",
  searched: "",
  suggestion: [],
  setSearchVal() {},
  setSearched() {},
  setHistory() {},
  search() {},
  setSuggestion() {},
};

export const SearchContext = createContext(defaultValues);

export const SearchProvider = ({ children }: { children: React.ReactNode }) => {
  const [searchVal, setSearchVal] = useState("");
  const [searched, setSearched] = useState("");

  const search = useCallback(
    (search: string = searchVal) => {
      if (searched === search) return;
      if (search.trim() === "") return;

      // [WIP] - SERVER
      console.log(search);
      setSearched(search);
    },
    // setHistory block scope
    [searchVal, searched]
  );

  const { history, setHistory, setSuggestion, suggestion } = useSuggestion({ setSearchVal, search, searchVal });

  const debounce = useDebounce(search, 600);

  useEffect(() => {
    debounce(searchVal);
  }, [searchVal, debounce]);

  const value: SearchValues = {
    history,
    searchVal,
    searched,
    suggestion,
    setSearchVal,
    setSearched,
    setHistory,
    search,
    setSuggestion,
  };

  return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>;
};
