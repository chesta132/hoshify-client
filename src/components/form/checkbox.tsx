import { cn } from "@/lib/utils";
import { kebab } from "@/utils/manipulate/string";
import { Check } from "lucide-react";

export type CheckboxProps = {
  label?: string;
  size?: number;
  onCheckedChange?: (checked: boolean) => void;
  classBox?: string;
} & Omit<React.ComponentProps<"input">, "size" | "type">;

export const Checkbox = ({ id, className, label, size, onChange, onCheckedChange, classBox, ...rest }: CheckboxProps) => {
  return (
    <div className={cn("relative inline-flex items-center gap-2", className)}>
      <div className="relative size-4">
        <input
          type="checkbox"
          id={id || kebab(label?.toLowerCase() ?? "unknown")}
          className={cn(
            "appearance-none cursor-pointer peer relative border-input dark:bg-input/30 checked:bg-primary checked:text-primary-foreground dark:checked:bg-primary checked:border-primary focus-visible:border-ring focus-visible:ring-ring/50 size-full shrink-0 rounded-[4px] border shadow-xs transition-shadow outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
            classBox
          )}
          onChange={(e) => {
            onCheckedChange?.(e.target.checked);
            onChange?.(e);
          }}
          {...rest}
        />
        <span
          aria-hidden="true"
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary-foreground opacity-0 peer-checked:opacity-100 transition-all pointer-events-none"
        >
          <Check size={size || 12} />
        </span>
      </div>
      {label && (
        <label
          htmlFor={id || kebab(label?.toLowerCase() ?? "unknown")}
          style={{ fontSize: size ? `${size}px` : undefined }}
          className="cursor-pointer select-none"
        >
          {label}
        </label>
      )}
    </div>
  );
};
