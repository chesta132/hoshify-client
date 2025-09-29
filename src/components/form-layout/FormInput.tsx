import type { FormFields } from "@/types/form";
import { Input, type InputProps } from "../form/Input";
import { useFormLayout } from "./FormLayout";

type FormInputProps = { fieldId?: keyof FormFields } & InputProps;
export const FormInput = ({ fieldId, ...props }: FormInputProps) => {
  const {
    form: {
      form: [val],
      error: [err],
      validate: { validateField },
    },
  } = useFormLayout();

  return (
    <Input
      value={fieldId && String(val[fieldId])}
      onValueChange={fieldId && ((val) => validateField({ [fieldId]: val }))}
      error={fieldId && err[fieldId]}
      {...props}
    />
  );
};
