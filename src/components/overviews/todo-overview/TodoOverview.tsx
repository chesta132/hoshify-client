import { Button } from "@/components/form/button";
import { Checkbox } from "@/components/form/checkbox";
import { FormLayout } from "@/components/form-layout/FormLayout";
import { Popup } from "@/components/ui/Popup";
import { useTodo } from "@/contexts";
import useForm from "@/hooks/useForm";
import { cn } from "@/lib/utils";
import { todoStatus } from "@/types/models";
import { timeInMs } from "@/utils/manipulate/number";
import dayjs from "dayjs";
import { CheckSquare, Plus } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

export const TodoOverview = () => {
  const { todos, setComplete, loading, createTodo } = useTodo();
  const formGroup = useForm(
    { title: "", details: "", status: "ACTIVE", dueDate: dayjs() },
    { details: { max: 300 }, title: { max: 100 }, status: true }
  );
  const {
    form: [form],
  } = formGroup;

  return (
    <div className="bg-card rounded-2xl border-[0.8px] border-border flex flex-col">
      <div className="border-b-[0.8px] border-b-border p-4 flex justify-between">
        <span className="flex gap-1 text-sm items-center">
          <CheckSquare size={16} /> To-Do Overview
        </span>
        <div className="flex justify-end">
          <Button variant={"outline"}>
            <Plus />
            Add a task
          </Button>
        </div>
      </div>
      <div className="border-b-[0.8px] border-b-border p-4 flex flex-col gap-3.5">
        {todos.slice(0, 5).map((todo) => (
          <div className="rounded-[12px] border-[0.8px] border-border bg-card-foreground/5 gap-3 flex px-3 py-2 text-sm" key={todo.id}>
            <Checkbox classBox="bg-card dark:bg-card" checked={todo.status === "COMPLETED"} onCheckedChange={(val) => setComplete(todo.id, val)} />
            <span
              className={cn(
                todo.status === "ACTIVE" &&
                  (todo.dueDate.valueOf() < Date.now()
                    ? "text-red-600"
                    : todo.dueDate.valueOf() > Date.now() - timeInMs({ day: 5 }) && "text-amber-500"),
                todo.status === "COMPLETED" && "line-through text-gray-500",
                todo.status === "PENDING" && "text-gray-700",
                todo.status === "CANCELED" && "text-gray-400"
              )}
            >
              {todo.dueDate.format("MMMM DD")} {dayjs(new Date()).format("MMMM DD")} {todo.status}
            </span>
          </div>
        ))}
      </div>
      {/* WIP */}
      <AnimatePresence>
        <Popup blur>
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 100 }}
            exit={{ y: -50, opacity: 0 }}
            transition={{ type: "keyframes", duration: 0.1 }}
            className="min-w-96 lg:min-w-2xl bg-popover rounded-2xl border px-6 py-7 space-y-4"
          >
            <div className="border-b border-muted-foreground pb-1 font-heading font-medium">
              <h1>Add task</h1>
            </div>
            <FormLayout form={formGroup} onFormSubmit={async () => createTodo.exec(form)}>
              <FormLayout.input size="sm" classLabel="bg-popover" label="Title" placeholder="Task title" fieldId="title" />
              <FormLayout.input size="sm" classLabel="bg-popover" label="Details" placeholder="Task details" fieldId="details" />
              <FormLayout.select
                values={todoStatus}
                placeholder="Task status"
                defaultValue={"ACTIVE"}
                fieldId="status"
                contentProps={{ className: "z-[9999]" }}
              />
              {/* DUE DATE WIP */}
              <FormLayout.direction position={"right"}>
                <FormLayout.cancel
                  // onClick={() => handlePopup("closed")}
                  disabled={loading}
                >
                  Cancel
                </FormLayout.cancel>
                <FormLayout.submit disabled={loading}>Add task</FormLayout.submit>
              </FormLayout.direction>
            </FormLayout>
          </motion.div>
        </Popup>
      </AnimatePresence>
    </div>
  );
};
