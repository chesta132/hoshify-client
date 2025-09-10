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
} from "../ui/dropdown-menu";
import { DropdownMenu } from "./dropdown-menu";

type StringOrNode = string | React.ReactNode;

type DropdownRadioProps = {
  items: ({ label: StringOrNode } & DropdownMenuRadioItemProps & React.RefAttributes<HTMLDivElement>)[];
  trigger: StringOrNode;
  title: StringOrNode;
  onValueChange?: (value: string) => void;
  menuProps?: DropdownMenuProps;
  triggerProps?: DropdownMenuTriggerProps & React.RefAttributes<HTMLButtonElement>;
  contentProps?: DropdownMenuContentProps & React.RefAttributes<HTMLDivElement>;
  labelProps?: DropdownMenuLabelProps & React.RefAttributes<HTMLDivElement>;
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
  labelProps,
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
      <DropdownMenuContent className="text-center" {...contentProps}>
        <DropdownMenuLabel {...labelProps}>{title}</DropdownMenuLabel>
        <DropdownMenuSeparator {...separatorProps} />
        <DropdownMenuRadioGroup onValueChange={onValueChange} {...radioGroupProps}>
          {items.map(({ label, ...rest }, idx) => (
            <DropdownMenuRadioItem key={typeof label === "string" ? label : `idx-${idx}`} className="cursor-pointer" {...radioItemProps} {...rest}>
              {label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
