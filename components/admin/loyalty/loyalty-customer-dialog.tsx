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
  spendPerStamp?: number;
};

export function LoyaltyCustomerDialog({
  customer,
  open,
  onOpenChange,
  onAdjust,
  spendPerStamp = 500,
}: Props) {
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);

  if (!customer) {
    return null;
  }

  const customerId = customer.id;

  const carry = Number(
    customer.eligible_spend_balance ?? 0
  );

  const progress =
    spendPerStamp > 0
      ? Math.min(
          100,
          Math.round(
            (carry / spendPerStamp) * 100
          )
        )
      : 0;

  const remaining = Math.max(
    0,
    spendPerStamp - carry
  );

  async function handleAdjust(value: number) {
    const points = Number(amount);

    if (
      !Number.isInteger(points) ||
      points <= 0
    ) {
      return;
    }

    setSaving(true);

    try {
      await onAdjust(
        customerId,
        value * points,
        reason.trim() ||
          "Manual loyalty adjustment"
      );

      setAmount("");
      setReason("");
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="w-[calc(100%-1.5rem)] max-w-md rounded-2xl bg-white">
        <DialogHeader>
          <DialogTitle>
            {customer.display_name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current stamps */}
          <div className="rounded-2xl bg-primary/10 p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Stamp className="h-4 w-4" />
              Current Stamps
            </div>

            <p className="mt-1 text-3xl font-bold text-primary">
              {customer.points_balance}
            </p>
          </div>

          {/* Lifetime stats */}
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

          {/* Next stamp */}
          <div className="rounded-2xl border bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold">
                  Progress to next stamp
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  ₹{carry.toLocaleString("en-IN")} of ₹
                  {spendPerStamp.toLocaleString(
                    "en-IN"
                  )}
                </p>
              </div>

              <span className="text-sm font-bold text-primary">
                {progress}%
              </span>
            </div>

            <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{
                  width: `${progress}%`,
                }}
              />
            </div>

            <p className="mt-2 text-xs text-muted-foreground">
              ₹{remaining.toLocaleString("en-IN")} more
              eligible spend for the next stamp.
            </p>
          </div>

          {/* Adjustment */}
          <div>
            <Label>Stamp amount</Label>

            <Input
              type="number"
              min="1"
              step="1"
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