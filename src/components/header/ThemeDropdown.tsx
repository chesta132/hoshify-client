import { Laptop2, Moon, Sun } from "lucide-react";
import { Button } from "../form/Button";
import { useTheme } from "@/contexts";
import type { Theme } from "@/contexts/appearance/theme";
import { DropdownRadio } from "../ui/DropdownRadio";

export const ThemeDropdown = () => {
  const { theme, setTheme } = useTheme();
  return (
    <DropdownRadio
      items={[
        { label: "Light", value: "light" },
        { label: "Dark", value: "dark" },
        { label: "System", value: "system" },
      ]}
      title="Theme Color"
      trigger={
        <Button variant={"outline"} name="open-theme-settings-popover" aria-label={"Open theme settings popover"}>
          {theme === "dark" ? <Moon /> : theme === "system" ? <Laptop2 /> : <Sun />}
        </Button>
      }
      onValueChange={(e) => setTheme(e as Theme)}
      radioGroupProps={{ value: theme }}
    />
  );
};
