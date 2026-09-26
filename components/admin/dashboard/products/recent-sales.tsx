"use client";

import { ArrowUpRight, Receipt } from "lucide-react";

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

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
  });
}

export function RecentSales({ data }: Props) {
  const sales = data.recentSales ?? [];

  return (
    <DashboardCard className="h-full p-4 sm:p-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">
            Recent Sales
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Latest transactions
          </p>
        </div>

        <Receipt className="h-5 w-5 text-indigo-500" />
      </div>

      {sales.length === 0 ? (
        <div className="mt-5 flex h-[235px] items-center justify-center rounded-lg bg-slate-50">
          <p className="text-xs text-slate-400">
            Recent sales will appear here
          </p>
        </div>
      ) : (
        <div className="mt-4 space-y-1">
          {sales.slice(0, 5).map((sale) => (
            <div
              key={sale.id}
              className="flex items-center gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-slate-50"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50">
                <ArrowUpRight className="h-4 w-4 text-indigo-600" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-slate-800">
                  {sale.invoiceNumber}
                </p>

                <p className="mt-0.5 text-[10px] text-slate-400">
                  {formatDate(sale.purchasedAt)}
                  {" • "}
                  {sale.paymentMethod}
                </p>
              </div>

              <span className="shrink-0 text-xs font-semibold text-slate-800">
                {formatCurrency(sale.amount)}
              </span>
            </div>
          ))}
        </div>
      )}
    </DashboardCard>
  );
}