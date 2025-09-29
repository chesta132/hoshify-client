import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button, type ButtonProps } from "@/components/form/Button";
import { Calendar, type CalendarProps } from "@/components/ui/Calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@radix-ui/react-popover";
import { useState } from "react";
import type { PopoverProps, PopoverTriggerProps, PopoverContentProps } from "@radix-ui/react-popover";

type StringOrNode = string | React.ReactNode;

type SingleDatePickerProps = {
  placeholder?: StringOrNode;
  date?: Date | undefined;
  onDateChange?: (date: Date | undefined) => void;
  popoverProps?: PopoverProps & React.RefAttributes<HTMLDivElement>;
  triggerProps?: PopoverTriggerProps & React.RefAttributes<HTMLButtonElement>;
  contentProps?: PopoverContentProps & React.RefAttributes<HTMLDivElement>;
  buttonProps?: ButtonProps & React.RefAttributes<HTMLButtonElement>;
  calendarProps?: CalendarProps & React.RefAttributes<HTMLDivElement> & { mode?: "single" };
  icon?: React.ReactNode;
  dateFormat?: string;
} & Omit<React.ComponentProps<"div">, "children">;

export function SingleDatePicker({
  className,
  placeholder = "Select date",
  date: externalDate,
  onDateChange,
  popoverProps,
  triggerProps,
  contentProps,
  buttonProps,
  calendarProps,
  icon = <CalendarIcon />,
  dateFormat = "PPP",
  ...props
}: SingleDatePickerProps) {
  const [open, setOpen] = useState(false);
  const [internalDate, setInternalDate] = useState<Date | undefined>(undefined);

  const selectedDate = externalDate !== undefined ? externalDate : internalDate;

  const handleDateChange = (date: Date | undefined) => {
    if (externalDate === undefined) {
      setInternalDate(date);
    }
    onDateChange?.(date);
    setOpen(false);
  };

  return (
    <div className={cn("flex flex-col gap-3", className)} {...props}>
      <Popover open={open} onOpenChange={setOpen} {...popoverProps}>
        <PopoverTrigger asChild {...triggerProps}>
          <Button variant="outline" id="date" className={cn("w-full justify-between font-normal", buttonProps?.className)} {...buttonProps}>
            {selectedDate ? format(selectedDate, dateFormat) : placeholder}
            {icon}
          </Button>
        </PopoverTrigger>
        <PopoverContent className={cn("w-auto overflow-hidden p-0", contentProps?.className)} align="start" {...contentProps}>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateChange}
            captionLayout="dropdown"
            toYear={2080}
            {...calendarProps}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
