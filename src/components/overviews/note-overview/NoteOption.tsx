import { Button } from "@/components/form/Button";
import { useNote } from "@/contexts";
import { cn } from "@/lib/utils";
import type { Note } from "@/types/models";
import { ArrowDown, Info, Trash } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRef } from "react";

export const NoteOption = ({ note, expanded, setExpanded }: { note: Note; expanded: boolean; setExpanded: (val: boolean) => void }) => {
  const { deleteNote } = useNote();
  const wrapperRef = useRef<HTMLDivElement>(null);

  const handleDelete = () => {
    deleteNote.exec(note.id);
  };

  return (
    <div
      className={cn("rounded-[12px] border-[0.8px] border-border bg-card-foreground/5 px-3 py-2 text-sm transition-[padding]", expanded && "py-3")}
      key={note.id}
      ref={wrapperRef}
    >
      <div className="flex justify-between gap-2 items-center">
        <span className="wrap-anywhere">{note.title}</span>
        <div className="gap-2 flex h-fit">
          {/* INFO PAGE WIP */}
          <Button variant={"outline"} size={"icon"}>
            <Info size={16} />
          </Button>
          <Button variant={"outline"} size={"icon"} onClick={handleDelete}>
            <Trash size={16} />
          </Button>
          <Button variant={"outline"} size={"icon"} onClick={() => setExpanded(!expanded)}>
            <ArrowDown size={16} className={cn("transition-transform", expanded && "rotate-180")} />
          </Button>
        </div>
      </div>
      <AnimatePresence>
        {expanded && (
          <>
            <div className="h-px w-full bg-border my-1" role="separator" />
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: "auto" }}
              exit={{ height: 0 }}
              transition={{ duration: 0.15 }}
              className="p-3 rounded-lg overflow-hidden bg-background/65 border-2 border-border text-foreground/95"
            >
              {note.details}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
