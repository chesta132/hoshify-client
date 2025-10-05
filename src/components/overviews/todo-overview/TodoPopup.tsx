import { FormLayout } from "@/components/form-layout/FormLayout";
import { Popup } from "@/components/popup/Popup";
import type { FormGroup } from "@/hooks/useForm";
import { todoStatus } from "@/types/models";
import { motion } from "motion/react";
import type { TodoForm } from "./TodoOverview";
import { useTodo } from "@/contexts";

type TodoPopupProps = { formGroup: FormGroup<TodoForm>; setIsOpen: React.Dispatch<React.SetStateAction<boolean>> };

export const TodoPopup = ({ formGroup, setIsOpen }: TodoPopupProps) => {
  const { loading, createTodo } = useTodo();
  const {
    resetForm,
    form: [form],
  } = formGroup;

  const handleSubmit = () => {
    createTodo
      .clone()
      .onSuccess(() => {
        resetForm();
        setIsOpen(false);
      })
      .exec(form);
  };

  return (
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
        <FormLayout form={formGroup} onFormSubmit={handleSubmit}>
          <FormLayout.input size="sm" classLabel="bg-popover" label="Title" placeholder="Task title" fieldId="title" />
          <FormLayout.input size="sm" classLabel="bg-popover" label="Details" placeholder="Task details" fieldId="details" />
          <FormLayout.select
            values={todoStatus}
            placeholder="Task status"
            defaultValue={"ACTIVE"}
            fieldId="status"
            contentProps={{ className: "z-[9999]" }}
          />
          <FormLayout.singleDatePicker fieldId="dueDate" placeholder="Task due date" />
          <FormLayout.direction position={"right"}>
            <FormLayout.cancel
              onClick={() => {
                resetForm();
                setIsOpen(false);
              }}
              disabled={loading}
            >
              Cancel
            </FormLayout.cancel>
            <FormLayout.submit disabled={loading}>Add task</FormLayout.submit>
          </FormLayout.direction>
        </FormLayout>
      </motion.div>
    </Popup>
  );
};
