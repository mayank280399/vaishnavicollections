"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CustomerReport } from "@/lib/reports/reports-types";



function money(value: number) {
  return `₹${value.toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;
}

export function ReportsCustomers({
  data,
}: {
  data: CustomerReport;
}) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Metric
          label="Total Customers"
          value={data.totalCustomers.toString()}
        />

        <Metric
          label="New Customers"
          value={data.newCustomers.toString()}
        />

        <Metric
          label="Returning"
          value={data.returningCustomers.toString()}
        />

        <Metric
          label="Customer Sales"
          value={money(data.totalCustomerSales)}
        />
      </div>

      <Card className="rounded-2xl shadow-none">
        <CardHeader>
          <CardTitle className="text-base">
            Top Customers
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="space-y-3">
            {data.topCustomers.map((customer, index) => (
              <div
                key={customer.id}
                className="flex items-center justify-between gap-3 border-b pb-3 last:border-0 last:pb-0"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold">
                    {index + 1}
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {customer.name}
                    </p>

                    <p className="text-xs text-muted-foreground">
                      {customer.orders} order
                      {customer.orders !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>

                <span className="shrink-0 text-sm font-semibold">
                  {money(customer.spent)}
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