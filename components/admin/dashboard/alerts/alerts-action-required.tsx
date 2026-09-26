"use client";

import type { DashboardData } from "@/lib/dashboard/types";
import { AlertTriangle } from "lucide-react";

import { DashboardCard } from "../dashboard-card";

type Props = {
  data: DashboardData;
};

export function AlertsActionRequired({ data }: Props) {
  return (
    <DashboardCard className="p-4">
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-orange-50">
          <AlertTriangle className="h-3.5 w-3.5 text-orange-600" />
        </div>

        <h2 className="text-sm font-semibold text-slate-900">
          Alerts
        </h2>
      </div>

      <div className="mt-3 rounded-lg bg-slate-50 p-3">
        <p className="text-xs text-slate-500">
          Action required alerts will appear here.
        </p>
      </div>
    </DashboardCard>
  );
}