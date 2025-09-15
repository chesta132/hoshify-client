import { useEffect, useState } from "react";

export type SortBy = "date" | "title";
export type Order = "asc" | "desc";

export const searchableModels = ["notes", "transactions", "todos", "schedules"];
export type LocalFilter = { filterModel: string[]; sortBy: SortBy; order: Order };

export const useFilter = () => {
  const defaultFilter = {
    filterModel: searchableModels,
    sortBy: "date",
    order: "desc",
  } as LocalFilter;

  const getLocalFilter = () => {
    const local = JSON.parse(localStorage.getItem("filter-search") || JSON.stringify(defaultFilter)) as LocalFilter;
    let hasError = false;
    if (!local.filterModel) {
      local.filterModel = defaultFilter.filterModel;
      hasError = true;
    }
    if (!local.order) {
      local.order = defaultFilter.order;
      hasError = true;
    }
    if (!local.sortBy) {
      local.sortBy = defaultFilter.sortBy;
      hasError = true;
    }
    if (hasError) {
      localStorage.setItem("filter-search", JSON.stringify(local));
    }
    return local;
  };

  const localFilter = getLocalFilter();

  const [filterModel, setFilterModel] = useState(localFilter.filterModel);
  const [sortBy, setSortBy] = useState(localFilter.sortBy);
  const [order, setOrder] = useState(localFilter.order);

  useEffect(() => {
    localStorage.setItem("filter-search", JSON.stringify({ filterModel, sortBy, order }));
  }, [filterModel, order, sortBy]);

  return { filterModel, setFilterModel, sortBy, setSortBy, order, setOrder };
};
