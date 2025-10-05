import { Button } from "@/components/form/Button";
import { Checkbox } from "@/components/form/Checkbox";
import { useTodo } from "@/contexts";
import { cn } from "@/lib/utils";
import type { Todo } from "@/types/models";
import { timeInMs } from "@/utils/manipulate/number";
import { Info, Trash } from "lucide-react";

export const TodoOption = ({ todo }: { todo: Todo }) => {
  const { setComplete, deleteTodo } = useTodo();

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
        <span
          className={cn(
            todo.status === "ACTIVE" &&
              (todo.dueDate.valueOf() < Date.now() ? "text-red-600" : todo.dueDate.valueOf() > Date.now() - timeInMs({ day: 5 }) && "text-amber-500"),
            todo.status === "COMPLETED" && "line-through text-gray-500",
            todo.status === "PENDING" && "text-gray-700",
            todo.status === "CANCELED" && "text-gray-400"
          )}
        >
          {todo.title}
        </span>
      </div>
      <div className="gap-2 flex items-center">
        {/* INFO PAGE WIP */}
        <Button variant={"outline"} size={"icon"}>
          <Info size={16} />
        </Button>
        <Button variant={"outline"} size={"icon"} onClick={handleDelete}>
          <Trash size={16} />
        </Button>
      </div>
    </div>
  );
};
