"use client";

import type { DashboardData } from "@/lib/dashboard/types";
import { DashboardCard } from "../dashboard-card";

type Props = {
  data: DashboardData;
};

export function InventoryOverview({ data }: Props) {
  return (
    <DashboardCard className="min-h-[300px] p-5">
      <h2 className="text-sm font-semibold text-slate-900">
        Inventory Overview
      </h2>

      <p className="mt-1 text-xs text-slate-500">
        Current inventory status
      </p>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-slate-50 p-3">
          <p className="text-xs text-slate-500">Products</p>
          <p className="mt-1 text-lg font-semibold text-slate-900">—</p>
        </div>

        <div className="rounded-lg bg-slate-50 p-3">
          <p className="text-xs text-slate-500">Stock Value</p>
          <p className="mt-1 text-lg font-semibold text-slate-900">—</p>
        </div>

        <div className="rounded-lg bg-emerald-50 p-3">
          <p className="text-xs text-emerald-700">In Stock</p>
          <p className="mt-1 text-lg font-semibold text-emerald-700">—</p>
        </div>

        <div className="rounded-lg bg-orange-50 p-3">
          <p className="text-xs text-orange-700">Low Stock</p>
          <p className="mt-1 text-lg font-semibold text-orange-700">—</p>
        </div>
      </div>
    </DashboardCard>
  );
}