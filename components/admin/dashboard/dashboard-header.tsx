"use client";

import { CalendarDays } from "lucide-react";

export function DashboardHeader() {
  const today = new Intl.DateTimeFormat(
    "en-IN",
    {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }
  ).format(new Date());

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Good morning 👋
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Here&apos;s your business overview
        </p>
      </div>

      <div className="hidden items-center gap-2 rounded-xl border bg-background px-3 py-2 text-sm text-muted-foreground sm:flex">
        <CalendarDays className="size-4" />

        <span>{today}</span>
      </div>
    </div>
  );
}