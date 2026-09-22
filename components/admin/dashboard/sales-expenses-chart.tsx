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

import type { SalesExpensePoint } from "@/lib/dashboard/types";

import { formatCurrency } from "@/lib/dashboard/calculations";

type Props = {
  data: SalesExpensePoint[];
};

export function SalesExpenseChart({
  data,
}: Props) {
  return (
    <div className="rounded-2xl border bg-card p-4 shadow-sm sm:p-5">
      <div className="mb-5">
        <h2 className="font-semibold">
          Sales vs Expenses
        </h2>

        <p className="mt-1 text-xs text-muted-foreground">
          Weekly business comparison
        </p>
      </div>

      <div className="mb-4 flex gap-5 text-xs">
        <div className="flex items-center gap-2">
          <span className="size-2.5 rounded-full bg-[#172B4D]" />
          <span>Sales</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="size-2.5 rounded-full bg-[#C9952E]" />
          <span>Expenses</span>
        </div>
      </div>

      <div className="h-[220px] w-full sm:h-[245px]">
        <ResponsiveContainer
          width="100%"
          height="100%"
        >
          <BarChart
            data={data}
            barGap={5}
            margin={{
              top: 5,
              right: 5,
              left: -20,
              bottom: 0,
            }}
          >
            <CartesianGrid
              vertical={false}
              strokeDasharray="3 3"
              className="stroke-muted"
            />

            <XAxis
              dataKey="period"
              tickLine={false}
              axisLine={false}
            />

            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{
                fontSize: 11,
              }}
              tickFormatter={(value) =>
                value >= 1000
                  ? `₹${Math.round(
                      value / 1000
                    )}K`
                  : `₹${value}`
              }
            />

            <Tooltip
              formatter={(value) => [
                formatCurrency(
                  Number(value)
                ),
              ]}
            />

            <Bar
              dataKey="sales"
              name="Sales"
              fill="#172B4D"
              radius={[
                5,
                5,
                0,
                0,
              ]}
            />

            <Bar
              dataKey="expenses"
              name="Expenses"
              fill="#C9952E"
              radius={[
                5,
                5,
                0,
                0,
              ]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}