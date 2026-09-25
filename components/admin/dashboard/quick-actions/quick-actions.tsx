"use client";

import {
  Plus,
  ShoppingCart,
  Package,
  Receipt,
} from "lucide-react";

import { DashboardCard } from "../dashboard-card";

export function QuickActions() {
  const actions = [
    {
      label: "Add Sale",
      icon: Plus,
    },
    {
      label: "Add Purchase",
      icon: ShoppingCart,
    },
    {
      label: "Add Product",
      icon: Package,
    },
    {
      label: "Add Expense",
      icon: Receipt,
    },
  ];

  return (
    <DashboardCard className="p-4">
      <h2 className="text-sm font-semibold text-slate-900">
        Quick Actions
      </h2>

      <div className="mt-3 space-y-1.5">
        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <button
              key={action.label}
              type="button"
              className="
                flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2
                text-left text-xs font-medium text-slate-600
                transition-colors
                hover:bg-slate-50 hover:text-slate-900
              "
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-indigo-50">
                <Icon className="h-3.5 w-3.5 text-indigo-600" />
              </span>

              <span>{action.label}</span>
            </button>
          );
        })}
      </div>
    </DashboardCard>
  );
}