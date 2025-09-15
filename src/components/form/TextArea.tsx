import { useAutosizeTextArea } from "@/hooks/useAutosizeTextArea";
import { useLayoutEffect, useState } from "react";
import type { InputProps } from "./Input";
import clsx from "clsx";
import { FloatingLabel } from "./FloatingLabel";
import { StartEnd } from "./StartEnd";
import { kebab } from "@/utils/manipulate/string";

type OmittedInputProps = Omit<InputProps, keyof Omit<React.ComponentProps<"input">, "classInput" | "onSearch"> | "size" | "suggestion">;
type OmittedTextAreaProps = Omit<React.ComponentProps<"textarea">, "value">;
export type TextAreaProps = { value?: string; classTextArea?: string } & OmittedInputProps & OmittedTextAreaProps;

export const TextArea = ({
  placeholder,
  error,
  label,
  value = "",
  className,
  optional,
  classLabel,
  classError,
  classTextArea,
  focus,
  start,
  end,
  onValueChange,
  focusRing,
  ...textAreaProps
}: TextAreaProps) => {
  const [internalValue, setInternalValue] = useState(value);
  const [isFocus, setIsFocus] = useState(focus === undefined ? internalValue !== "" : focus);
  const [style, setStyle] = useState<React.CSSProperties>({});

  const { textAreaRef } = useAutosizeTextArea(internalValue);

  useLayoutEffect(() => {
    if (value) setInternalValue(value);
    if (internalValue !== "") setIsFocus(true);
  }, [value, internalValue]);

  const handleChange = (value: string) => {
    setInternalValue(value);
    onValueChange?.(value);
  };

  const hypenLabel = kebab(label?.toLowerCase() || placeholder?.toLowerCase() || "unknown");

  return (
    <div className={clsx("relative", error && (classError || "mb-3"), className)}>
      <textarea
        ref={textAreaRef}
        className={clsx(
          "w-full px-3 py-3 border border-accent text-accent-foreground rounded-md transition-all duration-200 ease-in-out focus:outline-none focus:border-accent",
          error && "border-red-500!",
          focusRing && "focus:ring-2 focus:ring-primary/30",
          classTextArea
        )}
        style={style}
        id={hypenLabel}
        value={internalValue}
        onInput={(e) => handleChange((e.target as HTMLTextAreaElement).value)}
        onFocus={() => setIsFocus(true)}
        onBlur={() => (internalValue !== "" ? !isFocus && setIsFocus(true) : isFocus && setIsFocus(false))}
        autoComplete="off"
        {...textAreaProps}
      />
      <FloatingLabel
        isFloat={isFocus || internalValue !== ""}
        className={classLabel}
        htmlFor={hypenLabel}
        size={"sm"}
        style={{ marginLeft: style.paddingLeft, marginRight: style.paddingRight }}
        {...{ label, placeholder, optional }}
      />

      <StartEnd {...{ start, end, setStyle }} />

      {error && <p className="absolute text-red-500 text-[12px] text-start">{error}</p>}
    </div>
  );
};
