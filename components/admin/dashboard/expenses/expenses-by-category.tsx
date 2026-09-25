"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { DashboardData } from "@/lib/dashboard/types";
import { DashboardCard } from "../dashboard-card";

type Props = {
  data: DashboardData;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function ExpensesByCategory({ data }: Props) {
  const items = data.expensesByCategory ?? [];

  return (
    <DashboardCard className="h-full p-4 sm:p-5">
      <h2 className="text-sm font-semibold text-slate-900">
        Expenses by Category
      </h2>

      <p className="mt-1 text-xs text-slate-500">
        Where money is being spent
      </p>

      <div className="mt-5 h-[235px]">
        {items.length === 0 ? (
          <div className="flex h-full items-center justify-center rounded-lg bg-slate-50">
            <p className="text-xs text-slate-400">
              Expense data will appear here
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={items}
              layout="vertical"
              margin={{
                top: 0,
                right: 10,
                left: 0,
                bottom: 0,
              }}
              barCategoryGap="28%"
            >
              <CartesianGrid
                horizontal={false}
                stroke="#e2e8f0"
                strokeDasharray="3 3"
              />

              <XAxis
                type="number"
                axisLine={false}
                tickLine={false}
                tick={{
                  fontSize: 9,
                  fill: "#94a3b8",
                }}
                tickFormatter={(value) => `₹${value}`}
              />

              <YAxis
                type="category"
                dataKey="category"
                axisLine={false}
                tickLine={false}
                tick={{
                  fontSize: 9,
                  fill: "#64748b",
                }}
                width={65}
              />

              <Tooltip
                formatter={(value) => [
                  formatCurrency(Number(value)),
                  "Expense",
                ]}
              />

              <Bar
                dataKey="amount"
                fill="#f59e0b"
                radius={[0, 4, 4, 0]}
                maxBarSize={18}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </DashboardCard>
  );
}