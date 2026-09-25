"use client";

import {
  ArrowDownRight,
  ArrowUpRight,
  type LucideIcon,
} from "lucide-react";

type KpiTone =
  | "purple"
  | "blue"
  | "orange"
  | "green"
  | "red"
  | "indigo";

type FinancialKpiCardProps = {
  title: string;
  value: number;
  change?: number;
  icon: LucideIcon;
  tone: KpiTone;
  isCurrency?: boolean;
  showSign?: boolean;
};

const toneClasses: Record<
  KpiTone,
  {
    icon: string;
    iconBg: string;
  }
> = {
  purple: {
    icon: "text-purple-600",
    iconBg: "bg-purple-50",
  },

  blue: {
    icon: "text-blue-600",
    iconBg: "bg-blue-50",
  },

  orange: {
    icon: "text-orange-600",
    iconBg: "bg-orange-50",
  },

  green: {
    icon: "text-emerald-600",
    iconBg: "bg-emerald-50",
  },

  red: {
    icon: "text-red-600",
    iconBg: "bg-red-50",
  },

  indigo: {
    icon: "text-indigo-600",
    iconBg: "bg-indigo-50",
  },
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function FinancialKpiCard({
  title,
  value,
  change,
  icon: Icon,
  tone,
  isCurrency = true,
  showSign = false,
}: FinancialKpiCardProps) {
  const toneStyle = toneClasses[tone];

  const isPositive = (change ?? 0) >= 0;

  const displayValue = isCurrency
    ? formatCurrency(Math.abs(value))
    : value.toLocaleString("en-IN");

  return (
    <div
      className="
        relative min-w-0 overflow-hidden rounded-xl border border-slate-200
        bg-white p-4
        shadow-[0_1px_3px_rgba(15,23,42,0.04)]
        transition-shadow
        hover:shadow-[0_4px_12px_rgba(15,23,42,0.07)]
      "
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-xs font-medium text-slate-500">
            {title}
          </p>

          <div className="mt-2 flex items-baseline gap-1">
            {showSign && value > 0 && (
              <span className="text-lg font-semibold text-emerald-600">
                +
              </span>
            )}

            {showSign && value < 0 && (
              <span className="text-lg font-semibold text-red-600">
                -
              </span>
            )}

            <p
              className={[
                "truncate text-xl font-bold tracking-tight sm:text-2xl",
                value < 0 ? "text-red-600" : "text-slate-900",
              ].join(" ")}
            >
              {displayValue}
            </p>
          </div>
        </div>

        <div
          className={[
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
            toneStyle.iconBg,
          ].join(" ")}
        >
          <Icon className={`h-5 w-5 ${toneStyle.icon}`} strokeWidth={2} />
        </div>
      </div>

      <div className="mt-3 flex items-center gap-1.5">
        {change !== undefined ? (
          <>
            {isPositive ? (
              <ArrowUpRight className="h-3.5 w-3.5 text-emerald-600" />
            ) : (
              <ArrowDownRight className="h-3.5 w-3.5 text-red-600" />
            )}

            <span
              className={[
                "text-xs font-semibold",
                isPositive ? "text-emerald-600" : "text-red-600",
              ].join(" ")}
            >
              {Math.abs(change).toFixed(1)}%
            </span>

            <span className="text-xs text-slate-400">
              vs previous period
            </span>
          </>
        ) : (
          <span className="text-xs text-slate-400">
            No comparison available
          </span>
        )}
      </div>

      {/* Small decorative trend line */}
      <div className="mt-3 flex h-5 items-end gap-1 opacity-70">
        {[35, 50, 40, 65, 55, 72, 60, 82, 70, 88].map((height, index) => (
          <span
            key={index}
            className={[
              "w-full rounded-sm",
              toneStyle.iconBg,
            ].join(" ")}
            style={{ height: `${height}%` }}
          />
        ))}
      </div>
    </div>
  );
}