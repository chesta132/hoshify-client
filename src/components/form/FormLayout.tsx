import type { CheckboxProps } from "@radix-ui/react-checkbox";
import { Input, type InputProps } from "./Input";
import { Link, type LinkProps } from "react-router";
import type { VariantProps } from "class-variance-authority";
import { Button, type buttonVariants } from "../ui/button";
import { TextArea, type TextAreaProps } from "./TextArea";
import React from "react";
import { Checkbox } from "../ui/checkbox";
import type { OneFieldOnly } from "@/types";
import useForm from "@/hooks/useForm";
import type { Config, FormFields } from "@/types/form";
import { useError } from "@/contexts";
import { handleFormError } from "@/utils/server/handleError";
import clsx from "clsx";
import { omit } from "@/utils/manipulate/object";

type ButtonElement = React.ReactElement<React.ButtonHTMLAttributes<HTMLButtonElement>>;
type Direction = "row" | "column";

export type ElementTypes = "input" | "checkbox" | "link" | "button" | "textarea" | "separator";
type ElementProps<T extends ElementTypes> = T extends "input"
  ? InputProps
  : T extends "checkbox"
  ? CheckboxProps & React.RefAttributes<HTMLButtonElement>
  : T extends "link"
  ? LinkProps & React.RefAttributes<HTMLAnchorElement>
  : T extends "button"
  ? React.ComponentProps<"button"> &
      VariantProps<typeof buttonVariants> & {
        asChild?: boolean;
      }
  : T extends "separator"
  ? React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>
  : TextAreaProps;

export type FormItemBase<F extends FormFields> = (
  | ({ elementType: "input" } & ElementProps<"input">)
  | ({ elementType: "checkbox" } & ElementProps<"checkbox">)
  | ({ elementType: "link" } & ElementProps<"link">)
  | ({ elementType: "button" } & ElementProps<"button">)
  | ({ elementType: "textarea" } & ElementProps<"textarea">)
  | ({ elementType: "separator"; label?: string } & ElementProps<"separator">)
) & { fieldId?: keyof F; afterSubmitButton?: boolean };

type FormColumn<F extends FormFields, D extends Direction> = {
  layoutDirection: "column" | "row";
  afterSubmitButton?: boolean;
  items: (FormItems<F, D> | React.ReactNode)[];
} & React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
export type FormItems<F extends FormFields, D extends Direction = "row"> = FormItemBase<F> | FormColumn<F, D>;
export type FormLayoutProps<F extends FormFields, C extends boolean, D extends Direction> = {
  items: (FormItems<F, D> | React.ReactNode)[];
  form?: Parameters<typeof useForm<F>>;
  asChild?: C;
  onFormSubmit?: (event: React.FormEvent<HTMLDivElement> | React.FormEvent<HTMLFormElement>, formValue: F) => any;
} & (C extends true
  ? React.DetailedHTMLProps<React.FormHTMLAttributes<HTMLFormElement>, HTMLFormElement>
  : React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>) &
  OneFieldOnly<{
    submitButton: ButtonElement | null;
    submitProps: ElementProps<"button">;
  }>;

export const FormLayout = <F extends FormFields, C extends boolean, D extends Direction>({
  items,
  submitButton,
  submitProps,
  form,
  asChild,
  onFormSubmit,
  ...wrapperProps
}: FormLayoutProps<F, C, D>) => {
  const schema = form ? form[0] : ({} as FormFields);
  const config = form ? form[1] : {};
  const {
    form: [formVal],
    error: [formErr, setFormError],
    validate: { validateField, validateForm },
  } = useForm(schema, config);
  const { setError } = useError();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement> | React.FormEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!form) {
      await onFormSubmit?.(e, formVal as F);
      return;
    }
    const valid = validateForm();
    if (!valid) return;
    try {
      await onFormSubmit?.(e, formVal as F);
    } catch (err) {
      handleFormError(err, setFormError, setError);
    }
  };

  const Wrapper: React.ElementType = asChild ? "div" : "form";

  return (
    <Wrapper className="flex flex-col gap-2" onSubmit={handleSubmit} {...(wrapperProps as any)}>
      <RenderLayout {...{ formErr, formVal, items, validateField, form, afterSubmit: false }} />
      {submitButton === undefined ? (
        <Button
          className="w-full inline-flex items-center justify-center h-10 px-3 rounded-lg bg-primary text-primary-foreground text-sm font-medium shadow disabled:opacity-70"
          type="submit"
          {...submitProps}
        />
      ) : (
        submitButton
      )}
      <RenderLayout {...{ formErr, formVal, items, validateField, form, afterSubmit: true }} />
    </Wrapper>
  );
};

type RenderLayoutProps<F extends FormFields, D extends Direction> = {
  items: (React.ReactNode | FormItems<F, D>)[];
  form?: [schema: F, config: Config<F>];
  formVal: FormFields;
  formErr: FormFields;
  validateField: (field: FormFields) => boolean;
  afterSubmit: boolean;
};

function RenderLayout<F extends FormFields, D extends Direction>({
  items,
  form,
  formVal,
  formErr,
  validateField,
  afterSubmit,
}: RenderLayoutProps<F, D>) {
  return (
    <>
      {items.map((item, idx) => {
        if (React.isValidElement(item)) {
          if (afterSubmit) return null;
          return <React.Fragment key={`form-element-${idx}`}>{item}</React.Fragment>;
        }

        if (typeof item === "object" && item != null && "items" in item) {
          const shouldRender = afterSubmit ? item.afterSubmitButton === true : !item.afterSubmitButton;

          if (!shouldRender) return null;

          return (
            <div key={`form-element-${idx}`} {...omit(item, ["items", "afterSubmitButton"])}>
              <FormLayout
                items={item.items}
                submitButton={null}
                form={form}
                className={clsx("flex gap-2 w-full justify-between", item.layoutDirection === "column" ? "flex-col" : "flex-row", item.className)}
                asChild
              />
            </div>
          );
        }

        const formItem = item as FormItemBase<F>;
        const { fieldId } = formItem;
        const shouldRender = afterSubmit ? formItem.afterSubmitButton === true : !formItem.afterSubmitButton;

        if (!shouldRender) return null;

        switch (formItem.elementType) {
          case "input":
            if (fieldId) {
              return (
                <Input
                  value={formVal[fieldId]}
                  onValueChange={(val) => validateField({ [fieldId]: val })}
                  error={formErr[fieldId as keyof typeof formErr]}
                  key={`form-input-${idx}`}
                  {...formItem}
                />
              );
            }
            return <Input key={`form-input-${idx}`} {...formItem} />;

          case "checkbox":
            if (fieldId) {
              return (
                <Checkbox
                  value={formVal[fieldId]}
                  onCheckedChange={(val) => validateField({ [fieldId]: val })}
                  error={formErr[fieldId as keyof typeof formErr]}
                  key={`form-checkbox-${idx}`}
                  {...(formItem as any)}
                />
              );
            }
            return <Checkbox key={`form-checkbox-${idx}`} {...formItem} />;

          case "link":
            return <Link key={`form-link-${idx}`} {...formItem} />;

          case "button":
            if (fieldId) {
              return (
                <Button
                  type="button"
                  value={formVal[fieldId]}
                  onChange={(e) => validateField({ [fieldId]: e.currentTarget.value })}
                  error={formErr[fieldId as keyof typeof formErr]}
                  key={`form-button${idx}`}
                  {...(formItem as any)}
                />
              );
            }
            return <Button type="button" key={`form-button${idx}`} {...formItem} />;

          case "textarea":
            if (fieldId) {
              return (
                <TextArea
                  value={formVal[fieldId]}
                  onValueChange={(val) => validateField({ [fieldId]: val })}
                  error={formErr[fieldId as keyof typeof formErr]}
                  key={`form-textarea-${idx}`}
                  {...formItem}
                />
              );
            }
            return <TextArea key={`form-textarea-${idx}`} {...formItem} />;

          case "separator":
            return (
              <div
                key={`form-separator-${idx}`}
                className="flex items-center gap-3 my-2"
                role="separator"
                {...omit(formItem, ["elementType", "label", "afterSubmitButton", "fieldId"])}
              >
                <div className={clsx("h-px bg-border", formItem.label ? "flex-1" : "w-full")} />
                {formItem.label && <span className="text-xs text-muted-foreground">{formItem.label}</span>}
                {formItem.label && <div className="h-px bg-border flex-1" />}
              </div>
            );

          default:
            return null;
        }
      })}
    </>
  );
}
