"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { RevenuePoint } from "@/lib/dashboard/types";

import { formatCurrency } from "@/lib/dashboard/calculations";

type Props = {
  data: RevenuePoint[];
};

export function RevenueChart({
  data,
}: Props) {
  return (
    <div className="rounded-2xl border bg-card p-4 shadow-sm sm:p-5">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="font-semibold">
            Revenue Overview
          </h2>

          <p className="mt-1 text-xs text-muted-foreground">
            Revenue generated over the last 30 days
          </p>
        </div>

        <span className="rounded-lg bg-muted px-2.5 py-1 text-xs font-medium">
          30 Days
        </span>
      </div>

      <div className="h-[250px] w-full sm:h-[280px]">
        {data.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            No revenue data available
          </div>
        ) : (
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <AreaChart
              data={data}
              margin={{
                top: 5,
                right: 5,
                left: -20,
                bottom: 0,
              }}
            >
              <defs>
                <linearGradient
                  id="revenueFill"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor="#172B4D"
                    stopOpacity={0.25}
                  />

                  <stop
                    offset="100%"
                    stopColor="#172B4D"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>

              <CartesianGrid
                vertical={false}
                strokeDasharray="3 3"
                className="stroke-muted"
              />

              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tick={{
                  fontSize: 11,
                }}
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
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid hsl(var(--border))",
                  background:
                    "hsl(var(--background))",
                }}
                formatter={(value) => [
                  formatCurrency(
                    Number(value)
                  ),
                  "Revenue",
                ]}
              />

              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#172B4D"
                strokeWidth={2.5}
                fill="url(#revenueFill)"
                dot={false}
                activeDot={{
                  r: 5,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}