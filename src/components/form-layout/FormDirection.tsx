import { cn } from "@/lib/utils";

type Row = "left" | "right";
type Col = "top" | "bottom";
type Position = Col | Row | "center";
type Direction = "row" | "column";
type FormDirectionProps = {
  position?: Position | [Row, Col] | [Col, Row];
  direction?: Direction | [Direction, "reverse" | "normal"];
} & React.ComponentProps<"div">;

export const FormDirection = ({ className, position, direction, ...props }: FormDirectionProps) => {
  return (
    <div
      className={cn(
        "flex gap-2",
        position?.includes("left") && "justify-start",
        position?.includes("right") && "justify-end",
        position?.includes("bottom") && "items-end",
        position?.includes("center" as any) && "justify-center items-center",
        direction?.includes("row") && "flex-row",
        direction?.includes("column") && "flex-col",
        direction?.includes("reverse") && (direction?.includes("row") ? "flex-row-reverse" : direction?.includes("column") && "flex-col-reverse"),
        className
      )}
      {...props}
    />
  );
};
