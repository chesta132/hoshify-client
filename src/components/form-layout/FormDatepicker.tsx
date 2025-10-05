import type { FormFields } from "@/types/form";
import { SingleDatePicker, type SingleDatePickerProps } from "../date/Datepicker";
import { useFormLayout } from "./FormLayout";
import dayjs from "dayjs";

type FormSingleDatePickerProps = { fieldId?: keyof FormFields } & SingleDatePickerProps;

export const FormSingleDatePicker = ({ fieldId, ...rest }: FormSingleDatePickerProps) => {
  const {
    form: {
      form: [val],
      error: [err],
      validate: { validateField },
    },
  } = useFormLayout();

  const date = fieldId && dayjs.isDayjs(fieldId) && ((val as any)[fieldId] as dayjs.Dayjs).toDate();

  return (
    <SingleDatePicker
      date={date || undefined}
      error={fieldId && err[fieldId]}
      onDateChange={fieldId && ((d) => validateField({ [fieldId]: dayjs(d) }))}
      {...rest}
    />
  );
};
