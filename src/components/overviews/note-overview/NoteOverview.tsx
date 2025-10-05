import { Button } from "@/components/form/Button";
import { useNote } from "@/contexts";
import useForm from "@/hooks/useForm";
import type { NoteBody } from "@/types/server/endpoints";
import { CheckSquare, Plus } from "lucide-react";
import { useState } from "react";
import { NotePopup } from "./NotePopup";
import { AnimatePresence } from "motion/react";
import { NoteOption } from "./NoteOption";

export const NoteOverview = () => {
  const { notes } = useNote();
  const [expandIndex, setExpandIndex] = useState<null | number>(null);
  const formGroup = useForm<NoteBody>({ title: "", details: "" }, { details: { max: 300 }, title: { max: 100 } });

  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-card rounded-2xl border-[0.8px] border-border flex flex-col">
      <div className="border-b-[0.8px] border-b-border p-4 flex justify-between">
        <span className="flex gap-1 text-sm items-center">
          <CheckSquare size={16} /> Note Overview
        </span>
        <div className="flex justify-end">
          <Button variant={"outline"} onClick={() => setIsOpen(true)}>
            <Plus />
            Add a note
          </Button>
        </div>
      </div>
      <div className="border-b-[0.8px] border-b-border p-4 flex flex-col gap-3.5">
        {notes.slice(0, 5).map((note, idx) => (
          <NoteOption
            note={note}
            key={note.id}
            expanded={expandIndex === idx}
            setExpanded={(val) => (val ? setExpandIndex(idx) : setExpandIndex(null))}
          />
        ))}
      </div>
      <AnimatePresence>{isOpen && <NotePopup formGroup={formGroup} setIsOpen={setIsOpen} />}</AnimatePresence>
    </div>
  );
};
