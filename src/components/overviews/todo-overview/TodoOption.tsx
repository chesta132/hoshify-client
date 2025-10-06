import { Button } from "@/components/form/Button";
import { Checkbox } from "@/components/form/Checkbox";
import { DeletePopup } from "@/components/popup/DeletePopup";
import { Popup } from "@/components/popup/Popup";
import { useTodo } from "@/contexts";
import type { Todo } from "@/types/models";
import { Info, Trash } from "lucide-react";
import { AnimatePresence } from "motion/react";
import { useState } from "react";

type TodoOptionProps = {
  todo: Todo;
  setIsInfo?: React.Dispatch<React.SetStateAction<string | null>>;
};

export const TodoOption = ({ todo, setIsInfo }: TodoOptionProps) => {
  const { setComplete, deleteTodo, getTextColorByStatus } = useTodo();
  const [deletePopup, setDeletePopup] = useState(false);

  const handleDelete = () => {
    deleteTodo.exec(todo.id);
  };

  return (
    <div className="rounded-[12px] border-[0.8px] border-border bg-card-foreground/5 flex justify-between px-3 py-2 text-sm" key={todo.id}>
      <div className="gap-3 flex items-center">
        <Checkbox
          classBox="bg-card dark:bg-card"
          id={todo.id}
          checked={todo.status === "COMPLETED"}
          onCheckedChange={(val) => setComplete(todo.id, val)}
        />
        <span className={getTextColorByStatus(todo)}>{todo.title}</span>
      </div>
      <div className="gap-2 flex items-center">
        <Button variant={"outline"} size={"icon"} onClick={() => setIsInfo?.(todo.id)}>
          <Info size={16} />
        </Button>
        <Button variant={"outline"} size={"icon"} onClick={() => setDeletePopup(true)}>
          <Trash size={16} />
        </Button>
      </div>
      <AnimatePresence>
        {deletePopup && (
          <Popup blur>
            <DeletePopup animate titleItem="todo" item={todo.title} onDelete={handleDelete} onCancel={() => setDeletePopup(false)} />
          </Popup>
        )}
      </AnimatePresence>
    </div>
  );
};
