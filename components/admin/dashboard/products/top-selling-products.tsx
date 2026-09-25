"use client";

import { Package } from "lucide-react";

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

export function TopSellingProducts({ data }: Props) {
  const products = data.topProducts ?? [];

  return (
    <DashboardCard className="h-full p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">
            Top Selling Products
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Best performers by revenue
          </p>
        </div>

        <Package className="h-5 w-5 text-indigo-500" />
      </div>

      {products.length === 0 ? (
        <div className="mt-5 flex h-[235px] items-center justify-center rounded-lg bg-slate-50">
          <p className="text-xs text-slate-400">
            Product data will appear here
          </p>
        </div>
      ) : (
        <div className="mt-5 overflow-x-auto">
          <div className="min-w-[360px]">
            <div className="grid grid-cols-[28px_minmax(0,1fr)_55px_75px] gap-2 border-b border-slate-100 pb-2 text-[10px] font-medium uppercase tracking-wide text-slate-400">
              <span>#</span>
              <span>Product</span>
              <span className="text-right">Units</span>
              <span className="text-right">Revenue</span>
            </div>

            <div className="divide-y divide-slate-100">
              {products.slice(0, 5).map((product, index) => (
                <div
                  key={product.productId}
                  className="grid grid-cols-[28px_minmax(0,1fr)_55px_75px] items-center gap-2 py-3"
                >
                  <span className="text-xs font-semibold text-slate-400">
                    {index + 1}
                  </span>

                  <span className="truncate text-xs font-medium text-slate-700">
                    {product.productName}
                  </span>

                  <span className="text-right text-xs text-slate-500">
                    {product.quantity}
                  </span>

                  <span className="text-right text-xs font-semibold text-slate-800">
                    {formatCurrency(product.revenue)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </DashboardCard>
  );
}