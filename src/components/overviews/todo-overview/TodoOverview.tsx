import { Button } from "@/components/form/Button";
import { useTodo } from "@/contexts";
import useForm from "@/hooks/useForm";
import { type TodoStatus } from "@/types/models";
import dayjs from "dayjs";
import { CheckSquare, Plus } from "lucide-react";
import { AnimatePresence } from "motion/react";
import { useMemo, useState } from "react";
import { CreateTodoPopup } from "./CreateTodoPopup";
import { TodoOption } from "./TodoOption";
import { InfoTodoPopup } from "./InfoTodoPopup";

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
  const [isCreate, setIsCreate] = useState(false);
  const [isInfo, setIsInfo] = useState<null | string>(null);
  const infoTodos = useMemo(() => todos.find((todo) => todo.id === isInfo), [isInfo, todos]);

  return (
    <div className="bg-card rounded-2xl border-[0.8px] border-border flex flex-col">
      <div className="border-b-[0.8px] border-b-border p-4 flex justify-between">
        <span className="flex gap-1 text-sm items-center">
          <CheckSquare size={16} /> To-Do Overview
        </span>
        <div className="flex justify-end">
          <Button variant={"outline"} onClick={() => setIsCreate(true)}>
            <Plus />
            Add a task
          </Button>
        </div>
      </div>
      <div className="border-b-[0.8px] border-b-border p-4 flex flex-col gap-3.5">
        {todos.slice(0, 5).map((todo) => (
          <TodoOption todo={todo} key={todo.id} setIsInfo={setIsInfo} />
        ))}
      </div>
      <AnimatePresence>
        {isCreate && <CreateTodoPopup formGroup={formGroup} setIsOpen={setIsCreate} />}
        {isInfo && infoTodos && <InfoTodoPopup todo={infoTodos} setClose={setIsInfo} />}
      </AnimatePresence>
    </div>
  );
};
