"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { ReportsCustomers } from "./reports-customers";
import {ReportsExpenses} from "./reports-expenses";
import {ReportsHeader} from "./reports-header";
import {ReportsLoyalty} from "./reports-loyalty";
import {ReportsOverview} from "./reports-overview";
import { ReportsProfitLoss} from "./reports-profit-loss";
import { ReportsPurchases} from "./reports-purchases";
import {ReportsSales} from "./reports-sales";
import {  ReportsTabs} from "./reports-tabs";
import { DateRange, ReportsData, ReportTab } from "@/lib/reports/reports-types";
import { getReportsData } from "@/lib/reports/reports-queries";



function getInitialRange(): DateRange {
  const now = new Date();

  const from = new Date(
    now.getFullYear(),
    now.getMonth(),
    1,
  );

  return {
    from: from.toISOString().split("T")[0],
    to: now.toISOString().split("T")[0],
  };
}

export function ReportsPage() {
  const [range, setRange] =
    useState<DateRange>(getInitialRange);

  const [activeTab, setActiveTab] =
    useState<ReportTab>("overview");

  const [data, setData] =
    useState<ReportsData | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);

        const result = await getReportsData(range);

        if (!cancelled) {
          setData(result);
        }
      } catch (err) {
        console.error(err);

        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load reports.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [range]);

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <ReportsHeader
        from={range.from}
        to={range.to}
        onRangeChange={(from, to) =>
          setRange({ from, to })
        }
      />

      <ReportsTabs
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {loading && (
        <div className="flex min-h-[300px] items-center justify-center">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading reports...
          </div>
        </div>
      )}

      {!loading && error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {!loading && !error && data && (
        <>
          {activeTab === "overview" && (
            <ReportsOverview data={data} />
          )}

          {activeTab === "sales" && (
            <ReportsSales data={data.sales} />
          )}

          {activeTab === "purchases" && (
            <ReportsPurchases data={data.purchases} />
          )}

          {activeTab === "expenses" && (
            <ReportsExpenses data={data.expenses} />
          )}

          {activeTab === "profit-loss" && (
            <ReportsProfitLoss data={data} />
          )}

          {activeTab === "customers" && (
            <ReportsCustomers data={data.customers} />
          )}

          {activeTab === "loyalty" && (
            <ReportsLoyalty data={data.loyalty} />
          )}
        </>
      )}
    </div>
  );
}