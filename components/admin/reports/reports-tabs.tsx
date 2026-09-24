"use client";

import { ReportTab } from "@/lib/reports/reports-types";



const tabs: {
  id: ReportTab;
  label: string;
}[] = [
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

export function ReportsTabs({
  activeTab,
  onChange,
}: Props) {
  return (
    <div className="overflow-x-auto border-b">
      <div className="flex min-w-max gap-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={[
              "border-b-2 px-3 py-3 text-sm font-medium transition-colors",
              activeTab === tab.id
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            ].join(" ")}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}