import { cn } from "@/lib/utils";

type FormSeparatorProps = { label?: string } & React.ComponentProps<"div">;

export const FormSeparator = ({ className, label, ...rest }: FormSeparatorProps) => {
  return (
    <div className="flex items-center gap-3 my-2" role="separator">
      <div className={cn("h-px bg-border", label ? "flex-1" : "w-full", className)} {...rest} />
      {label && <span className="text-xs text-muted-foreground">{label}</span>}
      {label && <div className={cn("h-px bg-border flex-1", className)} {...rest} />}
    </div>
  );
};
