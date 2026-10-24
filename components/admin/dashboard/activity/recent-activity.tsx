
"use client";

import Link from "next/link";
import {
  Activity,
  ArrowRight,
  ShoppingBag,
  ShoppingCart,
  UserRound,
  RotateCcw,
  Wallet,
} from "lucide-react";

import type {
  DashboardActivity,
  DashboardData,
} from "@/lib/dashboard/types";
import { DashboardCard } from "../dashboard-card";

type Props = {
  data: DashboardData;
};

const activityIcons = {
  sale: ShoppingBag,
  customer: UserRound,
  order: ShoppingCart,
  return: RotateCcw,
  refund: Wallet,
} as const;

function formatActivityTime(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function ActivityRow({ item }: { item: DashboardActivity }) {
  const Icon = activityIcons[item.type];

  return (
    <Link
      href={item.href}
      className="flex items-start gap-3 rounded-lg p-2 transition hover:bg-slate-50"
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-purple-50">
        <Icon className="h-4 w-4 text-purple-600" />
      </span>

      <span className="min-w-0 flex-1">
        <span className="block text-xs font-semibold text-slate-800">
          {item.title}
        </span>
        <span className="mt-0.5 block text-xs leading-5 text-slate-500">
          {item.description}
        </span>
        <span className="mt-1 block text-[10px] text-slate-400">
          {formatActivityTime(item.timestamp)}
        </span>
      </span>

      <ArrowRight className="mt-1 h-3.5 w-3.5 shrink-0 text-slate-400" />
    </Link>
  );
}

export function RecentActivity({ data }: Props) {
  const activities = [...(data.recentActivity ?? [])]
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() -
        new Date(a.timestamp).getTime(),
    )
    .slice(0, 6);

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
        {activities.length > 0 ? (
          <div className="space-y-1">
            {activities.map((item) => (
              <ActivityRow key={`${item.type}-${item.id}`} item={item} />
            ))}
          </div>
        ) : (
          <p className="rounded-lg bg-slate-50 p-3 text-xs text-slate-500">
            No recent business activity is available.
          </p>
        )}
      </div>
    </DashboardCard>
  );
}
