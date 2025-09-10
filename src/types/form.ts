import type { ErrorResponse } from "./server";

export type ServerFields =
  | "password"
  | "newPassword"
  | "email"
  | "newEmail"
  | "newFullName"
  | "token"
  | "type"
  | "refreshMoney"
  | "title"
  | "details"
  | "fullName";

export type StringFields = {
  server: ServerFields;
  local: "verifyPassword";
};

export type FormFields = Partial<Record<StringFields[keyof StringFields], string>>;

export type BooleanUnion<T> = {
  [K in keyof T]: T[K] | boolean;
};

export type FormError = ErrorResponse;

type MinMax = { max?: number; min?: number };

export type CustomRuleS = Partial<
  BooleanUnion<{
    title: MinMax;
    details: MinMax;
    password: MinMax;
    email: { regex?: boolean | RegExp };
  }>
>;

export type ConfigRuleS<T> = Partial<Record<keyof Omit<T, keyof CustomRuleS>, boolean>>;

export type Config<T extends Partial<FormFields> = FormFields> = ConfigRuleS<T> & Pick<CustomRuleS, Extract<keyof T, keyof CustomRuleS>>;

export type ValidationRule<T> = {
  condition: (value: T, config: Config, allValue?: Partial<FormFields>) => boolean;
  message: string | ((config: Config) => string);
};

export type FieldValidations<T> = {
  [K in keyof T]?: ValidationRule<T[K]>[];
};
