import { cn } from "@/lib/utils";

export const FormSeparator = ({ className, children, ...rest }: React.ComponentProps<"div">) => {
  return (
    <div className="flex items-center gap-3 my-2" role="separator">
      <div className={cn("h-px bg-border", children ? "flex-1" : "w-full", className)} {...rest} />
      {children && <span className="text-xs text-muted-foreground">{children}</span>}
      {children && <div className={cn("h-px bg-border flex-1", className)} {...rest} />}
    </div>
  );
};
