import type { Config, FormFields } from "@/types/form";
import { VALIDATION_RULES } from "@/class/form-validator/rule";

export class FormValidator<T extends Partial<FormFields>> {
  form: T;
  private config: Config<T>;

  constructor(form: T, config: Config<T>) {
    this.form = form;
    this.config = config;
  }

  validateForm() {
    return this.validateFields(this.form);
  }

  validateFields(fields: Partial<T>) {
    let hasError = false;
    const errors: Partial<Record<keyof T, string>> = {};
    const { config, form } = this;

    for (const [key, value] of Object.typedEntries(fields)) {
      const rules = VALIDATION_RULES[key as keyof FormFields];
      if (!rules || value == null) continue;

      for (const rule of rules) {
        if (rule.condition(value as any, config, form)) {
          const message = typeof rule.message === "function" ? rule.message(config) : rule.message;
          errors[key] = message;
          hasError = true;
          break;
        }
      }
    }
    return { errors, hasError };
  }
}
