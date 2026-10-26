"use client";

import {
  CalendarDays,
  Download,
  FileSpreadsheet,
  Loader2,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  from: string;
  to: string;
  onRangeChange: (from: string, to: string) => void;
  onExport: () => void;
  exporting: boolean;
  exportError: string | null;
};

type Preset = "today" | "week" | "month" | "last-month";

function toDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function ReportsHeader({
  from,
  to,
  onRangeChange,
  onExport,
  exporting,
  exportError,
}: Props) {
  function setPreset(preset: Preset) {
    const now = new Date();
    let start = new Date(now);
    let end = new Date(now);

    if (preset === "week") {
      const day = now.getDay();
      start.setDate(now.getDate() - (day === 0 ? 6 : day - 1));
    } else if (preset === "month") {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (preset === "last-month") {
      start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      end = new Date(now.getFullYear(), now.getMonth(), 0);
    }

    onRangeChange(toDateInputValue(start), toDateInputValue(end));
  }

  const presets: { label: string; value: Preset }[] = [
    { label: "Today", value: "today" },
    { label: "This week", value: "week" },
    { label: "This month", value: "month" },
    { label: "Last month", value: "last-month" },
  ];

  return (
    <section className="space-y-4 sm:space-y-5">
      <div className="relative overflow-hidden rounded-2xl bg-brand-navy p-5 text-white shadow-sm sm:p-7 lg:p-8">
        <div aria-hidden="true" className="pointer-events-none absolute -right-12 -top-20 size-64 rounded-full border border-brand-gold/20 sm:size-80" />
        <div aria-hidden="true" className="pointer-events-none absolute -right-2 -top-10 size-48 rounded-full border border-brand-gold/15 sm:size-64" />
        <div className="relative flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="min-w-0">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-brand-gold/30 bg-white/5 px-3 py-1.5 text-xs font-semibold tracking-wide text-brand-gold">
              <Sparkles className="size-3.5" />
              BUSINESS INTELLIGENCE
            </div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Reports & analytics</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/70 sm:text-base">
              Understand sales, stock purchases, expenses and profitability — all in one place.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
            <span className="flex size-10 items-center justify-center rounded-lg bg-brand-gold text-brand-navy">
              <FileSpreadsheet className="size-5" />
            </span>
            <div>
              <p className="text-sm font-semibold">CA monthly report</p>
              <p className="mt-0.5 text-xs text-white/65">Excel export · GST source records</p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <CalendarDays className="size-4 text-brand-gold" />
              Reporting period
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {presets.map((preset) => (
                <Button
                  key={preset.value}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setPreset(preset.value)}
                  className="h-9 rounded-lg px-3"
                >
                  {preset.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] xl:w-auto xl:min-w-[420px]">
            <label className="block min-w-0 text-xs font-medium text-muted-foreground">
              From
              <input
                aria-label="Report start date"
                type="date"
                value={from}
                max={to || undefined}
                onChange={(event) => onRangeChange(event.target.value, to)}
                className="mt-1.5 h-11 w-full min-w-0 rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none transition focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20"
              />
            </label>
            <label className="block min-w-0 text-xs font-medium text-muted-foreground">
              To
              <input
                aria-label="Report end date"
                type="date"
                value={to}
                min={from || undefined}
                onChange={(event) => onRangeChange(from, event.target.value)}
                className="mt-1.5 h-11 w-full min-w-0 rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none transition focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20"
              />
            </label>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs leading-5 text-muted-foreground">
            Choose a period to update the report panels below. Export includes sales, website orders, purchases, expenses, returns and refunds.
          </p>
          <Button
            type="button"
            onClick={onExport}
            disabled={exporting || !from || !to || from > to}
            className="h-11 w-full shrink-0 rounded-xl bg-brand-navy px-5 text-white hover:bg-brand-navy/90 sm:w-auto"
          >
            {exporting ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Download className="mr-2 size-4" />}
            {exporting ? "Preparing Excel…" : "Export CA Excel"}
          </Button>
        </div>

        {exportError && (
          <div role="alert" className="mt-3 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-sm text-destructive">
            {exportError}
          </div>
        )}
      </div>
    </section>
  );
}
