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

import type { DashboardData } from "@/lib/dashboard/types";
import { DashboardSectionHeader } from "../dashboard-section-header";

type SalesTrendProps = {
  data: DashboardData;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatAxisValue(value: number) {
  if (value >= 100000) {
    return `₹${(value / 100000).toFixed(1)}L`;
  }

  if (value >= 1000) {
    return `₹${(value / 1000).toFixed(0)}K`;
  }

  return `₹${value}`;
}

export function SalesTrend({ data }: SalesTrendProps) {
  const chartData = (data.revenueTrend ?? []).map((item) => ({
    date: item.date,
    revenue: Number(item.revenue ?? 0),
  }));

  const hasData = chartData.some((item) => item.revenue > 0);

  return (
    <section className="flex h-full min-h-[280px] min-w-0 flex-col rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <DashboardSectionHeader
        title="Sales Trend"
        subtitle="Revenue over time"
        viewAllHref="/admin/sales"
      />

      {!hasData ? (
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <p className="text-sm font-medium text-gray-500">
              No sales data
            </p>

            <p className="mt-1 text-xs text-gray-400">
              Sales data will appear here.
            </p>
          </div>
        </div>
      ) : (
        <div className="mt-2 min-h-0 flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{
                top: 8,
                right: 8,
                left: 0,
                bottom: 0,
              }}
            >
              <defs>
                <linearGradient
                  id="salesTrendGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor="#7C3AED"
                    stopOpacity={0.22}
                  />

                  <stop
                    offset="100%"
                    stopColor="#7C3AED"
                    stopOpacity={0.02}
                  />
                </linearGradient>
              </defs>

              <CartesianGrid
                vertical={false}
                stroke="#E5E7EB"
                strokeDasharray="3 3"
              />

              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{
                  fontSize: 10,
                  fill: "#9CA3AF",
                }}
                tickMargin={8}
              />

              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{
                  fontSize: 10,
                  fill: "#9CA3AF",
                }}
                tickFormatter={formatAxisValue}
                width={48}
              />

              <Tooltip
                content={({ active, payload, label }) => {
                  if (
                    !active ||
                    !payload ||
                    payload.length === 0
                  ) {
                    return null;
                  }

                  const revenue = Number(
                    payload[0]?.value ?? 0,
                  );

                  return (
                    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-lg">
                      <p className="mb-1 text-xs font-medium text-gray-500">
                        {String(label)}
                      </p>

                      <p className="text-sm font-semibold text-gray-900">
                        {formatCurrency(revenue)}
                      </p>
                    </div>
                  );
                }}
              />

              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#7C3AED"
                strokeWidth={2.5}
                fill="url(#salesTrendGradient)"
                dot={{
                  r: 3.5,
                  fill: "#7C3AED",
                  stroke: "#FFFFFF",
                  strokeWidth: 2,
                }}
                activeDot={{
                  r: 5,
                  fill: "#7C3AED",
                  stroke: "#FFFFFF",
                  strokeWidth: 2,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}