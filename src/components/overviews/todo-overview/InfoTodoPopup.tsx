import { Button } from "@/components/form/Button";
import { DeletePopup } from "@/components/popup/DeletePopup";
import { Popup } from "@/components/popup/Popup";
import { ReadMore } from "@/components/toggle/ReadMore";
import { useTodo } from "@/contexts";
import { cn } from "@/lib/utils";
import type { Todo } from "@/types/models";
import { capital, kebab } from "@/utils/manipulate/string";
import { Clock, Info, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";
import { useNavigate } from "react-router";

type InfoTodoPopupProps = {
  todo: Todo;
  setClose?: React.Dispatch<React.SetStateAction<string | null>>;
};

export const InfoTodoPopup = ({ todo, setClose }: InfoTodoPopupProps) => {
  const { getBgByStatus, deleteTodo, getTextColorByStatus } = useTodo();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [deletePopup, setDeletePopup] = useState(false);

  const handleDelete = () => {
    deleteTodo.exec(todo.id);
  };

  const timeline = [
    { title: "Created at", date: todo.createdAt },
    { title: "Last updated", date: todo.updatedAt },
    { title: "Due date", date: todo.dueDate },
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
        <div>
          <div className="flex justify-between gap-3">
            <ReadMore
              as="h1"
              max={{ px: wrapperRef.current?.getBoundingClientRect().width || 384, fontFamily: "Inter", fontSize: 15 }}
              text={todo.title}
              className="font-heading text-base"
            />
            <span className={cn("text-white rounded-full px-3 py-2 inline size-fit text-xs", getBgByStatus(todo.status))}>
              {capital(todo.status.toLowerCase())}
            </span>
          </div>
        </div>
        <div className="text-[14px] space-y-2">
          <div className="space-y-1">
            <span className="flex gap-1 items-center">
              <Clock size={15} /> Timeline
            </span>
            <div className="p-3 rounded-lg bg-background/65 border-1 border-border text-foreground/95">
              {timeline.map(({ date, title }) => (
                <div className="flex justify-between items-center" key={kebab(title.toLowerCase())}>
                  <span>{title}</span>
                  <span className={cn(title === "Due date" && getTextColorByStatus(todo))}>{date.format("MMMM D, YYYY")}</span>
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
              {todo.details}
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
            onClick={() => navigate(`/todos/${todo.id}/edit`)}
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
            <DeletePopup animate titleItem="todo" item={todo.title} onDelete={handleDelete} onCancel={() => setDeletePopup(false)} />
          </Popup>
        )}
      </AnimatePresence>
    </Popup>
  );
};
