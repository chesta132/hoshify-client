import type { FormFields } from "@/types/form";
import { TextArea, type TextAreaProps } from "../form/TextArea";
import { useFormLayout } from "./FormLayout";

type FormTextAreaProps = { fieldId?: keyof FormFields } & TextAreaProps;

export const FormTextArea = ({ fieldId, ...props }: FormTextAreaProps) => {
  const {
    form: {
      form: [val],
      error: [err],
      validate: { validateField },
    },
  } = useFormLayout();

  return (
    <TextArea
      value={fieldId && String(val[fieldId])}
      onValueChange={fieldId && ((val) => validateField({ [fieldId]: val }))}
      error={fieldId && err[fieldId]}
      {...props}
    />
  );
};
