"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PurchaseReport } from "@/lib/reports/reports-types";


function money(value: number) {
  return `₹${value.toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;
}

export function ReportsPurchases({
  data,
}: {
  data: PurchaseReport;
}) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <Metric
          label="Total Purchases"
          value={money(data.totalPurchases)}
        />

        <Metric
          label="Purchase Transactions"
          value={data.purchaseCount.toString()}
        />

        <Metric
          label="Average Purchase"
          value={money(data.averagePurchase)}
        />
      </div>

      <Card className="rounded-2xl shadow-none">
        <CardHeader>
          <CardTitle className="text-base">
            Purchase Transactions
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="space-y-3">
            {data.recentPurchases.map((purchase) => (
              <div
                key={purchase.id}
                className="flex items-center justify-between gap-3 border-b pb-3 last:border-0 last:pb-0"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium">
                    {purchase.invoiceNumber}
                  </p>

                  <p className="truncate text-xs text-muted-foreground">
                    {purchase.supplierName} · {purchase.date}
                  </p>
                </div>

                <span className="shrink-0 text-sm font-semibold">
                  {money(purchase.amount)}
                </span>
              </div>
            ))}
          </div>
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