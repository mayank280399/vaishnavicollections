"use client";

import { useState } from "react";
import { Save, Stamp } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import type { LoyaltySettings as LoyaltySettingsType } from "@/lib/loyalty/loyalty-types";

type Props = {
  settings: LoyaltySettingsType;
  onSave: (
    values: Partial<LoyaltySettingsType>
  ) => Promise<void>;
};

export function LoyaltySettings({
  settings,
  onSave,
}: Props) {
  const [spendPerStamp, setSpendPerStamp] =
    useState(String(settings.spend_per_stamp));

  const [expiryDays, setExpiryDays] = useState(
    String(settings.reward_expiry_days)
  );

  const [minimumPoints, setMinimumPoints] =
    useState(
      String(settings.minimum_redemption_points)
    );

  const [maximumPercentage, setMaximumPercentage] =
    useState(
      String(settings.maximum_redemption_percentage)
    );

  const [saving, setSaving] = useState(false);

  async function handleSave() {
    const spend = Number(spendPerStamp);
    const expiry = Number(expiryDays);
    const minimum = Number(minimumPoints);
    const maximum = Number(maximumPercentage);

    if (
      !Number.isFinite(spend) ||
      spend <= 0 ||
      !Number.isFinite(expiry) ||
      expiry < 0 ||
      !Number.isFinite(minimum) ||
      minimum < 0 ||
      !Number.isFinite(maximum) ||
      maximum < 0 ||
      maximum > 100
    ) {
      return;
    }

    setSaving(true);

    try {
      await onSave({
        spend_per_stamp: spend,
        reward_expiry_days: expiry,
        minimum_redemption_points: minimum,
        maximum_redemption_percentage: maximum,
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border bg-card p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Stamp className="h-5 w-5" />
          </div>

          <div>
            <h3 className="font-semibold">
              Stamp Rules
            </h3>

            <p className="mt-1 text-sm text-muted-foreground">
              Configure how customers earn loyalty stamps.
            </p>
          </div>
        </div>

        <div className="mt-5">
          <Label>Amount spent for 1 stamp</Label>

          <div className="relative mt-1.5">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
              ₹
            </span>

            <Input
              type="number"
              min="1"
              value={spendPerStamp}
              onChange={(event) =>
                setSpendPerStamp(event.target.value)
              }
              className="pl-8"
            />
          </div>

          <p className="mt-1.5 text-xs text-muted-foreground">
            Current rule: ₹
            {Number(spendPerStamp || 0).toLocaleString(
              "en-IN"
            )}{" "}
            spent = 1 stamp
          </p>
        </div>
      </div>

      <div className="rounded-2xl border bg-card p-4">
        <h3 className="font-semibold">
          Redemption Rules
        </h3>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Minimum points</Label>

            <Input
              type="number"
              min="0"
              value={minimumPoints}
              onChange={(event) =>
                setMinimumPoints(event.target.value)
              }
              className="mt-1.5"
            />
          </div>

          <div>
            <Label>Maximum discount %</Label>

            <Input
              type="number"
              min="0"
              max="100"
              value={maximumPercentage}
              onChange={(event) =>
                setMaximumPercentage(event.target.value)
              }
              className="mt-1.5"
            />
          </div>

          <div>
            <Label>Reward expiry days</Label>

            <Input
              type="number"
              min="0"
              value={expiryDays}
              onChange={(event) =>
                setExpiryDays(event.target.value)
              }
              className="mt-1.5"
            />
          </div>
        </div>
      </div>

      <Button
        onClick={handleSave}
        disabled={saving}
        className="w-full sm:w-auto"
      >
        <Save className="mr-2 h-4 w-4" />

        {saving ? "Saving..." : "Save Settings"}
      </Button>
    </div>
  );
}