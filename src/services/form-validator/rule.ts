import type { Config, FieldValidations, FormFields, MinMax } from "@/types/form";
import { isValidEmail } from "./validator";
import { capital, isValidUrl, spacing } from "@/utils/manipulate/string";
import { todoStatus } from "@/types/models";

const createLengthRules = (field: keyof PickByValue<Config, MinMax>, minMsg?: string, maxMsg?: string) => [
  {
    condition: (value: string | undefined, config: Config) =>
      typeof config[field] !== "boolean" && !!config[field]?.min && !!value && value.length < config[field].min,
    message: (config: Config) => minMsg || `Minimum ${field} character is ${(config[field] as any).min}`,
  },
  {
    condition: (value: string | undefined, config: Config) =>
      typeof config[field] !== "boolean" && !!config[field]?.max && !!value && value.length > config[field].max,
    message: (config: Config) => maxMsg || `Maximum ${field} character is ${(config[field] as any).max}`,
  },
];

const createRequiredRule = (field: keyof Config, message?: string) => [
  {
    condition: (value: string | undefined, config: Config) => !!config[field] && (!value || value.trim() === ""),
    message: message || `${capital(spacing(field))} is required`,
  },
];

export const VALIDATION_RULES: FieldValidations<FormFields> = {
  title: [...createRequiredRule("title"), ...createLengthRules("title")],
  details: [...createRequiredRule("details"), ...createLengthRules("details")],
  email: [
    ...createRequiredRule("email"),
    {
      condition: (value, config) => typeof config.email !== "boolean" && !!config.email?.regex && !!value && !isValidEmail(value),
      message: "Please input a valid email",
    },
  ],
  password: [...createRequiredRule("password"), ...createLengthRules("password")],
  verifyPassword: [
    {
      condition: (value, config, allValue) => !!config.verifyPassword && value !== allValue.password,
      message: "Password is not match",
    },
  ],
  fullName: [...createRequiredRule("fullName")],
  newFullName: [...createRequiredRule("newFullName")],
  link: [{ condition: (value, config) => !!(config.link && !isValidUrl(value!)), message: "Invalid URL" }],
  status: [{ condition: (value, config) => !!(config.status && value && !todoStatus.includes(value)), message: "Please select a valid status" }],
};
