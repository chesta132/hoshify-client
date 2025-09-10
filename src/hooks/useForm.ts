import { FormValidator } from "@/class/form validator/FormValidator";
import type { Config, FormFields } from "@/types/form";
import { record } from "@/utils/manipulate/object";
import { useState } from "react";

const useForm = <T extends FormFields>(schema: T, config: Config<T>) => {
  const [form, setForm] = useState(schema);
  const [formError, setFormError] = useState(record(schema, ""));

  const validator = new FormValidator(form, config);

  const validateForm = () => {
    const { errors, hasError } = validator.validateForm();
    if (hasError) {
      setFormError((prev) => ({ ...prev, ...errors }));
    }
    return hasError;
  };

  const validateField = (field: Partial<T>) => {
    const { errors, hasError } = validator.validateFields(field);
    if (hasError) {
      setFormError((prev) => ({ ...prev, ...errors }));
    } else {
      setForm((prev) => ({ ...prev, ...field }));
    }
    return hasError;
  };

  return {
    form: [form, setForm] as const,
    error: [formError, setFormError] as const,
    validate: { validateForm, validateField },
  };
};

export default useForm;
