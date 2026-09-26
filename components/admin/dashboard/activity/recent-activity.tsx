"use client";

import type { DashboardData } from "@/lib/dashboard/types";
import { Activity } from "lucide-react";

import { DashboardCard } from "../dashboard-card";

type Props = {
  data: DashboardData;
};

export function RecentActivity({ data }: Props) {
  return (
    <DashboardCard className="p-4">
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-purple-50">
          <Activity className="h-3.5 w-3.5 text-purple-600" />
        </div>

        <h2 className="text-sm font-semibold text-slate-900">
          Recent Activity
        </h2>
      </div>

      <div className="mt-3">
        <p className="text-xs text-slate-500">
          Recent business activity will appear here.
        </p>
      </div>
    </DashboardCard>
  );
}