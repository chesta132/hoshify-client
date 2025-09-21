import { Button } from "@/components/form/button";
import { Popup } from "@/components/ui/popup";
import { useClickOutside } from "@/hooks/useEventListener";
import { Plus } from "lucide-react";
import { AnimatePresence } from "motion/react";
import { useRef, useState } from "react";
import { LinkPopup } from "./LinkPopup";
import { LinkOptions } from "./LinkOptions";

export type Popup = "add" | `edit/${string}${string}` | "closed";
// eslint-disable-next-line react-refresh/only-export-components
export const formSchema = { link: "", title: "" } as const;

export const QuickLinks = () => {
  const [popup, setPopup] = useState<Popup>("closed");
  const [optionIndex, setOptionIndex] = useState<null | number>(null);
  const linkWrapper = useRef<HTMLDivElement>(null);
  const linkRefs = useRef<React.RefObject<HTMLAnchorElement | null>[]>([]);

  useClickOutside(linkRefs?.current[optionIndex || 0] || [], () => optionIndex !== null && setOptionIndex(null));

  const handlePopup = (action: Popup) => () => {
    (document.activeElement as HTMLElement)?.blur();
    setPopup(action);
  };

  return (
    <div className="border-[0.8px] border-border rounded-[18px] py-3 px-4 space-y-1">
      <h1 className="font-heading font-semibold">Quick Links</h1>
      <div className="flex gap-2 px-3 overflow-x-auto scroll-bar py-2" ref={linkWrapper}>
        <LinkOptions setPopup={setPopup} />
        <div
          onClick={handlePopup("add")}
          className="cursor-pointer flex flex-col justify-between items-center gap-1 text-center px-2 py-3 min-w-20 hover:bg-muted rounded-md"
        >
          <Button variant={"outline"} className="size-10">
            <Plus />
          </Button>
          <span className="text-xs">Add</span>
        </div>
      </div>
      <AnimatePresence>{popup !== "closed" && <LinkPopup popup={popup} setPopup={setPopup} />}</AnimatePresence>
    </div>
  );
};
