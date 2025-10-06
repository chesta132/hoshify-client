import { Button } from "@/components/form/Button";
import { DeletePopup } from "@/components/popup/DeletePopup";
import { Popup } from "@/components/popup/Popup";
import { useNote } from "@/contexts";
import { useDebounce } from "@/hooks/useDebounce";
import { useResize } from "@/hooks/useEventListener";
import { cn } from "@/lib/utils";
import type { Note } from "@/types/models";
import { ellipsis } from "@/utils/manipulate/string";
import { ArrowDown, Info, Trash } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";

type NoteOptionProps = {
  setInfo: React.Dispatch<React.SetStateAction<string | null>>;
  note: Note;
  expanded: boolean;
  setExpanded: (val: boolean) => void;
};

export const NoteOption = ({ note, expanded, setExpanded, setInfo }: NoteOptionProps) => {
  const { deleteNote } = useNote();
  const [deletePopup, setDeletePopup] = useState(false);
  const [wrapperRect, setWrapperRect] = useState<DOMRect | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const handleResize = useDebounce(({ target }: ResizeObserverEntry) => {
    setWrapperRect(target.getBoundingClientRect());
  }, 200);
  useResize(wrapperRef, handleResize);

  const handleDelete = () => {
    deleteNote.exec(note.id);
  };

  return (
    <div
      className={cn("rounded-[12px] border-[0.8px] border-border bg-card-foreground/5 px-3 py-2 text-sm transition-[padding]", expanded && "py-3")}
      ref={wrapperRef}
    >
      <div className="flex justify-between gap-2 items-center">
        <span className="wrap-anywhere">
          {ellipsis(note.title, {
            px: ((wrapperRect?.width || 500) - 120) * 2,
          })}
        </span>
        <div className="gap-2 flex h-fit">
          <Button variant={"outline"} size={"icon"} onClick={() => setInfo(note.id)}>
            <Info size={16} />
          </Button>
          <Button variant={"outline"} size={"icon"} onClick={() => setDeletePopup(true)}>
            <Trash size={16} />
          </Button>
          <Button variant={"outline"} size={"icon"} onClick={() => setExpanded(!expanded)}>
            <ArrowDown
              size={16}
              aria-expanded={expanded}
              aria-describedby={`note-${note.title}-details`}
              aria-label="Toggle note details"
              className={cn("transition-transform", expanded && "rotate-180")}
            />
          </Button>
        </div>
      </div>
      <AnimatePresence>
        {expanded && (
          <>
            <div className="h-px w-full bg-border my-1" role="separator" />
            <motion.p
              id={`note-${note.title}-details`}
              initial={{ height: 0 }}
              animate={{ height: "auto" }}
              exit={{ height: 0 }}
              transition={{ duration: 0.15 }}
              className="p-3 rounded-lg overflow-hidden bg-background/65 border-2 border-border text-foreground/95"
            >
              {note.details}
            </motion.p>
          </>
        )}
        {deletePopup && (
          <Popup blur>
            <DeletePopup animate titleItem="note" item={note.title} onDelete={handleDelete} onCancel={() => setDeletePopup(false)} />
          </Popup>
        )}
      </AnimatePresence>
    </div>
  );
};
