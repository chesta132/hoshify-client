import { cn } from "@/lib/utils";
import { Select, SelectTrigger, SelectValue, SelectSeparator, SelectContent, SelectItem } from "../ui/Select";
import { useFormLayout } from "./FormLayout";
import type { FormFields } from "@/types/form";
import * as SelectPrimitive from "@radix-ui/react-select";
import { capital } from "@/utils/manipulate/string";

type FormSelectProps = {
  fieldId?: keyof FormFields;
  placeholder?: string;
  values: ({ label: string } & React.ComponentProps<typeof SelectPrimitive.Item>)[] | string[];
} & Omit<React.ComponentProps<"div"> & React.ComponentProps<typeof SelectPrimitive.Root>, "children">;

export const FormSelect = ({ className, fieldId, placeholder, values, ...props }: FormSelectProps) => {
  const {
    form: {
      form: [val],
      error: [err],
      validate: { validateField },
    },
  } = useFormLayout();

  return (
    <div className={cn("relative", className)} {...props}>
      <Select value={fieldId && String(val[fieldId])} onValueChange={fieldId && ((val) => validateField({ [fieldId]: val }))} {...props}>
        <SelectTrigger className="cursor-pointer w-full">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectSeparator />
        <SelectContent>
          {values.map((val) => {
            const { label, value, className, ...rest } = typeof val === "string" ? { label: capital(val.toLowerCase()), value: val } : val;
            return (
              <SelectItem value={value} key={value} className={cn("cursor-pointer", className)} {...rest}>
                {label}
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
      {fieldId && err[fieldId] && <p className="absolute text-red-500 text-[12px] text-start">{err[fieldId]}</p>}
    </div>
  );
};
