import { useState } from "react";
import { Button } from "@/components/form/Button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/popup/Popover";
import { Checkbox } from "@/components/form/Checkbox";
import { ArrowUpNarrowWide, Filter } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/form/Radio";
import { capital } from "@/utils/manipulate/string";
import { useSearch } from "@/contexts";
import { searchableModels } from "@/contexts/search/FIlterHooks";
import { cn } from "@/lib/utils";

export function FilterSearch() {
  const { filterModel, setFilterModel, sortBy, setSortBy, order: searchOrder, setOrder: setSearchOrder } = useSearch();

  const [selectedModels, setSelectedModels] = useState(filterModel);
  const [sort, setSort] = useState(sortBy);
  const [order, setOrder] = useState(searchOrder);
  const [isOpen, setIsOpen] = useState(false);

  const toggleModel = (model: string) => {
    setSelectedModels((prev) => (prev.includes(model) ? prev.filter((m) => m !== model) : [...prev, model]));
  };

  const handleOpen = (val: boolean, isApply?: boolean) => {
    if (!isApply && !val) {
      setSelectedModels(filterModel);
      setSort(sortBy);
      setOrder(searchOrder);
    }
    setIsOpen(val);
  };

  const applyFilters = () => {
    setFilterModel(selectedModels);
    setSortBy(sort);
    setSearchOrder(order);
    handleOpen(false, true);
  };

  return (
    <Popover open={isOpen} onOpenChange={handleOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" aria-haspopup="true" aria-expanded={isOpen} aria-controls="filter-popover-content" aria-label="Open filter options">
          <Filter aria-hidden="true" />
        </Button>
      </PopoverTrigger>
      <PopoverContent id="filter-popover-content" className="w-64 p-4 space-y-4" aria-label="Filter and sort options">
        <div>
          <h4 id="filter-section-title" className="font-medium mb-2">
            Filter
          </h4>
          <div className="flex flex-col gap-2 text-sm" role="group" aria-labelledby="filter-section-title">
            {searchableModels.map((model) => (
              <label key={model} className="flex items-center gap-2 cursor-pointer w-fit">
                <Checkbox
                  checked={selectedModels.includes(model)}
                  onCheckedChange={() => toggleModel(model)}
                  aria-checked={selectedModels.includes(model)}
                  aria-label={model}
                />
                <span>{capital(model)}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="h-px w-full bg-muted-foreground" role="separator" aria-hidden="true" />
        <div>
          <h4 id="sort-section-title" className="font-medium mb-2">
            Sort
          </h4>
          <div className="flex gap-2 justify-between">
            <RadioGroup
              className="flex flex-col gap-2 text-sm"
              value={sort}
              onValueChange={(val) => setSort(val as "date" | "title")}
              aria-labelledby="sort-section-title"
            >
              <div className="flex gap-2 items-center">
                <RadioGroupItem value="date" id="by-date" className="cursor-pointer" aria-label="Sort by date" />
                <label htmlFor="by-date" className="cursor-pointer">
                  By Date
                </label>
              </div>
              <div className="flex gap-2 items-center">
                <RadioGroupItem value="title" id="by-title" className="cursor-pointer" aria-label="Sort by title" />
                <label htmlFor="by-title" className="cursor-pointer">
                  By Title
                </label>
              </div>
            </RadioGroup>
            <Button
              variant="outline"
              onClick={() => setOrder(order === "asc" ? "desc" : "asc")}
              aria-label={`Change sort order to ${order === "asc" ? "descending" : "ascending"}`}
            >
              <ArrowUpNarrowWide aria-hidden="true" className={cn("transition-transform", order === "desc" && "rotate-180")} />
              {capital(order)}
            </Button>
          </div>
        </div>
        <div className="w-full mt-3 flex gap-2">
          <Button className="w-1/2" onClick={() => handleOpen(false)} aria-label="Apply selected filters and sorting" variant={"outline"}>
            Cancel
          </Button>
          <Button className="w-1/2" onClick={applyFilters} aria-label="Apply selected filters and sorting">
            Apply
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
