"use client";

import type { DashboardData } from "@/lib/dashboard/types";
import { Gift } from "lucide-react";

import { DashboardCard } from "../dashboard-card";

type Props = {
  data: DashboardData;
};

export function LoyaltyProgram({ data }: Props) {
  return (
    <DashboardCard className="p-4">
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-pink-50">
          <Gift className="h-3.5 w-3.5 text-pink-600" />
        </div>

        <h2 className="text-sm font-semibold text-slate-900">
          Loyalty Program
        </h2>
      </div>

      <div className="mt-3 rounded-lg bg-slate-50 p-3">
        <p className="text-xs text-slate-500">
          Loyalty statistics will appear here.
        </p>
      </div>
    </DashboardCard>
  );
}