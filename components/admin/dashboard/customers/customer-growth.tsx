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

type CustomerGrowthProps = {
  data: DashboardData;
};

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-IN").format(value);
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{
    value?: number;
  }>;
  label?: string;
}) {
  if (!active || !payload?.length) {
    return null;
  }

  const value = Number(payload[0]?.value ?? 0);

  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-lg">
      <p className="text-xs font-medium text-slate-500">
        {label}
      </p>

      <p className="mt-0.5 text-sm font-semibold text-slate-900">
        {formatNumber(value)} customers
      </p>
    </div>
  );
}

export function CustomerGrowth({
  data,
}: CustomerGrowthProps) {
  const customerGrowth = data.customerGrowth ?? [];

  const totalCustomers =
    customerGrowth.length > 0
      ? customerGrowth[customerGrowth.length - 1]?.customers ?? 0
      : 0;

  const previousCustomers =
    customerGrowth.length > 1
      ? customerGrowth[customerGrowth.length - 2]?.customers ?? 0
      : 0;

  const growthPercentage =
    previousCustomers > 0
      ? ((totalCustomers - previousCustomers) / previousCustomers) * 100
      : 0;

  const isPositiveGrowth = growthPercentage >= 0;

  return (
    <DashboardCard className="p-4 sm:p-5">
      {/* HEADER */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="truncate text-sm font-semibold text-slate-900">
            Customer Growth
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            New customers over time
          </p>
        </div>

        <div className="shrink-0 rounded-lg bg-purple-50 px-2 py-1">
          <span className="text-xs font-semibold text-purple-600">
            Customers
          </span>
        </div>
      </div>

      {/* SUMMARY */}
      <div className="mt-4 flex items-end justify-between gap-3">
        <div>
          <p className="text-2xl font-bold tracking-tight text-slate-900">
            {formatNumber(totalCustomers)}
          </p>

          <p className="mt-0.5 text-xs text-slate-500">
            Total customers
          </p>
        </div>

        {customerGrowth.length > 1 && (
          <div
            className={[
              "text-right text-xs font-semibold",
              isPositiveGrowth
                ? "text-emerald-600"
                : "text-red-600",
            ].join(" ")}
          >
            {isPositiveGrowth ? "+" : ""}
            {growthPercentage.toFixed(1)}%

            <p className="mt-0.5 font-normal text-slate-400">
              vs previous period
            </p>
          </div>
        )}
      </div>

      {/* CHART */}
      <div className="mt-5 h-[180px] w-full">
        {customerGrowth.length === 0 ? (
          <div className="flex h-full items-center justify-center rounded-lg bg-slate-50">
            <p className="text-xs text-slate-400">
              No customer data available
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={customerGrowth}
              margin={{
                top: 8,
                right: 0,
                left: -18,
                bottom: 0,
              }}
              barCategoryGap="28%"
            >
              <CartesianGrid
                vertical={false}
                stroke="#e2e8f0"
                strokeDasharray="3 3"
              />

              <XAxis
                dataKey="period"
                axisLine={false}
                tickLine={false}
                tick={{
                  fontSize: 10,
                  fill: "#94a3b8",
                }}
                tickMargin={8}
              />

              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{
                  fontSize: 10,
                  fill: "#94a3b8",
                }}
                allowDecimals={false}
                width={35}
              />

              <Tooltip
                cursor={{
                  fill: "#f8fafc",
                }}
                content={<CustomTooltip />}
              />

              <Bar
                dataKey="customers"
                fill="#8b5cf6"
                radius={[4, 4, 0, 0]}
                maxBarSize={28}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </DashboardCard>
  );
}