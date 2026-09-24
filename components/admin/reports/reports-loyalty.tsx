"use client";

import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { LoyaltyReport } from "@/lib/reports/reports-types";


function money(value: number) {
  return `₹${value.toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;
}

export function ReportsLoyalty({
  data,
}: {
  data: LoyaltyReport;
}) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <Metric
          label="Loyalty Customers"
          value={data.loyaltyCustomers.toString()}
        />

        <Metric
          label="Stamps Earned"
          value={data.stampsEarned.toString()}
        />

        <Metric
          label="Stamps Redeemed"
          value={data.stampsRedeemed.toString()}
        />

        <Metric
          label="Outstanding Stamps"
          value={data.outstandingStamps.toString()}
        />

        <Metric
          label="Rewards Redeemed"
          value={data.rewardsRedeemed.toString()}
        />

        <Metric
          label="Loyalty Sales"
          value={money(data.loyaltySales)}
        />
      </div>

      <Card className="rounded-2xl shadow-none">
        <CardContent className="p-5">
          <h3 className="font-semibold">
            Loyalty performance
          </h3>

          <p className="mt-1 text-sm text-muted-foreground">
            This section shows how much activity is coming
            from customers enrolled in your loyalty program.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <Card className="rounded-2xl shadow-none">
      <CardContent className="p-4">
        <p className="text-xs text-muted-foreground">
          {label}
        </p>

        <p className="mt-1 text-lg font-semibold">
          {value}
        </p>
      </CardContent>
    </Card>
  );
}