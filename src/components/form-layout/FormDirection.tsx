import { cn } from "@/lib/utils";

type Row = "left" | "right";
type Col = "top" | "bottom";
type Direction = Col | Row | "center";
type FormDirectionProps = {
  direction: Direction | [Row, Col] | [Col, Row];
} & React.ComponentProps<"div">;

export const FormDirection = ({ className, direction, ...props }: FormDirectionProps) => {
  return (
    <div
      className={cn(
        "flex gap-2",
        direction.includes("left") && "justify-start",
        direction.includes("right") && "justify-end",
        direction.includes("bottom") && "items-end",
        direction.includes("center" as any) && "justify-center items-center",
        className
      )}
      {...props}
    />
  );
};
