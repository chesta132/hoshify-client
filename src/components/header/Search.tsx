import { noClone } from "@/utils/manipulate/array";
import { Input } from "../form/Input";
import { useSearch } from "@/contexts";
import { useScrollingHeader } from "@/hooks/useScrollingHeader";
import { useEffect, useRef } from "react";

export const Search = () => {
  // WIP
  const { searchVal, setSearchVal, search, suggestion, setHistory } = useSearch();
  const timelineStatus = useScrollingHeader();
  const searchRef = useRef<HTMLInputElement>(null);

  function handleSubmit(e?: React.MouseEvent<HTMLDivElement, MouseEvent> | React.FormEvent<HTMLFormElement>) {
    if (e && typeof e !== "string") e.preventDefault();
    if (searchVal.trim() !== "") {
      search(searchVal);
      setHistory((prev) => noClone([searchVal.trim(), ...prev]));
    }
  }

  useEffect(() => {
    if (!timelineStatus) searchRef.current?.blur();
  }, [timelineStatus]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const { current } = searchRef;
      if (current) {
        const active = document.activeElement;
        switch (e.key) {
          case "Escape":
            if (active === current) {
              e.preventDefault();
              current.blur();
            }
            break;
          case "/":
            if (active !== current) {
              e.preventDefault();
              current.focus();
            }
            break;
        }
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  return (
    <form className="w-full flex justify-center" onSubmit={handleSubmit}>
      <Input
        value={searchVal}
        onValueChange={setSearchVal}
        className="w-full max-w-200"
        size="sm"
        type="search"
        placeholder="Search"
        label="Search"
        name="search"
        onSearch={handleSubmit}
        suggestion={suggestion}
        inputRef={searchRef}
        resetButton
      />
    </form>
  );
};
