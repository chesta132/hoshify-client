import { useUser } from "@/contexts";
import React from "react";
import { OverviewCard } from "./OverviewCard";

export const MoneyOverview = () => {
  const { user } = useUser();
  const { money } = user;

  const values = [
    { label: "Income", value: money.income },
    { label: "Outcome", value: money.outcome },
    { label: "Total", value: money.total },
  ] as const;

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      {values.map(({ label, value }) => (
        <React.Fragment key={label}>
          <OverviewCard label={label} value={value} />
        </React.Fragment>
      ))}
    </div>
  );
};
