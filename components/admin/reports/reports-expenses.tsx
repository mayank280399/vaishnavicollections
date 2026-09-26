"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ExpenseReport } from "@/lib/reports/reports-types";



function money(value: number) {
  return `₹${value.toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;
}

export function ReportsExpenses({
  data,
}: {
  data: ExpenseReport;
}) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <Metric
          label="Total Expenses"
          value={money(data.totalExpenses)}
        />

        <Metric
          label="Transactions"
          value={data.expenseCount.toString()}
        />

        <Metric
          label="Average Expense"
          value={money(data.averageExpense)}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="rounded-2xl shadow-none">
          <CardHeader>
            <CardTitle className="text-base">
              Expenses by Category
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-3">
            {data.expensesByCategory.map((item) => (
              <div
                key={item.category}
                className="flex justify-between gap-4 text-sm"
              >
                <span className="text-muted-foreground">
                  {item.category}
                </span>

                <span className="font-medium">
                  {money(item.amount)}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-none">
          <CardHeader>
            <CardTitle className="text-base">
              Recent Expenses
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-3">
            {data.recentExpenses.map((expense) => (
              <div
                key={expense.id}
                className="flex justify-between gap-3 border-b pb-3 last:border-0 last:pb-0"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium">
                    {expense.category}
                  </p>

                  <p className="truncate text-xs text-muted-foreground">
                    {expense.description || expense.expenseNumber}
                  </p>
                </div>

                <span className="shrink-0 text-sm font-semibold">
                  {money(expense.amount)}
                </span>
              </div>
            ))}
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