import { capitalEach } from "@/utils/manipulate/string";
import type { InputProps } from "./Input";
import { cn } from "@/lib/utils";

type FloatingLabelProps = {
  label?: string;
  optional?: boolean;
  isFloat: boolean;
  size?: InputProps["size"];
  placeholder?: string;
} & React.DetailedHTMLProps<React.LabelHTMLAttributes<HTMLLabelElement>, HTMLLabelElement>;

export const FloatingLabel = ({ isFloat, size, label, placeholder, optional, className, ...rest }: FloatingLabelProps) => {
  return (
    <label
      className={cn(
        "absolute transition-all duration-200 ease-in-out select-none pointer-events-none whitespace-nowrap mx-3",
        isFloat
          ? `-left-1 text-xs font-medium px-1 bg-background ${size === "sm" ? "-top-1" : "-top-2.5"}`
          : `${size === "lg" ? "top-4.5" : "top-4"} left-0 text-sm text-foreground/80`,
        className
      )}
      {...rest}
    >
      {isFloat ? capitalEach(label || "") : placeholder} {isFloat && optional && <span className="text-gray">(Optional)</span>}
    </label>
  );
};
