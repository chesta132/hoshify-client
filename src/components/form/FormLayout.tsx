import { Input, type InputProps } from "./Input";
import { Link, type LinkProps } from "react-router";
import type { VariantProps } from "class-variance-authority";
import { Button, type buttonVariants } from "./button";
import { TextArea, type TextAreaProps } from "./TextArea";
import React from "react";
import { Checkbox, type CheckboxProps } from "./checkbox";
import type { OneFieldOnly } from "@/types";
import type { FormGroup } from "@/hooks/useForm";
import type { FormFields } from "@/types/form";
import { useError } from "@/contexts";
import { handleFormError } from "@/services/handleError";
import { omit } from "@/utils/manipulate/object";
import { cn } from "@/lib/utils";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Select, SelectContent, SelectItem, SelectSeparator, SelectTrigger, SelectValue } from "../ui/Select";
import { capital } from "@/utils/manipulate/string";

type ButtonElement = React.ReactElement<React.ButtonHTMLAttributes<HTMLButtonElement>>;
type Direction = "row" | "column";

export type ElementTypes = "input" | "checkbox" | "link" | "button" | "textarea" | "separator" | "select" | "custom";
type ElementProps<T extends ElementTypes> = T extends "input"
  ? InputProps
  : T extends "checkbox"
  ? CheckboxProps
  : T extends "link"
  ? LinkProps & React.RefAttributes<HTMLAnchorElement>
  : T extends "button"
  ? React.ComponentProps<"button"> &
      VariantProps<typeof buttonVariants> & {
        asChild?: boolean;
      }
  : T extends "separator"
  ? React.ComponentProps<"div">
  : T extends "select"
  ? React.ComponentProps<"div"> & { options?: React.ComponentProps<typeof SelectPrimitive.Root> }
  : TextAreaProps;

export type FormItemBase<F extends FormFields> = (
  | ({ elementType: "input" } & ElementProps<"input">)
  | ({ elementType: "checkbox" } & ElementProps<"checkbox">)
  | ({ elementType: "link" } & ElementProps<"link">)
  | ({ elementType: "button" } & ElementProps<"button">)
  | ({ elementType: "textarea" } & ElementProps<"textarea">)
  | ({ elementType: "separator"; label?: string } & ElementProps<"separator">)
  | { elementType: "custom"; render: React.ReactNode; fieldId?: undefined }
  | ({
      elementType: "select";
      values: ({ label: string } & React.ComponentProps<typeof SelectPrimitive.Item>)[] | string[];
      placeholder?: string;
    } & ElementProps<"select">)
) & { fieldId?: keyof F; afterSubmitButton?: boolean };

type FormColumn<F extends FormFields, D extends Direction> = {
  layoutDirection: "column" | "row";
  afterSubmitButton?: boolean;
  items: FormItems<F, D>[];
} & React.ComponentProps<"div">;

export type FormItems<F extends FormFields, D extends Direction = "row"> = FormItemBase<F> | FormColumn<F, D>;

export type FormLayoutProps<F extends FormFields, C extends boolean, D extends Direction> = {
  items: FormItems<F, D>[];
  form: FormGroup<F>;
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
  className,
  children,
  ...wrapperProps
}: FormLayoutProps<F, C, D>) => {
  const {
    form: [formVal],
    error: [_, setFormError],
    validate: { validateForm },
  } = form;

  const { setError } = useError();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement> | React.FormEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const valid = validateForm();
    if (!valid) return;

    try {
      await onFormSubmit?.(e, formVal);
    } catch (err) {
      handleFormError(err, setFormError, setError);
    }
  };

  const Wrapper: React.ElementType = asChild ? "div" : "form";

  return (
    <Wrapper className={cn("flex flex-col gap-2", className)} onSubmit={handleSubmit} {...(wrapperProps as any)}>
      <RenderLayout items={items} form={form} afterSubmit={false} />
      {submitButton === undefined ? (
        <Button
          className="w-full inline-flex items-center justify-center h-10 px-3 rounded-lg bg-primary text-primary-foreground text-sm font-medium shadow disabled:opacity-70"
          type="submit"
          {...submitProps}
        />
      ) : (
        submitButton
      )}
      <RenderLayout items={items} form={form} afterSubmit={true} />
      {children}
    </Wrapper>
  );
};

type RenderLayoutProps<F extends FormFields, D extends Direction> = {
  items: FormItems<F, D>[];
  form: FormGroup<F>;
  afterSubmit: boolean;
};

function RenderLayout<F extends FormFields, D extends Direction>({ items, form, afterSubmit }: RenderLayoutProps<F, D>) {
  const {
    form: [formVal],
    error: [formErr],
    validate: { validateField },
  } = form;
  return (
    <>
      {items.map((item, idx) => {
        const baseItem = ((item as FormItemBase<F>)?.elementType && item) as FormItemBase<F> | undefined;
        if (baseItem?.elementType === "custom") {
          if (React.isValidElement(baseItem.render)) {
            if (afterSubmit) return null;
            return <React.Fragment key={`form-element-${idx}`}>{baseItem.render}</React.Fragment>;
          }
        }
        if (typeof item === "object" && item != null && "items" in item) {
          const shouldRender = afterSubmit ? item.afterSubmitButton === true : !item.afterSubmitButton;

          if (!shouldRender) return null;

          return (
            <div key={`form-element-${idx}`} {...omit(item, ["items", "afterSubmitButton", "layoutDirection"])}>
              <FormLayout
                items={item.items}
                submitButton={null}
                form={form}
                className={cn("flex gap-2 w-full justify-between", item.layoutDirection === "column" ? "flex-col" : "flex-row", item.className)}
                asChild
              />
            </div>
          );
        }

        const formItem = item as FormItemBase<F>;
        const { fieldId } = formItem;
        const elementProps = omit(formItem, ["elementType", "afterSubmitButton", "fieldId"]);
        const shouldRender = afterSubmit ? formItem.afterSubmitButton === true : !formItem.afterSubmitButton;

        if (!shouldRender) return null;

        switch (formItem.elementType) {
          case "input":
            if (fieldId) {
              return (
                <Input
                  value={String(formVal[fieldId])}
                  onValueChange={(val) => validateField({ [fieldId]: val } as Partial<F>)}
                  error={formErr[fieldId]}
                  key={`form-input-${idx}`}
                  {...(elementProps as any)}
                />
              );
            }
            return <Input key={`form-input-${idx}`} {...(elementProps as any)} />;

          case "checkbox":
            if (fieldId) {
              return (
                <Checkbox
                  value={formVal[fieldId]}
                  onCheckedChange={(val) => validateField({ [fieldId]: val } as Partial<F>)}
                  error={formErr[fieldId]}
                  key={`form-checkbox-${idx}`}
                  {...(elementProps as any)}
                />
              );
            }
            return <Checkbox key={`form-checkbox-${idx}`} {...(elementProps as any)} />;

          case "link":
            return <Link key={`form-link-${idx}`} {...(elementProps as any)} />;

          case "button":
            if (fieldId) {
              return (
                <Button
                  type="button"
                  value={formVal[fieldId]}
                  onChange={(e) => validateField({ [fieldId]: e.currentTarget.value } as Partial<F>)}
                  error={formErr[fieldId]}
                  key={`form-button${idx}`}
                  {...(elementProps as any)}
                />
              );
            }
            return <Button type="button" key={`form-button${idx}`} {...(elementProps as any)} />;

          case "textarea":
            if (fieldId) {
              return (
                <TextArea
                  value={String(formVal[fieldId])}
                  onValueChange={(val) => validateField({ [fieldId]: val } as Partial<F>)}
                  error={formErr[fieldId]}
                  key={`form-textarea-${idx}`}
                  {...(elementProps as any)}
                />
              );
            }
            return <TextArea key={`form-textarea-${idx}`} {...(elementProps as any)} />;

          case "separator":
            return (
              <div
                key={`form-separator-${idx}`}
                className="flex items-center gap-3 my-2"
                role="separator"
                {...omit(formItem, ["elementType", "label", "afterSubmitButton", "fieldId"])}
              >
                <div className={cn("h-px bg-border", formItem.label ? "flex-1" : "w-full")} />
                {formItem.label && <span className="text-xs text-muted-foreground">{formItem.label}</span>}
                {formItem.label && <div className="h-px bg-border flex-1" />}
              </div>
            );

          case "select":
            if (fieldId) {
              return (
                <div className="relative" key={`form-select-${idx}`} {...omit(elementProps as any, ["options"])}>
                  <Select
                    value={String(formVal[fieldId])}
                    onValueChange={(val) => validateField({ [fieldId]: val } as Partial<F>)}
                    {...formItem.options}
                  >
                    <SelectTrigger className="cursor-pointer w-full">
                      <SelectValue placeholder={formItem.placeholder} />
                    </SelectTrigger>
                    <SelectSeparator />
                    <SelectContent className="z-[99999]">
                      {formItem.values.map((val) => {
                        const { label, value, className, ...rest } =
                          typeof val === "string" ? { label: capital(val.toLowerCase()), value: val } : val;
                        return (
                          <SelectItem value={value} key={value} className={cn("cursor-pointer", className)} {...rest}>
                            {label}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  {formErr[fieldId] && <p className="absolute text-red-500 text-[12px] text-start">{formErr[fieldId]}</p>}
                </div>
              );
            }

            return (
              <div key={`form-select-${idx}`} {...omit(elementProps as any, ["options"])}>
                <Select {...formItem.options}>
                  <SelectTrigger className="cursor-pointer w-full">
                    <SelectValue placeholder={formItem.placeholder} />
                  </SelectTrigger>
                  <SelectSeparator />
                  <SelectContent className="z-[99999]">
                    {formItem.values.map((val) => {
                      const { label, value, className, ...rest } = typeof val === "string" ? { label: capital(val.toLowerCase()), value: val } : val;
                      return (
                        <SelectItem value={value} key={value} className={cn("cursor-pointer", className)} {...rest}>
                          {label}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            );

          default:
            return null;
        }
      })}
    </>
  );
}
