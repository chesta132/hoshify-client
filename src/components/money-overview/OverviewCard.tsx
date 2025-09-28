import { cn } from "@/lib/utils";
import { currencyToNumber } from "@/utils/manipulate/string";

type OverviewCardProps = {
  label: "Income" | "Outcome" | "Total";
  value: string;
};

export const OverviewCard = ({ label, value }: OverviewCardProps) => {
  return (
    <div className="bg-card rounded-2xl border-border border-[0.8px] p-4 flex flex-col">
      <span className="text-xs leading-4 text-card-foreground/60">{label}</span>
      <span
        className={cn(
          "text-lg lg:text-xl font-semibold leading-8",
          label === "Income" && "text-green-600",
          label === "Outcome" && "text-red-600",
          label === "Total" && currencyToNumber(value) >= 0 ? "text-green-600" : "text-red-600"
        )}
      >
        {value}
      </span>
    </div>
  );
};
