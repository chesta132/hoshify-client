import { useFormLayout } from "./FormLayout";
import type { FormFields } from "@/types/form";

import type {
  SelectProps,
  SelectTriggerProps,
  SelectValueProps,
  SelectSeparatorProps,
  SelectContentProps,
  SelectItemProps,
} from "@radix-ui/react-select";
import { DropdownSelect } from "../dropdown/DropdownSelect";

type StringOrNode = string | React.ReactNode;

type FormSelectProps = {
  fieldId?: keyof FormFields;
  placeholder?: StringOrNode;
  values: ({ label: StringOrNode } & SelectItemProps & React.RefAttributes<HTMLDivElement>)[] | string[];
  onValueChange?: (value: string) => void;
  selectProps?: SelectProps & React.RefAttributes<HTMLSelectElement>;
  triggerProps?: SelectTriggerProps & React.RefAttributes<HTMLButtonElement>;
  valueProps?: SelectValueProps & React.RefAttributes<HTMLSpanElement>;
  separatorProps?: SelectSeparatorProps & React.RefAttributes<HTMLDivElement>;
  contentProps?: SelectContentProps & React.RefAttributes<HTMLDivElement>;
  itemProps?: SelectItemProps & React.RefAttributes<HTMLDivElement>;
} & Omit<React.ComponentProps<"div">, "children">;

export const FormSelect = ({ fieldId, selectProps, ...props }: FormSelectProps) => {
  const {
    form: {
      form: [val],
      error: [err],
      validate: { validateField },
    },
  } = useFormLayout();

  const handleValueChange = fieldId && ((val: string) => validateField({ [fieldId]: val }));

  return (
    <DropdownSelect
      selectProps={{ value: fieldId && String(val[fieldId]), onValueChange: handleValueChange, ...selectProps }}
      error={fieldId && err[fieldId]}
      {...props}
    />
  );
};
