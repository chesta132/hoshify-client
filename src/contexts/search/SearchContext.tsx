/* eslint-disable react-refresh/only-export-components */
import type { SuggestionSource } from "@/components/form/Suggestion";
import { useDebounce } from "@/hooks/useDebounce";
import { createContext, useCallback, useEffect, useState } from "react";
import { useSuggestion } from "./SuggestionHooks";
import { useFilter, type Order, type SortBy } from "./FIlterHooks";

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
  filterModel: string[];
  setFilterModel: React.Dispatch<React.SetStateAction<string[]>>;
  sortBy: SortBy;
  setSortBy: React.Dispatch<React.SetStateAction<SortBy>>;
  order: Order;
  setOrder: React.Dispatch<React.SetStateAction<Order>>;
};

const defaultValues: SearchValues = {
  history: [],
  searchVal: "",
  searched: "",
  suggestion: [],
  filterModel: [],
  order: "desc",
  sortBy: "date",
  setSearchVal() {},
  setSearched() {},
  setHistory() {},
  search() {},
  setSuggestion() {},
  setFilterModel() {},
  setOrder() {},
  setSortBy() {},
};

export const SearchContext = createContext(defaultValues);

export const SearchProvider = ({ children }: { children: React.ReactNode }) => {
  const [searchVal, setSearchVal] = useState("");
  const [searched, setSearched] = useState("");
  const { filterModel, order, sortBy, setFilterModel, setOrder, setSortBy } = useFilter();

  const search = useCallback(
    (search = searchVal) => {
      if (searched === search) return;
      if (search.trim() === "") return;

      // [WIP] - SERVER
      console.log(search);
      setSearched(search);
    },
    [searchVal, searched]
  );

  const { history, setHistory, setSuggestion, suggestion } = useSuggestion({ setSearchVal, search, searchVal });

  const debounceSearch = useDebounce(search, 600);

  useEffect(() => {
    debounceSearch(searchVal);
  }, [searchVal, debounceSearch]);

  const value: SearchValues = {
    history,
    searchVal,
    searched,
    suggestion,
    filterModel,
    order,
    sortBy,
    setSearchVal,
    setSearched,
    setHistory,
    search,
    setSuggestion,
    setFilterModel,
    setOrder,
    setSortBy,
  };

  return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>;
};
