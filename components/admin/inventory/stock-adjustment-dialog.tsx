"use client";

import { useState } from "react";
import { PackagePlus } from "lucide-react";

import type { InventoryProduct } from "@/lib/inventory/types";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface StockAdjustmentDialogProps {
  open: boolean;
  product: InventoryProduct | null;
  onOpenChange: (open: boolean) => void;
  onSave?: (data: {
    productId: string;
    action: "ADD" | "REMOVE" | "SET";
    quantity: number;
    reason: string;
    notes: string;
  }) => void;
}

export function StockAdjustmentDialog({
  open,
  product,
  onOpenChange,
  onSave,
}: StockAdjustmentDialogProps) {
  const [action, setAction] = useState<
    "ADD" | "REMOVE" | "SET"
  >("ADD");

  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState("OTHER");
  const [notes, setNotes] = useState("");

  const handleSave = () => {
    if (!product) return;

    const parsedQuantity = Number(quantity);

    if (!Number.isFinite(parsedQuantity) || parsedQuantity < 0) {
      return;
    }

    onSave?.({
      productId: product.id,
      action,
      quantity: parsedQuantity,
      reason,
      notes,
    });

    setQuantity("");
    setNotes("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
            <PackagePlus className="h-5 w-5 text-slate-700" />
          </div>

          <DialogTitle>Adjust Stock</DialogTitle>

          <DialogDescription>
            Update inventory quantity for{" "}
            <span className="font-medium text-slate-700">
              {product?.name || "this product"}
            </span>
            .
          </DialogDescription>
        </DialogHeader>

        {product && (
          <div className="space-y-5 py-2">
            <div className="rounded-lg bg-slate-50 p-3">
              <p className="text-xs text-slate-500">
                Current Stock
              </p>

              <p className="mt-1 text-xl font-semibold text-slate-900">
                {product.stockQuantity}
              </p>
            </div>

            <div className="space-y-2">
              <Label>Adjustment</Label>

              <div className="grid grid-cols-3 gap-2">
                {[
                  ["ADD", "Add"],
                  ["REMOVE", "Remove"],
                  ["SET", "Set"],
                ].map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() =>
                      setAction(
                        value as "ADD" | "REMOVE" | "SET"
                      )
                    }
                    className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
                      action === value
                        ? "border-slate-900 bg-slate-900 text-white"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock-quantity">
                Quantity
              </Label>

              <Input
                id="stock-quantity"
                type="number"
                min="0"
                value={quantity}
                onChange={(event) =>
                  setQuantity(event.target.value)
                }
                placeholder="Enter quantity"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock-reason">
                Reason
              </Label>

              <select
                id="stock-reason"
                value={reason}
                onChange={(event) =>
                  setReason(event.target.value)
                }
                className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none focus:border-slate-400"
              >
                <option value="PURCHASE">Purchase</option>
                <option value="SALE">Sale</option>
                <option value="DAMAGE">Damage</option>
                <option value="RETURN">Return</option>
                <option value="CORRECTION">Correction</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock-notes">
                Notes
              </Label>

              <textarea
                id="stock-notes"
                value={notes}
                onChange={(event) =>
                  setNotes(event.target.value)
                }
                placeholder="Optional notes..."
                rows={3}
                className="w-full resize-none rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
              />
            </div>
          </div>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>

          <Button
            type="button"
            onClick={handleSave}
            disabled={!product || !quantity}
          >
            Save Adjustment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}