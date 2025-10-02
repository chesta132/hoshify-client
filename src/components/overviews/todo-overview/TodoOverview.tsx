import { Button } from "@/components/form/Button";
import { useTodo } from "@/contexts";
import useForm from "@/hooks/useForm";
import { type TodoStatus } from "@/types/models";
import dayjs from "dayjs";
import { CheckSquare, Plus } from "lucide-react";
import { AnimatePresence } from "motion/react";
import { useState } from "react";
import { TodoPopup } from "./TodoPopup";
import { TodoOption } from "./TodoOption";

export type TodoForm = {
  title: string;
  details: string;
  status: TodoStatus;
  dueDate: dayjs.Dayjs;
};

export const TodoOverview = () => {
  const { todos } = useTodo();
  const formGroup = useForm<TodoForm>(
    { title: "", details: "", status: "ACTIVE", dueDate: dayjs() },
    { details: { max: 300 }, title: { max: 100 }, status: true }
  );

  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-card rounded-2xl border-[0.8px] border-border flex flex-col">
      <div className="border-b-[0.8px] border-b-border p-4 flex justify-between">
        <span className="flex gap-1 text-sm items-center">
          <CheckSquare size={16} /> To-Do Overview
        </span>
        <div className="flex justify-end">
          <Button variant={"outline"} onClick={() => setIsOpen(true)}>
            <Plus />
            Add a task
          </Button>
        </div>
      </div>
      <div className="border-b-[0.8px] border-b-border p-4 flex flex-col gap-3.5">
        {todos.slice(0, 5).map((todo) => (
          <TodoOption todo={todo} key={todo.id} />
        ))}
      </div>
      <AnimatePresence>{isOpen && <TodoPopup formGroup={formGroup} setIsOpen={setIsOpen} />}</AnimatePresence>
    </div>
  );
};
