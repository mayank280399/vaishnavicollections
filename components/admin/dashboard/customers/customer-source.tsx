"use client";

import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import type { DashboardData } from "@/lib/dashboard/types";
import { DashboardCard } from "../dashboard-card";

type Props = {
  data: DashboardData;
};

const COLORS = [
  "#6366f1",
  "#8b5cf6",
  "#10b981",
  "#f59e0b",
  "#ec4899",
];

export function CustomerSource({ data }: Props) {
  const items = data.customerSources ?? [];

  const total = items.reduce(
    (sum, item) => sum + Number(item.customers ?? 0),
    0,
  );

  return (
    <DashboardCard className="h-full p-4 sm:p-5">
      <h2 className="text-sm font-semibold text-slate-900">
        Customer Source
      </h2>

      <p className="mt-1 text-xs text-slate-500">
        Where customers come from
      </p>

      {items.length === 0 ? (
        <div className="mt-5 flex h-[235px] items-center justify-center rounded-lg bg-slate-50">
          <p className="text-xs text-slate-400">
            Customer source data will appear here
          </p>
        </div>
      ) : (
        <>
          <div className="relative mt-2 h-[165px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={items}
                  dataKey="customers"
                  nameKey="source"
                  cx="50%"
                  cy="50%"
                  innerRadius={42}
                  outerRadius={66}
                  paddingAngle={2}
                  stroke="none"
                >
                  {items.map((item, index) => (
                    <Cell
                      key={item.source}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>

                <Tooltip />
              </PieChart>
            </ResponsiveContainer>

            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-lg font-bold text-slate-900">
                {total}
              </span>
              <span className="text-[10px] text-slate-400">
                Customers
              </span>
            </div>
          </div>

          <div className="space-y-1.5">
            {items.slice(0, 4).map((item, index) => (
              <div
                key={item.source}
                className="flex items-center justify-between gap-2"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{
                      backgroundColor:
                        COLORS[index % COLORS.length],
                    }}
                  />

                  <span className="truncate text-[10px] text-slate-500">
                    {item.source.replaceAll("_", " ")}
                  </span>
                </div>

                <span className="text-[10px] font-semibold text-slate-700">
                  {item.customers}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </DashboardCard>
  );
}