"use client";

import { useEffect, useState } from "react";
import { AlertCircle, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReportsCustomers } from "./reports-customers";
import { ReportsExpenses } from "./reports-expenses";
import { ReportsHeader } from "./reports-header";
import { ReportsLoyalty } from "./reports-loyalty";
import { ReportsOverview } from "./reports-overview";
import { ReportsProfitLoss } from "./reports-profit-loss";
import { ReportsPurchases } from "./reports-purchases";
import { ReportsSales } from "./reports-sales";
import { ReportsTabs } from "./reports-tabs";
import { DateRange, ReportsData, ReportTab } from "@/lib/reports/reports-types";
import { getReportsData } from "@/lib/reports/reports-queries";

function localDateValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getInitialRange(): DateRange {
  const now = new Date();
  return {
    from: localDateValue(new Date(now.getFullYear(), now.getMonth(), 1)),
    to: localDateValue(now),
  };
}

export function ReportsPage() {
  const [range, setRange] = useState<DateRange>(getInitialRange);
  const [activeTab, setActiveTab] = useState<ReportTab>("overview");
  const [data, setData] = useState<ReportsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);
        const result = await getReportsData(range);
        if (!cancelled) setData(result);
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load reports.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [range]);

  async function exportCaWorkbook() {
    if (!range.from || !range.to || range.from > range.to) {
      setExportError("Choose a valid reporting period before exporting.");
      return;
    }

    setExporting(true);
    setExportError(null);
    try {
      const response = await fetch(
        `/api/admin/gst-export?from=${encodeURIComponent(range.from)}&to=${encodeURIComponent(range.to)}`,
        { method: "GET", cache: "no-store" },
      );

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error || "Unable to prepare the CA Excel report.");
      }

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = `vaishnavi-collections-gst-source-report-${range.from}-to-${range.to}.xls`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
    } catch (err) {
      setExportError(err instanceof Error ? err.message : "Unable to download the CA Excel report.");
    } finally {
      setExporting(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-[1600px] space-y-5 p-3 sm:space-y-6 sm:p-5 lg:p-7">
      <ReportsHeader
        from={range.from}
        to={range.to}
        onRangeChange={(from, to) => setRange({ from, to })}
        onExport={exportCaWorkbook}
        exporting={exporting}
        exportError={exportError}
      />

      <ReportsTabs activeTab={activeTab} onChange={setActiveTab} />

      {loading && (
        <div className="flex min-h-[240px] flex-col items-center justify-center rounded-2xl border border-border bg-card px-4 py-10 text-center sm:min-h-[300px]">
          <span className="flex size-11 items-center justify-center rounded-full bg-brand-gold/15 text-brand-navy">
            <Loader2 className="size-5 animate-spin" />
          </span>
          <p className="mt-3 text-sm font-semibold">Preparing your reports</p>
          <p className="mt-1 text-xs text-muted-foreground">Gathering records for the selected period…</p>
        </div>
      )}

      {!loading && error && (
        <div role="alert" className="flex flex-col gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 size-5 shrink-0 text-destructive" />
            <div>
              <p className="text-sm font-semibold">Reports could not be loaded</p>
              <p className="mt-1 text-sm text-muted-foreground">{error}</p>
            </div>
          </div>
          <Button type="button" variant="outline" onClick={() => setRange({ ...range })} className="w-full sm:w-auto">
            <RefreshCw className="mr-2 size-4" /> Try again
          </Button>
        </div>
      )}

      {!loading && !error && data && (
        <section aria-live="polite" className="min-w-0 space-y-4 sm:space-y-6">
          {activeTab === "overview" && <ReportsOverview data={data} />}
          {activeTab === "sales" && <ReportsSales data={data.sales} />}
          {activeTab === "purchases" && <ReportsPurchases data={data.purchases} />}
          {activeTab === "expenses" && <ReportsExpenses data={data.expenses} />}
          {activeTab === "profit-loss" && <ReportsProfitLoss data={data} />}
          {activeTab === "customers" && <ReportsCustomers data={data.customers} />}
          {activeTab === "loyalty" && <ReportsLoyalty data={data.loyalty} />}
        </section>
      )}
    </main>
  );
}
