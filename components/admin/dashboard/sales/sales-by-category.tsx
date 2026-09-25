"use client";

import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import type { SalesCategoryPoint } from "@/lib/dashboard/types";

type SalesByCategoryProps = {
  data: SalesCategoryPoint[];
};

const CATEGORY_COLORS = [
  "#7C3AED",
  "#2563EB",
  "#10B981",
  "#F59E0B",
  "#EF4444",
];

const MAX_VISIBLE_CATEGORIES = 5;

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function truncateCategory(
  value: string,
  maxLength = 18,
) {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength - 1)}…`;
}

export function SalesByCategory({
  data,
}: SalesByCategoryProps) {
  const sortedData = [...(data ?? [])]
    .filter((item) => item.revenue > 0)
    .sort((a, b) => b.revenue - a.revenue);

  const visibleData =
    sortedData.length > MAX_VISIBLE_CATEGORIES
      ? [
          ...sortedData.slice(
            0,
            MAX_VISIBLE_CATEGORIES - 1,
          ),
          {
            category: "Other",
            revenue: sortedData
              .slice(MAX_VISIBLE_CATEGORIES - 1)
              .reduce(
                (sum, item) => sum + item.revenue,
                0,
              ),
          },
        ]
      : sortedData;

  const totalRevenue = visibleData.reduce(
    (sum, item) => sum + item.revenue,
    0,
  );

  const chartData = visibleData.map((item) => ({
    ...item,
    percentage:
      totalRevenue > 0
        ? (item.revenue / totalRevenue) * 100
        : 0,
  }));

  const hasData = chartData.length > 0;

  return (
    <section className="flex h-full min-h-[280px] min-w-0 flex-col rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      {/* Header */}
      <div className="mb-3">
        <h2 className="text-sm font-semibold text-gray-900">
          Sales by Category
        </h2>

        <p className="mt-0.5 text-xs text-gray-500">
          Revenue distribution
        </p>
      </div>

      {/* Empty state */}
      {!hasData ? (
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <p className="text-sm font-medium text-gray-500">
              No category sales
            </p>

            <p className="mt-1 text-xs text-gray-400">
              Sales data will appear here.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 items-center gap-3">
          {/* Donut */}
          <div className="relative h-[190px] w-[48%] min-w-0 shrink-0">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="revenue"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={82}
                  paddingAngle={2}
                  stroke="none"
                >
                  {chartData.map(
                    (item, index) => (
                      <Cell
                        key={`${item.category}-${index}`}
                        fill={
                          CATEGORY_COLORS[
                            index %
                              CATEGORY_COLORS.length
                          ]
                        }
                      />
                    ),
                  )}
                </Pie>

                <Tooltip
  content={({ active, payload }) => {
    if (
      !active ||
      !payload ||
      payload.length === 0
    ) {
      return null;
    }

    const item = payload[0];

    const category =
      item.payload?.category ?? "Unknown Category";

    const revenue = Number(
      item.value ?? 0,
    );

    return (
      <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-lg">
        <p className="mb-1 text-xs font-semibold text-gray-900">
          {category}
        </p>

        <p className="text-xs text-gray-600">
          Revenue:{" "}
          <span className="font-semibold text-gray-900">
            {formatCurrency(revenue)}
          </span>
        </p>
      </div>
    );
  }}
/>
              </PieChart>
            </ResponsiveContainer>

            {/* Center value */}
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[10px] font-medium text-gray-500">
                Total
              </span>

              <span className="mt-0.5 text-sm font-bold text-gray-900">
                {formatCurrency(totalRevenue)}
              </span>
            </div>
          </div>

          {/* Legend */}
          <div className="min-w-0 flex-1 space-y-3">
            {chartData.map((item, index) => {
              const categoryColor =
                CATEGORY_COLORS[
                  index %
                    CATEGORY_COLORS.length
                ];

              return (
                <div
                  key={`${item.category}-${index}`}
                  className="min-w-0"
                >
                  <div className="flex items-center gap-2">
                    {/* Same color as pie slice */}
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{
                        backgroundColor:
                          categoryColor,
                      }}
                    />

                    <span
                      className="min-w-0 flex-1 truncate text-xs font-medium text-gray-700"
                      title={item.category}
                    >
                      {truncateCategory(
                        item.category,
                      )}
                    </span>

                    <span className="shrink-0 text-xs font-semibold text-gray-900">
                      {item.percentage.toFixed(1)}%
                    </span>
                  </div>

                  <div className="ml-[18px] mt-0.5 text-[11px] text-gray-500">
                    {formatCurrency(item.revenue)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}