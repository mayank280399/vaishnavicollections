"use client";

import {
  ArrowDownRight,
  ArrowUpRight,
  CircleDollarSign,
  Percent,
} from "lucide-react";

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

export function ProfitabilityOverview({ data }: Props) {
  const revenue = data.totalSales;
  const expenses = data.totalExpenses;
  const grossProfit = data.grossProfit;
  const netProfit = data.profitLoss;

  const margin =
    revenue > 0
      ? (netProfit / revenue) * 100
      : 0;

  const isProfit = netProfit >= 0;

  return (
    <DashboardCard className="h-full p-4 sm:p-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">
            Profitability
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Business performance
          </p>
        </div>

        <CircleDollarSign className="h-5 w-5 text-emerald-500" />
      </div>

      <div className="mt-5 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Revenue
          </span>

          <span className="text-xs font-semibold text-slate-800">
            {formatCurrency(revenue)}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Expenses
          </span>

          <span className="text-xs font-semibold text-slate-800">
            {formatCurrency(expenses)}
          </span>
        </div>

        <div className="border-t border-slate-100 pt-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Gross Profit
            </span>

            <span className="text-xs font-semibold text-emerald-600">
              {formatCurrency(grossProfit)}
            </span>
          </div>
        </div>

        <div
          className={[
            "rounded-lg p-3",
            isProfit ? "bg-emerald-50" : "bg-red-50",
          ].join(" ")}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isProfit ? (
                <ArrowUpRight className="h-4 w-4 text-emerald-600" />
              ) : (
                <ArrowDownRight className="h-4 w-4 text-red-600" />
              )}

              <span
                className={[
                  "text-xs font-medium",
                  isProfit
                    ? "text-emerald-700"
                    : "text-red-700",
                ].join(" ")}
              >
                {isProfit ? "Net Profit" : "Net Loss"}
              </span>
            </div>

            <span
              className={[
                "text-sm font-bold",
                isProfit
                  ? "text-emerald-700"
                  : "text-red-700",
              ].join(" ")}
            >
              {formatCurrency(Math.abs(netProfit))}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-lg bg-indigo-50 p-3">
          <div className="flex items-center gap-2">
            <Percent className="h-4 w-4 text-indigo-600" />

            <span className="text-xs font-medium text-indigo-700">
              Profit Margin
            </span>
          </div>

          <span className="text-sm font-bold text-indigo-700">
            {margin.toFixed(1)}%
          </span>
        </div>
      </div>
    </DashboardCard>
  );
}