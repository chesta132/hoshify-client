import { cn } from "@/lib/utils";
import { Button, type ButtonProps } from "../form/Button";

export const FormButton = ({ className, ...props }: ButtonProps) => {
  return (
    <Button
      className={cn(
        "w-full inline-flex items-center justify-center h-10 px-3 rounded-lg bg-primary text-primary-foreground text-sm font-medium shadow disabled:opacity-70",
        className
      )}
      type="button"
      {...props}
    />
  );
};

export const FormSubmit = ({ className, ...props }: ButtonProps) => {
  return <Button variant={"outline"} type="submit" {...props} />;
};

export const FormCancel = ({ className, ...props }: ButtonProps) => {
  return <Button variant={"delete"} type="button" {...props} />;
};
