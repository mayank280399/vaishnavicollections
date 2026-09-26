"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SalesReport } from "@/lib/reports/reports-types";


function money(value: number) {
  return `₹${value.toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;
}

type Props = {
  data: SalesReport;
};

export function ReportsSales({ data }: Props) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Metric
          label="Total Sales"
          value={money(data.totalSales)}
        />

        <Metric
          label="Invoices"
          value={data.invoiceCount.toString()}
        />

        <Metric
          label="Average Sale"
          value={money(data.averageSale)}
        />

        <Metric
          label="Gross Profit"
          value={money(data.grossProfit)}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="rounded-2xl shadow-none">
          <CardHeader>
            <CardTitle className="text-base">
              Sales by Payment Method
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="space-y-3">
              {data.salesByPayment.map((item) => (
                <div
                  key={item.payment}
                  className="flex justify-between gap-4 text-sm"
                >
                  <span className="text-muted-foreground">
                    {item.payment}
                  </span>

                  <span className="font-medium">
                    {money(item.amount)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-none">
          <CardHeader>
            <CardTitle className="text-base">
              Recent Sales
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="space-y-3">
              {data.recentSales.map((sale) => (
                <div
                  key={sale.id}
                  className="flex items-center justify-between gap-3 border-b pb-3 last:border-0 last:pb-0"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {sale.invoiceNumber}
                    </p>

                    <p className="truncate text-xs text-muted-foreground">
                      {sale.customerName} · {sale.date}
                    </p>
                  </div>

                  <span className="shrink-0 text-sm font-semibold">
                    {money(sale.amount)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
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