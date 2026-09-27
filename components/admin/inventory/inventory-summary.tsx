import {
  AlertTriangle,
  Boxes,
  IndianRupee,
  PackageCheck,
  PackageX,
} from "lucide-react";

import type { InventorySummary } from "@/lib/inventory/types";

interface InventorySummaryProps {
  summary: InventorySummary;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function InventorySummary({
  summary,
}: InventorySummaryProps) {
  const items = [
    {
      title: "Total Products",
      value: summary.totalProducts.toLocaleString("en-IN"),
      icon: Boxes,
    },
    {
      title: "In Stock",
      value: summary.inStock.toLocaleString("en-IN"),
      icon: PackageCheck,
    },
    {
      title: "Low Stock",
      value: summary.lowStock.toLocaleString("en-IN"),
      icon: AlertTriangle,
    },
    {
      title: "Out of Stock",
      value: summary.outOfStock.toLocaleString("en-IN"),
      icon: PackageX,
    },
    {
      title: "Inventory Value",
      value: formatCurrency(summary.inventoryValue),
      icon: IndianRupee,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 xl:grid-cols-5">
      {items.map((item) => {
        const Icon = item.icon;

        return (
          <div
            key={item.title}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-slate-500">
                {item.title}
              </p>

              <div className="rounded-lg bg-slate-50 p-2">
                <Icon className="h-4 w-4 text-slate-600" />
              </div>
            </div>

            <p className="mt-3 text-xl font-semibold tracking-tight text-slate-900">
              {item.value}
            </p>
          </div>
        );
      })}
    </div>
  );
}