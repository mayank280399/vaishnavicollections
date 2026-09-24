"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ReportsData } from "@/lib/reports/reports-types";



function money(value: number) {
  return `₹${value.toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;
}

export function ReportsProfitLoss({
  data,
}: {
  data: ReportsData;
}) {
  const revenue = data.sales.totalSales;
  const costOfGoods = data.sales.totalCost;
  const grossProfit = data.sales.grossProfit;
  const expenses = data.expenses.totalExpenses;
  const netProfit = grossProfit - expenses;

  const grossMargin =
    revenue > 0 ? (grossProfit / revenue) * 100 : 0;

  const netMargin =
    revenue > 0 ? (netProfit / revenue) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Metric
          label="Gross Profit"
          value={money(grossProfit)}
        />

        <Metric
          label="Gross Margin"
          value={`${grossMargin.toFixed(1)}%`}
        />

        <Metric
          label="Net Profit"
          value={money(netProfit)}
        />
      </div>

      <Card className="rounded-2xl shadow-none">
        <CardHeader>
          <CardTitle className="text-base">
            Profit & Loss Statement
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <Row
            label="Sales Revenue"
            value={money(revenue)}
          />

          <Row
            label="Cost of Goods Sold"
            value={`− ${money(costOfGoods)}`}
          />

          <div className="border-t pt-4">
            <Row
              label="Gross Profit"
              value={money(grossProfit)}
              strong
            />
          </div>

          <Row
            label="Operating Expenses"
            value={`− ${money(expenses)}`}
          />

          <div className="border-t pt-4">
            <Row
              label="Net Profit"
              value={money(netProfit)}
              strong
            />
          </div>

          <p className="pt-2 text-xs text-muted-foreground">
            Net profit is calculated as recorded gross profit
            from sales minus operating expenses. Inventory
            purchases are not directly treated as expenses here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function Row({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span
        className={
          strong
            ? "font-semibold"
            : "text-sm text-muted-foreground"
        }
      >
        {label}
      </span>

      <span
        className={
          strong ? "font-semibold" : "text-sm font-medium"
        }
      >
        {value}
      </span>
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