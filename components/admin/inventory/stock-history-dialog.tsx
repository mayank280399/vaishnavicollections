"use client";

import { History } from "lucide-react";

import type { InventoryProduct } from "@/lib/inventory/types";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface StockHistoryItem {
  id: string;
  date: string;
  action: "ADD" | "REMOVE" | "SET";
  quantity: number;
  reason: string;
  notes: string | null;
}

interface StockHistoryDialogProps {
  open: boolean;
  product: InventoryProduct | null;
  history: StockHistoryItem[];
  onOpenChange: (open: boolean) => void;
}

export function StockHistoryDialog({
  open,
  product,
  history,
  onOpenChange,
}: StockHistoryDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
            <History className="h-5 w-5 text-slate-700" />
          </div>

          <DialogTitle>Stock History</DialogTitle>

          <DialogDescription>
            Inventory movement for{" "}
            <span className="font-medium text-slate-700">
              {product?.name || "this product"}
            </span>
            .
          </DialogDescription>
        </DialogHeader>

        {history.length === 0 ? (
          <div className="py-10 text-center text-sm text-slate-500">
            No stock history available.
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-slate-200">
            <div className="grid grid-cols-4 border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-medium text-slate-500">
              <span>Date</span>
              <span>Action</span>
              <span>Quantity</span>
              <span>Reason</span>
            </div>

            <div className="divide-y divide-slate-100">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="grid grid-cols-4 px-4 py-3 text-sm"
                >
                  <span className="text-slate-600">
                    {item.date}
                  </span>

                  <span className="font-medium text-slate-900">
                    {item.action}
                  </span>

                  <span
                    className={
                      item.action === "REMOVE"
                        ? "font-medium text-red-600"
                        : "font-medium text-emerald-600"
                    }
                  >
                    {item.action === "REMOVE"
                      ? `-${item.quantity}`
                      : `+${item.quantity}`}
                  </span>

                  <span className="text-slate-600">
                    {item.reason}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}