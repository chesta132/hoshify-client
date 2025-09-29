import { Checkbox, type CheckboxProps } from "../form/checkbox";
import type { FormFields } from "@/types/form";
import { useFormLayout } from "./FormLayout";

type FormCheckboxProps = { fieldId?: keyof FormFields } & CheckboxProps;

export const FormCheckbox = ({ fieldId, ...props }: FormCheckboxProps) => {
  const {
    form: {
      form: [val],
      validate: { validateField },
    },
  } = useFormLayout();

  return (
    <Checkbox
      checked={fieldId && !!(val[fieldId])}
      onCheckedChange={fieldId && ((val) => validateField({ [fieldId]: val }))}
      {...props}
    />
  );
};
