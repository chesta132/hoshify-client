import { useAutosizeTextArea } from "@/hooks/useAutosizeTextArea";
import { useLayoutEffect, useState } from "react";
import type { InputProps } from "./Input";
import clsx from "clsx";
import { FloatingLabel } from "./FloatingLabel";
import { StartEnd } from "./StartEnd";

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
  ...textAreaProps
}: TextAreaProps) => {
  const [internalValue, setInternalValue] = useState(value);
  const [isFocus, setIsFocus] = useState(focus === undefined ? internalValue !== "" : focus);
  const [padding, setPadding] = useState<React.CSSProperties>({});

  const { textAreaRef } = useAutosizeTextArea(internalValue);

  useLayoutEffect(() => {
    if (value) setInternalValue(value);
    if (internalValue !== "") setIsFocus(true);
  }, [value, internalValue]);

  const handleChange = (value: string) => {
    setInternalValue(value);
    onValueChange?.(value);
  };

  return (
    <div className={clsx("relative", error && (classError || "mb-3"), className)}>
      <textarea
        ref={textAreaRef}
        className={clsx(
          "w-full px-3 py-3 border border-accent text-accent-foreground rounded-md transition-all duration-200 ease-in-out focus:outline-none focus:border-accent",
          error && "border-red-500!",
          classTextArea
        )}
        style={padding}
        id={label}
        value={internalValue}
        onInput={(e) => handleChange((e.target as HTMLTextAreaElement).value)}
        onFocus={() => setIsFocus(true)}
        onBlur={() => (internalValue !== "" ? !isFocus && setIsFocus(true) : isFocus && setIsFocus(false))}
        autoComplete="off"
        {...textAreaProps}
      />
      <FloatingLabel {...{ isFloat: isFocus || internalValue !== "", size: "sm", classLabel, padding, label, placeholder, optional }} />

      <StartEnd {...{ start, end, setPadding }} />

      {error && <p className="absolute text-red-500 text-[12px] text-start">{error}</p>}
    </div>
  );
};
