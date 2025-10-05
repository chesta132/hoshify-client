import { useError } from "@/contexts";
import type { FormGroup } from "@/hooks/useForm";
import { cn } from "@/lib/utils";
import { handleFormError } from "@/services/models/handleError";
import type { FormFields } from "@/types/form";
import { createContext, useContext } from "react";
import { FormInput } from "./FormInput";
import { FormButton, FormSubmit, FormCancel } from "./FormButtons";
import { FormCheckbox } from "./FormCheckbox";
import { FormSelect } from "./FormSelect";
import { FormTextArea } from "./FormTextArea";
import { FormSeparator } from "./FormSeparator";
import { FormDirection } from "./FormDirection";
import { SecAuthMethod } from "../form-layout-template/SecAuthMethod";
import { FormSingleDatePicker } from "./FormDatepicker";

type FormValues<F extends FormFields = FormFields> = { form: FormGroup<F> };

const FormContext = createContext<FormValues>({
  form: {
    resetForm() {},
    error: [{} as any, () => {}],
    form: [{}, () => {}],
    validate: { validateForm: () => false, compareOld: () => false, validateField: () => false },
  },
});

type FormLayoutProps<F extends FormFields, C extends boolean> = {
  asChild?: C;
  onFormSubmit?: C extends true ? never : (event: React.FormEvent<HTMLFormElement>, formValue: F) => any;
} & (C extends true ? React.ComponentProps<"div"> : React.ComponentProps<"form">) &
  FormValues<F>;

export const FormLayout = <F extends FormFields, C extends boolean = false>({
  form,
  asChild,
  onFormSubmit,
  className,
  children,
  ...rest
}: FormLayoutProps<F, C>) => {
  const {
    form: [formVal],
    error: [_, setFormError],
    validate: { validateForm },
  } = form;

  const { setError } = useError();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!validateForm()) return;
    try {
      await onFormSubmit?.(e, formVal);
    } catch (err) {
      handleFormError(err, setFormError, setError);
    }
  };

  const Wrapper: React.ElementType = asChild ? "div" : "form";

  return (
    <FormContext value={{ form } as any}>
      <Wrapper className={cn("flex flex-col gap-2", className)} onSubmit={handleSubmit} {...(rest as any)}>
        {children}
      </Wrapper>
    </FormContext>
  );
};

FormLayout.templates = { SecAuthMethod };
FormLayout.input = FormInput;
FormLayout.button = FormButton;
FormLayout.checkbox = FormCheckbox;
FormLayout.select = FormSelect;
FormLayout.textarea = FormTextArea;
FormLayout.separator = FormSeparator;
FormLayout.submit = FormSubmit;
FormLayout.cancel = FormCancel;
FormLayout.direction = FormDirection;
FormLayout.singleDatePicker = FormSingleDatePicker;

// eslint-disable-next-line react-refresh/only-export-components
export const useFormLayout = () => {
  const context = useContext(FormContext);
  if (context === undefined) throw new Error(`useFormLayout must be used within a FormLayout`);
  return context;
};
