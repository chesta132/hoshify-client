import { Eye, EyeOff, Search, X } from "lucide-react";
import { useLayoutEffect, useRef, useState } from "react";
import clsx from "clsx";
import { FloatingLabel } from "./FloatingLabel";
import { StartEnd } from "./StartEnd";
import { Suggestion, type SuggestionSource } from "./Suggestion";
import { AnimatePresence } from "motion/react";
import { kebab } from "@/utils/manipulate/string";

export type InputProps = {
  error?: string | null;
  label?: string;
  value?: string;
  optional?: boolean;
  classLabel?: string;
  classError?: string;
  classInput?: string;
  focus?: boolean;
  start?: React.ReactNode;
  end?: React.ReactNode;
  onSearch?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
  size?: "sm" | "md" | "lg";
  suggestion?: SuggestionSource;
  onValueChange?: (value: string) => void;
  inputRef?: React.RefObject<HTMLInputElement | null>;
  resetButton?: boolean;
  focusRing?: boolean;
} & Omit<React.ComponentProps<"input">, "size">;

export const Input = ({
  type = "text",
  placeholder,
  error,
  label,
  value = "",
  className,
  optional,
  classLabel,
  classError,
  classInput,
  focus,
  start,
  end,
  size,
  onSearch,
  suggestion,
  onValueChange,
  inputRef: inputRefProps,
  resetButton,
  focusRing,
  ...inputProps
}: InputProps) => {
  const [internalValue, setInternalValue] = useState(value);
  const [isFocus, setIsFocus] = useState(focus === undefined ? internalValue !== "" : focus);
  const [inputType, setInputType] = useState(type);
  const [padding, setPadding] = useState<React.CSSProperties>({});

  const inputRef = useRef<HTMLInputElement>(null);
  const startRef = useRef<HTMLDivElement>(null);
  const ref = inputRefProps ?? inputRef;

  const iconSize = size === "sm" ? 18 : size === "lg" ? 23 : 20;
  const isSuggestOpen = suggestion && suggestion.length !== 0 && isFocus;
  const endClass = `cursor-pointer absolute right-2 flex items-center top-1/2 ${size === "lg" ? "-translate-y-1/3" : "-translate-y-1/2"}`;

  useLayoutEffect(() => {
    const start = startRef.current?.offsetWidth;
    if (start) {
      setPadding({ paddingLeft: start ? start + 20 : undefined });
    }
  }, [start, end]);

  useLayoutEffect(() => {
    if (value !== internalValue) setInternalValue(value);
    if (internalValue !== "") setIsFocus(true);
  }, [value, internalValue]);

  const handleSearch = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (!isFocus) {
      if (ref.current) {
        ref.current.focus();
      }
    } else if (onSearch) {
      onSearch(e);
    }
  };

  const handleChange = (value: string) => {
    setInternalValue(value);
    onValueChange?.(value);
  };

  const hypenLabel = kebab(label?.toLowerCase() || placeholder?.toLowerCase() || "unknown");

  return (
    <div className={clsx("relative", error && (classError || "mb-3"), className, size === "sm" && "py-1.5", size === "lg" && "h-13")}>
      <input
        className={clsx(
          "w-full px-4 py-3 border border-accent text-foreground transition-all duration-200 ease-in-out focus:outline-none focus:border-accent",
          (type === "password" || resetButton) && "pr-8",
          error && "border-red-500!",
          size === "sm" && "h-10",
          size === "lg" && "h-15",
          isSuggestOpen ? "rounded-t-md" : "rounded-md",
          focusRing && "focus:ring-2 focus:ring-primary/30",
          classInput
        )}
        ref={ref}
        style={padding}
        type={inputType}
        id={hypenLabel}
        value={internalValue}
        onInput={(e) => handleChange((e.target as HTMLInputElement).value)}
        onFocus={() => {
          setIsFocus(true);
        }}
        onBlur={(e) => {
          if (e.relatedTarget?.closest(`.${hypenLabel}-suggestions`)) return;
          if (internalValue !== "") return;
          setIsFocus(false);
        }}
        autoComplete="off"
        {...inputProps}
      />
      <FloatingLabel {...{ isFloat: isFocus || internalValue !== "", size, classLabel, padding, label, placeholder, optional }} />

      {type === "password" && !end && (
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            setInputType((prev) => (prev === "password" ? "text" : "password"));
          }}
          onKeyDown={(e) => {
            if (e.key !== "Enter" && e.key !== " ") return;
            e.preventDefault();
            setInputType((prev) => (prev === "password" ? "text" : "password"));
          }}
          className={clsx(endClass, "focus:outline-none focus:ring-2 focus:ring-primary/50 rounded-sm")}
          aria-label={inputType === "password" ? "Hide password" : "Show password"}
        >
          {inputType === "password" ? (
            <EyeOff size={iconSize} className="text-accent-foreground rounded-xs" />
          ) : (
            <Eye size={iconSize} className="text-accent-foreground rounded-xs" />
          )}
        </button>
      )}
      {type === "search" && !start && (
        <div
          onClick={handleSearch}
          ref={startRef}
          className={`absolute ${size === "sm" || size === "lg" ? "top-4.5" : "top-3.5"} left-3 cursor-pointer`}
        >
          <Search size={iconSize} className="text-accent-foreground" />
        </div>
      )}
      {resetButton && type !== "password" && !end && internalValue !== "" && (
        <div
          className={endClass}
          onClick={() => {
            handleChange("");
            ref.current?.focus();
            setIsFocus(true);
          }}
        >
          <X size={iconSize} className="text-accent-foreground" />
        </div>
      )}

      <StartEnd {...{ start, end, setPadding }} />
      {error && <p className="absolute text-red-500 text-[12px] text-start">{error}</p>}
      <AnimatePresence>
        {isSuggestOpen && type !== "password" && (
          <Suggestion
            className={`${label}-suggestions`}
            max={5}
            inputRef={ref}
            source={suggestion}
            setValue={(val) => onValueChange?.(val)}
            setIsFocus={setIsFocus}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
