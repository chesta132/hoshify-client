import type { ErrorResponse } from "./server";

type FieldPlaces = "server" | "local";

export type StringFields = {
  server:
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
    | "fullName"
    | "link";
  local: "verifyPassword";
};

export type BooleanFields = {
  server: "rememberMe";
  local: never;
};

export type ServerFields = StringFields["server"] | BooleanFields["server"];

export type FormFields = Partial<Record<StringFields[FieldPlaces], string> & Record<BooleanFields[FieldPlaces], boolean>>;

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

export type Config<T extends FormFields = FormFields> = ConfigRuleS<T> & Pick<CustomRuleS, Extract<keyof T, keyof CustomRuleS>>;

export type ValidationRule<T> = {
  condition: (value: T, config: Config, allValue?: Partial<FormFields>) => boolean;
  message: string | ((config: Config) => string);
};

export type FieldValidations<T> = {
  [K in keyof T]?: ValidationRule<T[K]>[];
};
