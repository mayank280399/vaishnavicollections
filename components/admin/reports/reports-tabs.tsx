"use client";

import { ReportTab } from "@/lib/reports/reports-types";

const tabs: { id: ReportTab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "sales", label: "Sales" },
  { id: "purchases", label: "Purchases" },
  { id: "expenses", label: "Expenses" },
  { id: "profit-loss", label: "Profit & Loss" },
  { id: "customers", label: "Customers" },
  { id: "loyalty", label: "Loyalty" },
];

type Props = {
  activeTab: ReportTab;
  onChange: (tab: ReportTab) => void;
};

export function ReportsTabs({ activeTab, onChange }: Props) {
  return (
    <div className="-mx-3 overflow-x-auto px-3 pb-1 sm:mx-0 sm:px-0">
      <div
        role="tablist"
        aria-label="Report sections"
        className="flex w-max min-w-full gap-1 rounded-xl border border-border bg-muted/50 p-1 sm:w-fit sm:min-w-0"
      >
        {tabs.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              id={`report-tab-${tab.id}`}
              aria-selected={active}
              onClick={() => onChange(tab.id)}
              className={[
                "min-h-10 shrink-0 rounded-lg px-3 text-sm font-medium transition-all sm:px-4",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2",
                active
                  ? "bg-brand-navy text-white shadow-sm"
                  : "text-muted-foreground hover:bg-background hover:text-foreground",
              ].join(" ")}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
