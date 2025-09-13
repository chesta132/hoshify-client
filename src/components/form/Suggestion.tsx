import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Button } from "../ui/button";
import { ArrowUpLeft, Trash2 } from "lucide-react";
import clsx from "clsx";
import { ellipsis } from "@/utils/manipulate/string";
import { AnimatePresence, motion, type HTMLMotionProps } from "motion/react";

export type SuggestionSource = {
  action: (suggest: string) => void;
  deletes: (suggest: string) => void;
  suggestion: string;
  icon?: React.ReactNode;
}[];

export type SuggestionProps = {
  inputRef: React.RefObject<HTMLInputElement | null>;
  source: SuggestionSource;
  setValue: (suggestion: string) => void;
  max?: number;
  setIsFocus: React.Dispatch<React.SetStateAction<boolean>>;
} & HTMLMotionProps<"ul">;

export const Suggestion = ({ inputRef, source, setValue, className, style, max, setIsFocus, ...wrapperProps }: SuggestionProps) => {
  const [position, setPosition] = useState({ left: 0, top: 0, width: 0, height: 0 });
  const [highlight, setHighlight] = useState<null | number>(null);
  const ulRef = useRef<HTMLUListElement>(null);

  useLayoutEffect(() => {
    if (!inputRef.current) return;

    const updatePosition = () => {
      const rect = inputRef.current!.getBoundingClientRect();
      setPosition({
        left: rect.left,
        top: rect.top + rect.height,
        width: rect.width,
        height: rect.height,
      });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [inputRef]);

  const handleClick = (
    e: React.MouseEvent<HTMLButtonElement | HTMLLIElement, MouseEvent> | React.KeyboardEvent<HTMLButtonElement | HTMLLIElement>
  ) => {
    e.stopPropagation();
    e.preventDefault();
    inputRef.current?.focus();
    setHighlight(null);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setHighlight((prev) => {
            if (prev === null) return 0;
            if (prev >= source.length - 1) {
              return 0;
            }
            return ++prev;
          });
          return;
        case "ArrowUp":
          e.preventDefault();
          setHighlight((prev) => {
            if (prev === null) return source.length - 1;
            if (prev <= 0) {
              return source.length - 1;
            }
            return --prev;
          });
          return;
        case "Enter":
        case " ":
          setHighlight((highlight) => {
            if (highlight !== null) {
              e.preventDefault();
              queueMicrotask(() => {
                const { action, suggestion } = source[highlight];
                action(suggestion);
                inputRef.current?.blur();
                setIsFocus(false);
              });
            }
            return highlight;
          });
          return;
      }
      setHighlight(null);
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [inputRef, setIsFocus, setValue, source]);

  return (
    <>
      <motion.ul
        style={{
          ...style,
          width: position.width,
        }}
        className={clsx(
          "bg-popover absolute scroll-bar border rounded-b-md overflow-hidden",
          max == null && "max-h-72 overflow-y-auto overflow-x-hidden",
          className
        )}
        role="listbox"
        initial={{ height: 0 }}
        animate={{ height: "auto" }}
        exit={{ height: 0 }}
        ref={ulRef}
        {...wrapperProps}
      >
        {source
          .filter((_, idx) => max == null || idx < max)
          .map(({ action, suggestion, deletes, icon }, idx) => {
            type ButtonEvent = React.MouseEvent<HTMLButtonElement, MouseEvent> | React.KeyboardEvent<HTMLButtonElement>;
            const acceptableKey = ["Enter", " "];

            const act = (e: React.MouseEvent<HTMLLIElement, MouseEvent>) => {
              handleClick(e);
              queueMicrotask(() => action(suggestion));
              inputRef.current?.blur();
              setIsFocus(false);
            };

            const del = (e: ButtonEvent) => {
              if ((e as React.KeyboardEvent<HTMLButtonElement>)?.key) {
                if (!acceptableKey.includes((e as any).key)) {
                  return;
                }
              }
              handleClick(e);
              deletes(suggestion);
            };

            const insert = (e: ButtonEvent) => {
              if ((e as React.KeyboardEvent<HTMLButtonElement>)?.key) {
                if (!acceptableKey.includes((e as any).key)) {
                  if (idx === source.length - 1 && (e as any).key === "Tab") {
                    setIsFocus(false);
                  }
                  return;
                }
              }
              handleClick(e);
              setValue(suggestion);
            };

            return (
              <motion.li
                key={suggestion}
                onMouseDown={act}
                className="flex justify-between p-2 items-center cursor-pointer hover:bg-popover-foreground/10 focus:outline-0 transition-all relative overflow-hidden border-b border-b-popover-foreground/10"
                role="option"
                tabIndex={0}
                onFocus={() => setHighlight(idx)}
                onBlur={() => {
                  setHighlight(null);
                  // if (idx === source.length - 1) {
                  //   setIsFocus(false);
                  // }
                }}
              >
                <AnimatePresence>
                  {highlight === idx && (
                    <>
                      <motion.div
                        transition={{ type: "keyframes", ease: "easeInOut", duration: 0.2 }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 100 }}
                        exit={{ opacity: 0 }}
                        layoutId="suggestion-left-highlight"
                        className="bg-popover-foreground/50 absolute left-0 h-1/2 w-0.5"
                      />
                      <motion.div
                        layoutId={"suggestion-highlight"}
                        transition={{ type: "keyframes", ease: "easeInOut", duration: 0.2 }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 100 }}
                        exit={{ opacity: 0 }}
                        className="bg-popover-foreground/10 absolute h-full w-full left-0"
                      />
                    </>
                  )}
                </AnimatePresence>
                <div className="flex gap-2 items-center">
                  {icon}
                  <span className="text-[13.5px]">{ellipsis(suggestion, { width: { px: position.width - 100, fontSize: 13.5 } })}</span>
                </div>
                <div className="flex gap-1">
                  <Button aria-label="Delete suggestion" type="button" variant={"ghost"} size={"icon"} onMouseDown={del} onKeyDown={del}>
                    <Trash2 />
                  </Button>
                  <Button type="button" variant={"ghost"} size={"icon"} onMouseDown={insert} onKeyDown={insert}>
                    <ArrowUpLeft />
                  </Button>
                </div>
              </motion.li>
            );
          })}
      </motion.ul>
    </>
  );
};
