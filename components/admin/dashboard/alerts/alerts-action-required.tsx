
"use client";

import Link from "next/link";
import {
  AlertTriangle,
  AlertCircle,
  Info,
  ArrowRight,
} from "lucide-react";

import type {
  DashboardAlert,
  DashboardData,
} from "@/lib/dashboard/types";
import { DashboardCard } from "../dashboard-card";

type Props = {
  data: DashboardData;
};

const severityStyles = {
  critical: {
    icon: AlertCircle,
    iconClass: "text-red-600 bg-red-50",
    badgeClass: "bg-red-100 text-red-700",
  },
  warning: {
    icon: AlertTriangle,
    iconClass: "text-amber-600 bg-amber-50",
    badgeClass: "bg-amber-100 text-amber-700",
  },
  info: {
    icon: Info,
    iconClass: "text-blue-600 bg-blue-50",
    badgeClass: "bg-blue-100 text-blue-700",
  },
} as const;

function AlertRow({ alert }: { alert: DashboardAlert }) {
  const style = severityStyles[alert.severity];
  const Icon = style.icon;

  return (
    <Link
      href={alert.href}
      className="flex items-start gap-3 rounded-lg border border-slate-100 p-3 transition hover:border-slate-200 hover:bg-slate-50"
    >
      <span
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${style.iconClass}`}
      >
        <Icon className="h-4 w-4" />
      </span>

      <span className="min-w-0 flex-1">
        <span className="flex items-center justify-between gap-2">
          <span className="text-xs font-semibold text-slate-800">
            {alert.title}
          </span>
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${style.badgeClass}`}
          >
            {alert.count}
          </span>
        </span>

        <span className="mt-1 block text-xs leading-5 text-slate-500">
          {alert.description}
        </span>
      </span>

      <ArrowRight className="mt-1 h-3.5 w-3.5 shrink-0 text-slate-400" />
    </Link>
  );
}

export function AlertsActionRequired({ data }: Props) {
  const alerts = data.alerts ?? [];

  return (
    <DashboardCard className="p-4">
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-orange-50">
          <AlertTriangle className="h-3.5 w-3.5 text-orange-600" />
        </div>

        <h2 className="text-sm font-semibold text-slate-900">
          Alerts
        </h2>

        <span className="ml-auto rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
          {alerts.reduce((total, alert) => total + alert.count, 0)}
        </span>
      </div>

      <div className="mt-3 space-y-2">
        {alerts.length > 0 ? (
          alerts.map((alert) => (
            <AlertRow key={alert.id} alert={alert} />
          ))
        ) : (
          <div className="rounded-lg bg-emerald-50 p-3">
            <p className="text-xs font-medium text-emerald-700">
              No action-required alerts.
            </p>
            <p className="mt-1 text-xs text-emerald-600">
              There are no outstanding alerts to display.
            </p>
          </div>
        )}
      </div>
    </DashboardCard>
  );
}
