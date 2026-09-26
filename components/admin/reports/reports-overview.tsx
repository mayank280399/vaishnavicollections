"use client";

import {
  ArrowDownToLine,
  Banknote,
  ShoppingBag,
  Wallet,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { ReportsStatCard } from "./reports-stat-card";
import { ReportsData } from "@/lib/reports/reports-types";


function money(value: number) {
  return `₹${value.toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;
}

type Props = {
  data: ReportsData;
};

export function ReportsOverview({ data }: Props) {
  const netCashFlow =
    data.sales.totalSales -
    data.purchases.totalPurchases -
    data.expenses.totalExpenses;

  const netProfit =
    data.sales.grossProfit -
    data.expenses.totalExpenses;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <ReportsStatCard
          title="Total Sales"
          value={money(data.sales.totalSales)}
          description={`${data.sales.invoiceCount} invoices`}
          icon={Banknote}
        />

        <ReportsStatCard
          title="Purchases"
          value={money(data.purchases.totalPurchases)}
          description={`${data.purchases.purchaseCount} purchases`}
          icon={ShoppingBag}
        />

        <ReportsStatCard
          title="Expenses"
          value={money(data.expenses.totalExpenses)}
          description={`${data.expenses.expenseCount} expenses`}
          icon={ArrowDownToLine}
        />

        <ReportsStatCard
          title="Net Profit"
          value={money(netProfit)}
          description="Gross profit − expenses"
          icon={Wallet}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="rounded-2xl shadow-none">
          <CardHeader>
            <CardTitle className="text-base">
              Financial Summary
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <SummaryRow
              label="Sales"
              value={money(data.sales.totalSales)}
            />

            <SummaryRow
              label="Cost of Goods Sold"
              value={money(data.sales.totalCost)}
            />

            <SummaryRow
              label="Gross Profit"
              value={money(data.sales.grossProfit)}
            />

            <SummaryRow
              label="Operating Expenses"
              value={money(data.expenses.totalExpenses)}
            />

            <div className="border-t pt-4">
              <SummaryRow
                label="Net Profit"
                value={money(netProfit)}
                strong
              />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-none">
          <CardHeader>
            <CardTitle className="text-base">
              Cash Flow View
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <SummaryRow
              label="Sales Received"
              value={money(data.sales.totalSales)}
            />

            <SummaryRow
              label="Inventory Purchases"
              value={`− ${money(data.purchases.totalPurchases)}`}
            />

            <SummaryRow
              label="Operating Expenses"
              value={`− ${money(data.expenses.totalExpenses)}`}
            />

            <div className="border-t pt-4">
              <SummaryRow
                label="Net Cash Flow"
                value={money(netCashFlow)}
                strong
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function SummaryRow({
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
          strong
            ? "font-semibold"
            : "text-sm font-medium"
        }
      >
        {value}
      </span>
    </div>
  );
}