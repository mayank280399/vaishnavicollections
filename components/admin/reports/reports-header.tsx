"use client";

import {
  CalendarDays,
  Download,
} from "lucide-react";

import { Button } from "@/components/ui/button";

type Props = {
  from: string;
  to: string;
  onRangeChange: (from: string, to: string) => void;
};

export function ReportsHeader({
  from,
  to,
  onRangeChange,
}: Props) {
  function setPreset(
    preset: "today" | "week" | "month" | "last-month",
  ) {
    const now = new Date();

    let start = new Date(now);
    let end = new Date(now);

    if (preset === "today") {
      // keep today
    }

    if (preset === "week") {
      const day = now.getDay();
      const diff = day === 0 ? 6 : day - 1;

      start.setDate(now.getDate() - diff);
    }

    if (preset === "month") {
      start = new Date(
        now.getFullYear(),
        now.getMonth(),
        1,
      );
    }

    if (preset === "last-month") {
      start = new Date(
        now.getFullYear(),
        now.getMonth() - 1,
        1,
      );

      end = new Date(
        now.getFullYear(),
        now.getMonth(),
        0,
      );
    }

    const format = (date: Date) =>
      date.toISOString().split("T")[0];

    onRangeChange(format(start), format(end));
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Reports
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Analyze your shop performance and financial activity.
        </p>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPreset("today")}
          >
            Today
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setPreset("week")}
          >
            This Week
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setPreset("month")}
          >
            This Month
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setPreset("last-month")}
          >
            Last Month
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 rounded-lg border px-3 py-2">
            <CalendarDays className="h-4 w-4 text-muted-foreground" />

            <input
              type="date"
              value={from}
              onChange={(e) =>
                onRangeChange(e.target.value, to)
              }
              className="bg-transparent text-sm outline-none"
            />

            <span className="text-muted-foreground">
              —
            </span>

            <input
              type="date"
              value={to}
              onChange={(e) =>
                onRangeChange(from, e.target.value)
              }
              className="bg-transparent text-sm outline-none"
            />
          </div>

          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>
    </div>
  );
}