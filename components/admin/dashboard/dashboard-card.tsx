"use client";

import type { ReactNode } from "react";

type DashboardCardProps = {
  children: ReactNode;
  className?: string;
};

export function DashboardCard({
  children,
  className = "",
}: DashboardCardProps) {
  return (
    <section
      className={[
        "min-w-0 rounded-xl border border-slate-200 bg-white",
        "shadow-[0_1px_3px_rgba(15,23,42,0.04)]",
        className,
      ].join(" ")}
    >
      {children}
    </section>
  );
}