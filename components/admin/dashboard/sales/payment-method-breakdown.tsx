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

export function PaymentMethodBreakdown({ data }: Props) {
  const items = data.paymentMethods ?? [];

  return (
    <DashboardCard className="h-full p-4 sm:p-5">
      <h2 className="text-sm font-semibold text-slate-900">
        Payment Methods
      </h2>

      <p className="mt-1 text-xs text-slate-500">
        Sales by payment method
      </p>

      <div className="mt-5 h-[245px]">
        {items.length === 0 ? (
          <div className="flex h-full items-center justify-center rounded-lg bg-slate-50">
            <p className="text-xs text-slate-400">
              Payment data will appear here
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={items}
              margin={{
                top: 10,
                right: 0,
                left: -20,
                bottom: 0,
              }}
            >
              <CartesianGrid
                vertical={false}
                stroke="#e2e8f0"
                strokeDasharray="3 3"
              />

              <XAxis
                dataKey="method"
                axisLine={false}
                tickLine={false}
                tick={{
                  fontSize: 9,
                  fill: "#94a3b8",
                }}
                tickFormatter={(value) =>
                  String(value).replace("_", " ")
                }
              />

              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{
                  fontSize: 9,
                  fill: "#94a3b8",
                }}
                tickFormatter={(value) => `₹${value}`}
                width={40}
              />

              <Tooltip
                formatter={(value) => [
                  formatCurrency(Number(value)),
                  "Sales",
                ]}
              />

              <Bar
                dataKey="amount"
                fill="#6366f1"
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