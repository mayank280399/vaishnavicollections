"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  Minus,
  Plus,
  Stamp,
} from "lucide-react";

import { useState } from "react";

import type { LoyaltyCustomer } from "@/lib/loyalty/loyalty-types";

type Props = {
  customer: LoyaltyCustomer | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdjust: (
    customerId: string,
    amount: number,
    description: string
  ) => Promise<void>;
};

export function LoyaltyCustomerDialog({
  customer,
  open,
  onOpenChange,
  onAdjust,
}: Props) {
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);

  if (!customer) return null;

  async function handleAdjust(value: number) {
    const points = Number(amount);

    if (!Number.isFinite(points) || points <= 0) {
      return;
    }

    setSaving(true);

    try {
      await onAdjust(
        customer.id,
        value * points,
        reason.trim() || "Manual loyalty adjustment"
      );

      setAmount("");
      setReason("");
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100%-1.5rem)] max-w-md rounded-2xl bg-white">
        <DialogHeader>
          <DialogTitle>
            {customer.display_name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-2xl bg-primary/10 p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Stamp className="h-4 w-4" />
              Current Stamps
            </div>

            <p className="mt-1 text-3xl font-bold text-primary">
              {customer.points_balance}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border p-3">
              <p className="text-xs text-muted-foreground">
                Lifetime Earned
              </p>

              <p className="mt-1 text-lg font-semibold">
                {customer.lifetime_points_earned}
              </p>
            </div>

            <div className="rounded-xl border p-3">
              <p className="text-xs text-muted-foreground">
                Redeemed
              </p>

              <p className="mt-1 text-lg font-semibold">
                {customer.lifetime_points_redeemed}
              </p>
            </div>
          </div>

          <div>
            <Label>Stamp amount</Label>

            <Input
              type="number"
              min="1"
              value={amount}
              onChange={(event) =>
                setAmount(event.target.value)
              }
              placeholder="Enter stamps"
              className="mt-1.5"
            />
          </div>

          <div>
            <Label>Reason</Label>

            <Input
              value={reason}
              onChange={(event) =>
                setReason(event.target.value)
              }
              placeholder="e.g. Customer referral"
              className="mt-1.5"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={saving}
              onClick={() => handleAdjust(-1)}
            >
              <Minus className="mr-2 h-4 w-4" />
              Remove
            </Button>

            <Button
              type="button"
              disabled={saving}
              onClick={() => handleAdjust(1)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}