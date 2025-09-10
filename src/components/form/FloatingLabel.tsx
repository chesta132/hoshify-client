import { capitalEach } from "@/utils/manipulate/string";
import clsx from "clsx";
import type { InputProps } from "./Input";

type FloatingLabelProps = {
  label?: string;
  optional?: boolean;
  classLabel?: string;
  isFloat: boolean;
  size?: InputProps["size"];
  padding: React.CSSProperties;
  placeholder?: string;
};

export const FloatingLabel = ({ isFloat, size, classLabel, padding, label, placeholder, optional }: FloatingLabelProps) => {
  return (
    <label
      className={clsx(
        "absolute transition-all duration-200 ease-in-out select-none z-10 pointer-events-none whitespace-nowrap px-2",
        isFloat
          ? `-left-1 text-xs font-medium px-1 bg-background ${size === "sm" ? "-top-1" : "-top-2.5"}`
          : `${size === "lg" ? "top-4.5" : "top-4"} left-0 text-sm text-foreground/80`,
        classLabel
      )}
      style={{
        marginLeft: padding.paddingLeft,
        marginRight: padding.paddingRight,
      }}
      htmlFor={label}
    >
      {isFloat ? capitalEach(label || "") : placeholder} {isFloat && optional && <span className="text-gray">(Optional)</span>}
    </label>
  );
};
