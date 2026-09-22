"use client";

import type { LucideIcon } from "lucide-react";
import {
  ArrowDownRight,
  ArrowUpRight,
} from "lucide-react";

const money = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

type MetricTone =
  | "green"
  | "orange"
  | "dark"
  | "red";

type MetricCardProps = {
  title: string;
  value: number;
  change?: number;
  icon: LucideIcon;
  tone?: MetricTone;
  isCurrency?: boolean;
  showSign?: boolean;
};

const toneStyles: Record<
  MetricTone,
  {
    icon: string;
    background: string;
  }
> = {
  green: {
    icon: "text-emerald-600",
    background:
      "bg-emerald-50 dark:bg-emerald-950/30",
  },

  orange: {
    icon: "text-orange-600",
    background:
      "bg-orange-50 dark:bg-orange-950/30",
  },

  dark: {
    icon: "text-slate-700 dark:text-slate-200",
    background:
      "bg-slate-100 dark:bg-slate-800",
  },

  red: {
    icon: "text-red-600",
    background:
      "bg-red-50 dark:bg-red-950/30",
  },
};

export function MetricCard({
  title,
  value,
  change,
  icon: Icon,
  tone = "green",
  isCurrency = false,
  showSign = false,
}: MetricCardProps) {
  const styles = toneStyles[tone];

  const formattedValue = isCurrency
    ? money.format(Math.abs(value))
    : value.toLocaleString("en-IN");

  const displayValue =
    showSign && value < 0
      ? `-${formattedValue}`
      : formattedValue;

  const isPositiveChange =
    (change ?? 0) >= 0;

  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm">
      <div className="flex items-center gap-4">
        {/* Icon */}
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${styles.background}`}
        >
          <Icon
            className={`h-6 w-6 ${styles.icon}`}
            strokeWidth={2.2}
          />
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-muted-foreground">
            {title}
          </p>

          <p className="mt-1 truncate text-2xl font-bold tracking-tight">
            {displayValue}
          </p>

          {change !== undefined && (
            <div
              className={`mt-1 flex items-center gap-1 text-xs font-medium ${
                isPositiveChange
                  ? "text-emerald-600"
                  : "text-red-600"
              }`}
            >
              {isPositiveChange ? (
                <ArrowUpRight className="h-3.5 w-3.5" />
              ) : (
                <ArrowDownRight className="h-3.5 w-3.5" />
              )}

              <span>
                {Math.abs(change).toFixed(1)}%
              </span>

              <span className="text-muted-foreground">
                vs previous period
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}