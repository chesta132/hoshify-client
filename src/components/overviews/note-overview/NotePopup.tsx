import { FormLayout } from "@/components/form-layout/FormLayout";
import { Popup } from "@/components/popup/Popup";
import type { FormGroup } from "@/hooks/useForm";
import { motion } from "motion/react";
import { useNote } from "@/contexts";
import type { NoteBody } from "@/types/server/endpoints";

type NotePopupProps = { formGroup: FormGroup<NoteBody>; setIsOpen: React.Dispatch<React.SetStateAction<boolean>> };

export const NotePopup = ({ formGroup, setIsOpen }: NotePopupProps) => {
  const { loading, createNote } = useNote();
  const {
    resetForm,
    form: [form],
  } = formGroup;

  const handleSubmit = () => {
    createNote
      .clone()
      .transform((res) => {
        resetForm();
        setIsOpen(false);
        return res;
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
          <h1>Add note</h1>
        </div>
        <FormLayout form={formGroup} onFormSubmit={handleSubmit}>
          <FormLayout.input size="sm" classLabel="bg-popover" label="Title" placeholder="Note title" fieldId="title" />
          <FormLayout.textarea classLabel="bg-popover" label="Details" placeholder="Note details" fieldId="details" />
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
            <FormLayout.submit disabled={loading}>Add note</FormLayout.submit>
          </FormLayout.direction>
        </FormLayout>
      </motion.div>
    </Popup>
  );
};
