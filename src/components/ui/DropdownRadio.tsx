import type {
  DropdownMenuContentProps,
  DropdownMenuLabelProps,
  DropdownMenuProps,
  DropdownMenuRadioGroupProps,
  DropdownMenuRadioItemProps,
  DropdownMenuSeparatorProps,
  DropdownMenuTriggerProps,
} from "@radix-ui/react-dropdown-menu";
import {
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./DropdownMenu";
import { DropdownMenu } from "./DropdownMenu";
import { cn } from "@/lib/utils";

type StringOrNode = string | React.ReactNode;

type DropdownRadioProps = {
  items: ({ label: StringOrNode } & DropdownMenuRadioItemProps & React.RefAttributes<HTMLDivElement>)[];
  trigger: StringOrNode;
  title: StringOrNode;
  onValueChange?: (value: string) => void;
  menuProps?: DropdownMenuProps;
  triggerProps?: DropdownMenuTriggerProps & React.RefAttributes<HTMLButtonElement>;
  contentProps?: DropdownMenuContentProps & React.RefAttributes<HTMLDivElement>;
  titleProps?: DropdownMenuLabelProps & React.RefAttributes<HTMLDivElement>;
  separatorProps?: DropdownMenuSeparatorProps & React.RefAttributes<HTMLDivElement>;
  radioGroupProps?: DropdownMenuRadioGroupProps & React.RefAttributes<HTMLDivElement>;
  radioItemProps?: DropdownMenuRadioItemProps & React.RefAttributes<HTMLDivElement>;
};

export const DropdownRadio = ({
  items,
  title,
  trigger,
  onValueChange,
  contentProps,
  titleProps,
  menuProps,
  radioGroupProps,
  radioItemProps,
  separatorProps,
  triggerProps,
}: DropdownRadioProps) => {
  return (
    <DropdownMenu modal={false} {...menuProps}>
      <DropdownMenuTrigger asChild {...triggerProps}>
        {trigger}
      </DropdownMenuTrigger>
      <DropdownMenuContent {...contentProps} className={cn("text-center", contentProps?.className)}>
        <DropdownMenuLabel {...titleProps}>{title}</DropdownMenuLabel>
        <DropdownMenuSeparator {...separatorProps} />
        <DropdownMenuRadioGroup onValueChange={onValueChange} {...radioGroupProps}>
          {items.map(({ label, ...rest }, idx) => (
            <DropdownMenuRadioItem
              key={typeof label === "string" ? label : `idx-${idx}`}
              {...radioItemProps}
              className={cn(
                "cursor-pointer hover:bg-popover-foreground/10 focus:bg-popover-foreground/10 focus:text-foreground",
                radioItemProps?.className
              )}
              {...rest}
            >
              {label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
