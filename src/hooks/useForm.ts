import { FormValidator } from "@/services/form-validator/FormValidator";
import type { Config, FormFields } from "@/types/form";
import { record } from "@/utils/manipulate/object";
import { useState } from "react";

export type FormGroup<T extends FormFields> = {
  readonly form: [T, React.Dispatch<React.SetStateAction<T>>];
  readonly error: [Record<keyof T, string>, React.Dispatch<React.SetStateAction<Record<keyof T, string>>>];
  readonly validate: {
    validateForm: () => boolean;
    validateField: (field: Partial<T>) => boolean;
    compareOld: (old: T, message?: string) => boolean;
  };
  readonly resetForm: () => void;
};

const useForm = <T extends FormFields>(schema: T, config: Config<T>): FormGroup<T> => {
  const [form, setForm] = useState(schema);
  const [formError, setFormError] = useState(record(schema, ""));
  const [isOld, setIsOld] = useState(false);

  const validator = new FormValidator(form, config);

  const validateForm = () => {
    const { errors, hasError } = validator.validateForm();
    if (hasError) {
      setFormError((prev) => ({ ...prev, ...errors }));
    } else {
      setFormError(record(formError, ""));
    }
    return !hasError;
  };

  const validateField = (field: Partial<T>) => {
    const { errors, hasError } = validator.validateFields(field);
    setForm((prev) => ({ ...prev, ...field }));
    const removedOldField = isOld ? record(form, "") : undefined;
    if (isOld) setIsOld(false);

    if (hasError) {
      setFormError((prev) => ({ ...prev, ...removedOldField, ...errors }));
    } else if (Object.typedKeys(field).some((key) => formError[key] !== "")) {
      setFormError((prev) => ({ ...prev, ...removedOldField, ...record(field, "") }));
    }
    return !hasError;
  };

  const compareOld = (old: T, message?: string) => {
    const isSame = Object.compare(old, form);
    if (isSame) {
      setFormError(record(formError, message ?? "Nothing has changed"));
      setIsOld(true);
      return false;
    }
    return true;
  };

  const resetForm = () => {
    setForm(schema);
    setFormError(record(schema, ""));
  };

  return {
    form: [form, setForm],
    error: [formError, setFormError],
    validate: { validateForm, validateField, compareOld },
    resetForm,
  };
};

export default useForm;
