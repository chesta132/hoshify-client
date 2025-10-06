import { Button } from "@/components/form/Button";
import { DeletePopup } from "@/components/popup/DeletePopup";
import { Popup } from "@/components/popup/Popup";
import { ReadMore } from "@/components/toggle/ReadMore";
import { useNote } from "@/contexts";
import type { Note } from "@/types/models";
import { kebab } from "@/utils/manipulate/string";
import { Clock, Info, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";
import { useNavigate } from "react-router";

type InfoNotePopupProps = {
  note: Note;
  setClose?: React.Dispatch<React.SetStateAction<string | null>>;
};

export const InfoNotePopup = ({ note, setClose }: InfoNotePopupProps) => {
  const { deleteNote } = useNote();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [deletePopup, setDeletePopup] = useState(false);

  const handleDelete = () => {
    deleteNote.exec(note.id);
  };

  const timeline = [
    { title: "Created at", date: note.createdAt },
    { title: "Last updated", date: note.updatedAt },
  ] as const;

  return (
    <Popup blur>
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 100 }}
        exit={{ y: -50, opacity: 0 }}
        transition={{ type: "keyframes", duration: 0.1 }}
        className="min-w-96 lg:min-w-xl max-w-[430px] md:max-w-xl bg-popover rounded-2xl border p-7 space-y-4 relative"
        ref={wrapperRef}
      >
        <Button variant={"ghost"} className="absolute top-4 right-4" aria-label="Close" onClick={() => setClose?.(null)}>
          <X />
        </Button>
        <h1 className="font-heading text-lg">To-do Information</h1>
        <div className="h-px w-full my-2 bg-border" role="separator" />
        <ReadMore
          as="h1"
          max={{ px: wrapperRef.current?.getBoundingClientRect().width || 384, fontFamily: "Inter", fontSize: 15 }}
          text={note.title}
          className="font-heading text-base"
        />
        <div className="text-[14px] space-y-2">
          <div className="space-y-1">
            <span className="flex gap-1 items-center">
              <Clock size={15} /> Timeline
            </span>
            <div className="p-3 rounded-lg bg-background/65 border-1 border-border text-foreground/95">
              {timeline.map(({ date, title }) => (
                <div className="flex justify-between items-center" key={kebab(title.toLowerCase())}>
                  <span>{title}</span>
                  <span>{date.format("MMMM D, YYYY")}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-1">
            <span className="flex gap-1 items-center">
              <Info size={15} />
              Details
            </span>
            <p className="p-3 rounded-lg bg-background/65 border-2 border-border text-foreground/95 text-sm max-h-40 overflow-auto scroll-bar">
              {note.details}
            </p>
          </div>
        </div>
        <div className="h-px w-full my-2 bg-border" role="separator" />
        <div className="flex justify-end gap-2">
          <Button variant={"outline"} onClick={() => setClose?.(null)}>
            Close
          </Button>
          {/* WIP - EDIT TODO PAGE */}
          <Button
            variant={"outline"}
            className="hover:bg-accent dark:hover:bg-accent hover:text-foreground dark:hover:text-foreground"
            onClick={() => navigate(`/notes/${note.id}/edit`)}
          >
            Edit
          </Button>
          <Button variant={"delete"} onClick={() => setDeletePopup(true)}>
            Delete
          </Button>
        </div>
      </motion.div>
      <AnimatePresence>
        {deletePopup && (
          <Popup blur>
            <DeletePopup animate titleItem="note" item={note.title} onDelete={handleDelete} onCancel={() => setDeletePopup(false)} />
          </Popup>
        )}
      </AnimatePresence>
    </Popup>
  );
};
