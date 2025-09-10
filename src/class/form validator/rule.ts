import type { FieldValidations, FormFields } from "@/types/form";

export const VALIDATION_RULES: FieldValidations<FormFields> = {
  title: [
    {
      condition: (value, config) => !!config.title && (!value || value.trim() === ""),
      message: "Title is required",
    },
    {
      condition: (value, config) => typeof config.title !== "boolean" && !!config.title?.max && !!value && value.length > config.title.max,
      message: (config) => `Maximum title character is ${typeof config.title !== "boolean" ? config.title?.max : "unknown"}`,
    },
    {
      condition: (value, config) => typeof config.title !== "boolean" && !!config.title?.min && !!value && value.length < config.title.min,
      message: (config) => `Minimum title character is ${typeof config.title !== "boolean" ? config.title?.min : "unknown"}`,
    },
  ],
  details: [
    {
      condition: (value, config) => !!config.details && (!value || value.trim() === ""),
      message: "Description is required",
    },
    {
      condition: (value, config) => typeof config.details !== "boolean" && !!config.details?.max && !!value && value.length > config.details?.max,
      message: (config) => `Maximum detail character is ${typeof config.details !== "boolean" ? config.details?.max : "unknown"}`,
    },
    {
      condition: (value, config) => typeof config.details !== "boolean" && !!config.details?.min && !!value && value.length < config.details?.min,
      message: (config) => `Minimum detail character is ${typeof config.details !== "boolean" ? config.details?.min : "unknown"}`,
    },
  ],
  email: [
    {
      condition: (value, config) => !!config.email && (!value || value.trim() === ""),
      message: "Email is required",
    },
    {
      condition: (value, config) =>
        typeof config.email !== "boolean" && !!config.email?.regex && !!value && !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(value),
      message: "Please input a valid email",
    },
  ],
  password: [
    {
      condition: (value, config) => !!config.password && (!value || value.trim() === ""),
      message: "Password is required",
    },
    {
      condition: (value, config) => typeof config.password !== "boolean" && !!config.password?.max && !!value && value.length > config.password?.max,
      message: (config) => `Maximum password character is ${typeof config.password !== "boolean" && config.password?.max}`,
    },
    {
      condition: (value, config) => typeof config.password !== "boolean" && !!config.password?.min && !!value && value.length < config.password?.min,
      message: (config) => `Minimum password character is ${typeof config.password !== "boolean" && config.password?.min}`,
    },
  ],
  verifyPassword: [
    {
      condition: (value, config, allValue) => !!config.verifyPassword && !!allValue && value !== allValue.password,
      message: "Password is not match",
    },
  ],
  fullName: [
    {
      condition: (value, config) => !!config.fullName && (!value || value.trim() === ""),
      message: "Full name is required",
    },
  ],
  newFullName: [
    {
      condition: (value, config) => !!config.newFullName && (!value || value.trim() === ""),
      message: "New full name is required",
    },
  ],
};
