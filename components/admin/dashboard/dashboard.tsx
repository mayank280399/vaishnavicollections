
"use client";

import {
  ArrowDownRight,
  ArrowUpRight,
  Banknote,
  ChartNoAxesCombined,
  Wallet,
} from "lucide-react";
import { AddTransactionDialog } from "@/components/admin/daily-entry/add-transaction-dialog";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { MetricCard } from "./metric-card";
import { RevenueChart } from "./revenue-chart";
import { SalesExpenseChart } from "./sales-expenses-chart";
import { TopProducts } from "./top-products";
import { RecentSales } from "./recent-sales";

import type { DashboardData } from "@/lib/dashboard/types";

type DashboardProps = {
  data: DashboardData;
};

type FilterValue =
  | "today"
  | "this-week"
  | "this-month"
  | "this-year"
  | "all-time"
  | "custom";

const FILTERS: {
  value: FilterValue;
  label: string;
}[] = [
  {
    value: "today",
    label: "Today",
  },
  {
    value: "this-week",
    label: "This Week",
  },
  {
    value: "this-month",
    label: "This Month",
  },
  {
    value: "this-year",
    label: "This Year",
  },
  {
    value: "all-time",
    label: "All Time",
  },
  {
    value: "custom",
    label: "Custom Range",
  },
];

function getDefaultFilter(
  value: string | null
): FilterValue {
  if (
    value === "today" ||
    value === "this-week" ||
    value === "this-month" ||
    value === "this-year" ||
    value === "all-time" ||
    value === "custom"
  ) {
    return value;
  }

  return "all-time";
}

export function Dashboard({
  data,
}: DashboardProps) {
  console.log("Dashboard data:", data);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentFilter = getDefaultFilter(
    searchParams.get("range")
  );

  const [showCustomRange, setShowCustomRange] =
    useState(currentFilter === "custom");

  const [customStartDate, setCustomStartDate] =
    useState(
      searchParams.get("start") ?? ""
    );

  const [customEndDate, setCustomEndDate] =
    useState(
      searchParams.get("end") ?? ""
    );

  const isProfit = data.profitLoss >= 0;

  function updateFilter(
    filter: FilterValue
  ) {
    if (filter === "custom") {
      setShowCustomRange(true);
      return;
    }

    setShowCustomRange(false);

    const params = new URLSearchParams(
      searchParams.toString()
    );

    params.set("range", filter);
    params.delete("start");
    params.delete("end");

    router.push(
      `${pathname}?${params.toString()}`
    );
  }

  function applyCustomRange() {
    if (
      !customStartDate ||
      !customEndDate
    ) {
      return;
    }

    if (
      customStartDate > customEndDate
    ) {
      return;
    }

    const params = new URLSearchParams(
      searchParams.toString()
    );

    params.set("range", "custom");
    params.set("start", customStartDate);
    params.set("end", customEndDate);

    router.push(
      `${pathname}?${params.toString()}`
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Dashboard
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Overview of your business performance
          </p>
        </div>

        {/* Date Filter */}
        <div className="flex flex-col items-stretch gap-2 sm:items-end">
          <div className="flex flex-wrap gap-2 rounded-lg border bg-background p-1">
            {FILTERS.map((filter) => {
              const isSelected =
                currentFilter ===
                filter.value;

              return (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() =>
                    updateFilter(
                      filter.value
                    )
                  }
                  className={[
                    "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    "whitespace-nowrap",
                    isSelected
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  ].join(" ")}
                >
                  {filter.label}
                </button>
              );
            })}
          </div>

          {/* Custom Date Range */}
          {showCustomRange && (
            <div className="flex flex-col gap-2 rounded-lg border bg-background p-3 sm:flex-row sm:items-end">
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="dashboard-start-date"
                  className="text-xs font-medium text-muted-foreground"
                >
                  From
                </label>

                <input
                  id="dashboard-start-date"
                  type="date"
                  value={customStartDate}
                  onChange={(event) =>
                    setCustomStartDate(
                      event.target.value
                    )
                  }
                  className="h-9 rounded-md border bg-background px-3 text-sm"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label
                  htmlFor="dashboard-end-date"
                  className="text-xs font-medium text-muted-foreground"
                >
                  To
                </label>

                <input
                  id="dashboard-end-date"
                  type="date"
                  value={customEndDate}
                  onChange={(event) =>
                    setCustomEndDate(
                      event.target.value
                    )
                  }
                  className="h-9 rounded-md border bg-background px-3 text-sm"
                />
              </div>

              <button
                type="button"
                onClick={applyCustomRange}
                disabled={
                  !customStartDate ||
                  !customEndDate ||
                  customStartDate >
                    customEndDate
                }
                className="h-9 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50"
              >
                Apply
              </button>
            </div>
          )}
        </div>
         <AddTransactionDialog />
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Total Sales"
          value={data.totalSales}
          change={data.revenueChange}
          icon={Banknote}
          tone="green"
          isCurrency
        />

        <MetricCard
          title="Expenses"
          value={data.totalExpenses}
          change={data.expenseChange}
          icon={Wallet}
          tone="orange"
          isCurrency
        />

        <MetricCard
          title="Gross Profit"
          value={data.grossProfit}
          change={data.grossProfitChange}
          icon={ChartNoAxesCombined}
          tone="green"
          isCurrency
        />

        <MetricCard
          title={
            isProfit
              ? "Profit"
              : "Loss"
          }
          value={data.profitLoss}
          change={data.profitChange}
          icon={
            isProfit
              ? ArrowUpRight
              : ArrowDownRight
          }
          tone={
            isProfit
              ? "green"
              : "red"
          }
          isCurrency
          showSign
        />
      </div>

      {/* Charts */}
      <div className="grid gap-6 xl:grid-cols-2">
        <RevenueChart
          data={data.revenueTrend}
        />

        <SalesExpenseChart
          data={data.salesVsExpenses}
        />
      </div>

      {/* Products + Recent Sales */}
      <div className="grid gap-6 xl:grid-cols-2">
        <TopProducts
          products={data.topProducts}
        />

        <RecentSales
          sales={data.recentSales}
        />
      </div>
    </div>
  );
}

