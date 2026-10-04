"use client";

import {
  Gift,
  Power,
  Plus,
} from "lucide-react";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import type { LoyaltyReward } from "@/lib/loyalty/loyalty-types";

type Props = {
  rewards: LoyaltyReward[];
  onToggle: (
    rewardId: string,
    active: boolean
  ) => Promise<void>;
  onCreate: (values: {
    name: string;
    points_required: number;
    reward_value: number;
    minimum_purchase: number;
    expires_after_days: number | null;
  }) => Promise<void>;
};

export function LoyaltyRewards({
  rewards,
  onToggle,
  onCreate,
}: Props) {
  const [showCreate, setShowCreate] =
    useState(false);

  const [name, setName] = useState("");
  const [points, setPoints] = useState("");
  const [discount, setDiscount] = useState("");
  const [minimumPurchase, setMinimumPurchase] =
    useState("");

  const [expiry, setExpiry] = useState("180");
  const [saving, setSaving] = useState(false);

  function resetForm() {
    setName("");
    setPoints("");
    setDiscount("");
    setMinimumPurchase("");
    setExpiry("180");
  }

  async function handleCreate() {
    const pointsRequired = Number(points);
    const rewardValue = Number(discount);
    const minimum = Number(minimumPurchase);
    const expiryValue =
      expiry.trim() === ""
        ? null
        : Number(expiry);

    if (
      !name.trim() ||
      !Number.isInteger(pointsRequired) ||
      pointsRequired <= 0 ||
      !Number.isFinite(rewardValue) ||
      rewardValue <= 0 ||
      !Number.isFinite(minimum) ||
      minimum < 0 ||
      (expiryValue !== null &&
        (!Number.isFinite(expiryValue) ||
          expiryValue < 0))
    ) {
      return;
    }

    setSaving(true);

    try {
      await onCreate({
        name: name.trim(),
        points_required: pointsRequired,
        reward_value: rewardValue,
        minimum_purchase: minimum,
        expires_after_days: expiryValue,
      });

      resetForm();
      setShowCreate(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Create reward */}
      <div className="flex justify-end">
        <Button
          type="button"
          onClick={() =>
            setShowCreate((current) => !current)
          }
          className="rounded-xl"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Reward
        </Button>
      </div>

      {showCreate ? (
        <div className="rounded-2xl border bg-card p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Gift className="h-5 w-5" />
            </div>

            <div>
              <h3 className="font-semibold">
                Create Loyalty Reward
              </h3>

              <p className="mt-1 text-sm text-muted-foreground">
                Create a fixed discount customers can
                redeem using stamps.
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label>Reward name</Label>

              <Input
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
                placeholder="e.g. ₹50 Off"
                className="mt-1.5"
              />
            </div>

            <div>
              <Label>Stamps required</Label>

              <Input
                type="number"
                min="1"
                step="1"
                value={points}
                onChange={(event) =>
                  setPoints(event.target.value)
                }
                placeholder="e.g. 5"
                className="mt-1.5"
              />
            </div>

            <div>
              <Label>Discount amount</Label>

              <div className="relative mt-1.5">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  ₹
                </span>

                <Input
                  type="number"
                  min="1"
                  value={discount}
                  onChange={(event) =>
                    setDiscount(event.target.value)
                  }
                  placeholder="50"
                  className="pl-8"
                />
              </div>
            </div>

            <div>
              <Label>Minimum purchase</Label>

              <div className="relative mt-1.5">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  ₹
                </span>

                <Input
                  type="number"
                  min="0"
                  value={minimumPurchase}
                  onChange={(event) =>
                    setMinimumPurchase(
                      event.target.value
                    )
                  }
                  placeholder="e.g. 200"
                  className="pl-8"
                />
              </div>
            </div>

            <div>
              <Label>Reward expiry days</Label>

              <Input
                type="number"
                min="0"
                value={expiry}
                onChange={(event) =>
                  setExpiry(event.target.value)
                }
                placeholder="180"
                className="mt-1.5"
              />

              <p className="mt-1 text-xs text-muted-foreground">
                Leave empty for no reward expiry.
              </p>
            </div>
          </div>

          <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                resetForm();
                setShowCreate(false);
              }}
              disabled={saving}
            >
              Cancel
            </Button>

            <Button
              type="button"
              onClick={handleCreate}
              disabled={saving}
            >
              {saving
                ? "Creating..."
                : "Create Reward"}
            </Button>
          </div>
        </div>
      ) : null}

      {/* Existing rewards */}
      {!rewards.length ? (
        <div className="rounded-2xl border border-dashed p-8 text-center">
          <Gift className="mx-auto h-8 w-8 text-muted-foreground" />

          <h3 className="mt-3 font-semibold">
            No rewards yet
          </h3>

          <p className="mt-1 text-sm text-muted-foreground">
            Create your first loyalty reward.
          </p>
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {rewards.map((reward) => (
            <div
              key={reward.id}
              className="rounded-2xl border bg-card p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Gift className="h-5 w-5" />
                </div>

                <span
                  className={[
                    "rounded-full px-2.5 py-1 text-[11px] font-medium",
                    reward.active
                      ? "bg-emerald-500/10 text-emerald-600"
                      : "bg-muted text-muted-foreground",
                  ].join(" ")}
                >
                  {reward.active
                    ? "Active"
                    : "Inactive"}
                </span>
              </div>

              <h3 className="mt-4 font-semibold">
                {reward.name}
              </h3>

              <p className="mt-1 text-sm text-muted-foreground">
                {reward.points_required} stamps required
              </p>

              <p className="mt-3 text-2xl font-bold">
                ₹
                {Number(
                  reward.reward_value
                ).toLocaleString("en-IN")}
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                Fixed discount
              </p>

              <div className="mt-3 space-y-1 text-xs text-muted-foreground">
                <p>
                  Minimum purchase: ₹
                  {Number(
                    reward.minimum_purchase
                  ).toLocaleString("en-IN")}
                </p>

                <p>
                  Reward expiry:{" "}
                  {reward.expires_after_days === null
                    ? "No expiry"
                    : `${reward.expires_after_days} days`}
                </p>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="mt-4 w-full"
                onClick={() =>
                  onToggle(
                    reward.id,
                    !reward.active
                  )
                }
              >
                <Power className="mr-2 h-4 w-4" />

                {reward.active
                  ? "Deactivate"
                  : "Activate"}
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}