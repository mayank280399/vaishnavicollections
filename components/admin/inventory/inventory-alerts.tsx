"use client";

import {
  AlertTriangle,
  ChevronRight,
  PackageX,
} from "lucide-react";

import { InventoryAlert } from "@/lib/inventory/types";

interface InventoryAlertsProps {
  alerts: InventoryAlert[];
  onViewLowStock?: () => void;
  onViewOutOfStock?: () => void;
}

export function InventoryAlerts({
  alerts,
  onViewLowStock,
  onViewOutOfStock,
}: InventoryAlertsProps) {
  const lowStock =
    alerts.find((alert) => alert.type === "LOW_STOCK")?.count ?? 0;

  const outOfStock =
    alerts.find(
      (alert) => alert.type === "OUT_OF_STOCK"
    )?.count ?? 0;

  if (lowStock === 0 && outOfStock === 0) {
    return null;
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-4 py-3">
        <h2 className="text-sm font-semibold text-slate-900">
          Stock Alerts
        </h2>
      </div>

      <div className="divide-y divide-slate-100">
        {lowStock > 0 && (
          <button
            type="button"
            onClick={onViewLowStock}
            className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-slate-50"
          >
            <div className="rounded-lg bg-amber-50 p-2">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-slate-900">
                {lowStock}{" "}
                {lowStock === 1 ? "product is" : "products are"}{" "}
                running low
              </p>

              <p className="text-xs text-slate-500">
                Review products that may need replenishment.
              </p>
            </div>

            <ChevronRight className="h-4 w-4 text-slate-400" />
          </button>
        )}

        {outOfStock > 0 && (
          <button
            type="button"
            onClick={onViewOutOfStock}
            className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-slate-50"
          >
            <div className="rounded-lg bg-red-50 p-2">
              <PackageX className="h-4 w-4 text-red-600" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-slate-900">
                {outOfStock}{" "}
                {outOfStock === 1 ? "product is" : "products are"}{" "}
                out of stock
              </p>

              <p className="text-xs text-slate-500">
                These products currently have no available stock.
              </p>
            </div>

            <ChevronRight className="h-4 w-4 text-slate-400" />
          </button>
        )}
      </div>
    </div>
  );
}