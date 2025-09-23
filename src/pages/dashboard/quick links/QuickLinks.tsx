import { Button } from "@/components/form/button";
import { Popup } from "@/components/ui/popup";
import { Plus } from "lucide-react";
import { AnimatePresence, Reorder } from "motion/react";
import { useRef, useState } from "react";
import { LinkPopup } from "./LinkPopup";
import { LinkOptions } from "./LinkOptions";
import { useLink } from "@/contexts";
import type { Link as ModelLink } from "@/types/models";

export type Popup = "add" | `edit/${string}${string}` | "closed";

export const QuickLinks = () => {
  const [popup, setPopup] = useState<Popup>("closed");
  const linkWrapper = useRef<HTMLDivElement>(null);
  const [isDrag, setIsDrag] = useState(false);
  const [optionIndex, setOptionIndex] = useState<number | null>(null);

  const { links, setLinks } = useLink();

  const handlePopup = (action: Popup) => () => {
    (document.activeElement as HTMLElement)?.blur();
    setPopup(action);
  };

  const handleReorder = (newOrder: ModelLink[]) => {
    const updatedLinks = newOrder.map((link, index) => ({
      ...link,
      position: index + 1,
    }));

    setLinks(updatedLinks);
  };

  const handleDrop = () => {
    setIsDrag(false);

    // [WIP] - UPDATE POSITION
  };

  return (
    <div className="border-[0.8px] border-border rounded-[18px] py-3 px-4 space-y-1">
      <h1 className="font-heading font-semibold">Quick Links</h1>
      <div className="flex gap-2 px-3 overflow-x-auto scroll-bar py-2" ref={linkWrapper}>
        <Reorder.Group axis="x" values={links} onReorder={handleReorder} className="flex gap-2" style={{ display: "flex", gap: "0.5rem" }}>
          {links.map((link, idx) => (
            <Reorder.Item
              key={link.id}
              value={link}
              className="cursor-grab active:cursor-grabbing"
              whileDrag={{
                scale: 1.05,
                zIndex: 1000,
                boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
              }}
              whileHover={{
                scale: 1.02,
              }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
              }}
              dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
              dragElastic={0.7}
              onDragStart={() => setIsDrag(true)}
              onDragEnd={handleDrop}
            >
              <LinkOptions setPopup={setPopup} link={link} isDrag={isDrag} optionIndex={optionIndex} setOptionIndex={setOptionIndex} index={idx} />
            </Reorder.Item>
          ))}
        </Reorder.Group>

        <div
          onClick={handlePopup("add")}
          className="cursor-pointer flex flex-col justify-between items-center gap-1 text-center px-2 py-3 min-w-20 hover:bg-muted rounded-md shrink-0"
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
