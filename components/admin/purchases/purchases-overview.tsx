
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
import { DashboardSectionHeader } from "../dashboard/dashboard-section-header";

type PurchasesOverviewProps = {
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

export function PurchasesOverview({ data }: PurchasesOverviewProps) {
  const chartData = (data.purchaseTrend ?? []).map((item) => ({
    period: item.period,
    amount: Number(item.amount ?? 0),
  }));

  const hasData = chartData.some((item) => item.amount > 0);

  return (
    <section className="flex h-full min-h-[280px] min-w-0 flex-col rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <DashboardSectionHeader
        title="Purchases Overview"
        subtitle="Purchase spending over time"
        viewAllHref="/purchases"
      />

      <div className="mt-3 flex items-end justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs text-gray-500">Period total</p>
          <p className="mt-1 truncate text-xl font-semibold text-gray-900">
            {formatCurrency(data.totalPurchases)}
          </p>
        </div>

        <span className="shrink-0 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
          Purchases
        </span>
      </div>

      {!hasData ? (
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <p className="text-sm font-medium text-gray-500">
              No purchase data
            </p>
            <p className="mt-1 text-xs text-gray-400">
              Received or completed purchases will appear here.
            </p>
          </div>
        </div>
      ) : (
        <div className="mt-3 min-h-[150px] flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{
                top: 8,
                right: 0,
                left: -12,
                bottom: 0,
              }}
            >
              <CartesianGrid
                vertical={false}
                stroke="#E5E7EB"
                strokeDasharray="3 3"
              />

              <XAxis
                dataKey="period"
                axisLine={false}
                tickLine={false}
                tick={{
                  fontSize: 10,
                  fill: "#9CA3AF",
                }}
                tickMargin={8}
                minTickGap={12}
              />

              <YAxis
                domain={[0, "auto"]}
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
                cursor={{ fill: "#F9FAFB" }}
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) {
                    return null;
                  }

                  const amount = Number(payload[0]?.value ?? 0);

                  return (
                    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-lg">
                      <p className="mb-1 text-xs font-medium text-gray-500">
                        {String(label)}
                      </p>
                      <p className="text-sm font-semibold text-gray-900">
                        {formatCurrency(amount)}
                      </p>
                    </div>
                  );
                }}
              />

              <Bar
                dataKey="amount"
                name="Purchases"
                fill="#D4AF37"
                radius={[4, 4, 0, 0]}
                maxBarSize={32}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}
