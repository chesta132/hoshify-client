import type dayjs from "dayjs";
import type { TodoStatus } from "./models";
import type { ErrorResponse } from "./server";
import type { UnionToInter } from ".";

type FieldPlaces = "server" | "local";

export type StringFields = {
  server: {
    password: string;
    newPassword: string;
    email: string;
    newEmail: string;
    newFullName: string;
    token: string;
    type: string;
    refreshMoney: string;
    title: string;
    details: string;
    fullName: string;
    link: string;
    status: TodoStatus;
  };
  local: {
    verifyPassword: string;
  };
};

export type DateFields = {
  server: {
    dueDate: dayjs.Dayjs;
  };
  local: never;
};

export type BooleanFields = {
  server: {
    rememberMe: boolean;
  };
  local: never;
};

export type ServerFields = StringFields["server"] & BooleanFields["server"] & DateFields["server"];
export type AllStringFields = UnionToInter<StringFields[FieldPlaces]>;
export type AllBooelanFields = UnionToInter<BooleanFields[FieldPlaces]>;
export type AllDateFields = UnionToInter<DateFields[FieldPlaces]>;

export type FormFields = Partial<AllStringFields & AllBooelanFields & AllDateFields>;

export type BooleanUnion<T> = {
  [K in keyof T]: T[K] | boolean;
};

export type FormError = ErrorResponse;

export type MinMax = { max?: number; min?: number };

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
  condition: (value: T, config: Config, allValue: FormFields) => boolean;
  message: string | ((config: Config) => string);
};

export type FieldValidations<T> = {
  [K in keyof T]?: ValidationRule<T[K]>[];
};

// export type StringFields = {
//   server:
//     | "password"
//     | "newPassword"
//     | "email"
//     | "newEmail"
//     | "newFullName"
//     | "token"
//     | "type"
//     | "refreshMoney"
//     | "title"
//     | "details"
//     | "fullName"
//     | "link";
//   local: "verifyPassword";
//   literal: {
//     status: TodoStatus;
//   };
// };

// export type BooleanFields = {
//   server: "rememberMe";
//   local: never;
// };

// export type DateFields = {
//   server: "dueDate";
// };

// export type FormFields = Partial<
//   Record<StringFields[FieldPlaces], string> &
//     Record<BooleanFields[FieldPlaces], boolean> &
//     StringFields["literal"] &
//     Record<DateFields["server"], dayjs.Dayjs>
// >;
