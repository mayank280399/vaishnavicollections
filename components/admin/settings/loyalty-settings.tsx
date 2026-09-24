"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { SettingsSectionCard } from "./settings-section-card";

export function LoyaltySettings() {
  const [enabled, setEnabled] = useState(true);
  const [stampAmount, setStampAmount] = useState("100");
  const [maxStamps, setMaxStamps] = useState("10");
  const [minimumPurchase, setMinimumPurchase] =
    useState("500");

  const [instagramReward, setInstagramReward] =
    useState(true);

  const [googleReviewReward, setGoogleReviewReward] =
    useState(true);

  const handleSave = () => {
    console.log({
      enabled,
      stampAmount,
      maxStamps,
      minimumPurchase,
      instagramReward,
      googleReviewReward,
    });
  };

  return (
    <div className="space-y-4">
      <SettingsSectionCard
        title="Loyalty Program"
        description="Control the overall customer loyalty program."
      >
        <div className="space-y-4">
          <label className="flex cursor-pointer items-center justify-between rounded-lg border p-4">
            <div>
              <p className="text-sm font-medium">
                Enable Loyalty Program
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                Allow customers to earn and redeem rewards.
              </p>
            </div>

            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) =>
                setEnabled(e.target.checked)
              }
              className="h-4 w-4"
            />
          </label>
        </div>
      </SettingsSectionCard>

      <SettingsSectionCard
        title="Purchase Rewards"
        description="Basic rules for earning loyalty stamps."
      >
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="stamp-amount">
              Purchase Amount
            </Label>

            <Input
              id="stamp-amount"
              type="number"
              min="1"
              value={stampAmount}
              onChange={(e) =>
                setStampAmount(e.target.value)
              }
            />

            <p className="text-xs text-muted-foreground">
              ₹ spent per stamp.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="max-stamps">
              Maximum Stamps
            </Label>

            <Input
              id="max-stamps"
              type="number"
              min="1"
              value={maxStamps}
              onChange={(e) =>
                setMaxStamps(e.target.value)
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="minimum-purchase">
              Minimum Purchase
            </Label>

            <Input
              id="minimum-purchase"
              type="number"
              min="0"
              value={minimumPurchase}
              onChange={(e) =>
                setMinimumPurchase(e.target.value)
              }
            />
          </div>
        </div>
      </SettingsSectionCard>

      <SettingsSectionCard
        title="Engagement Rewards"
        description="Optional rewards for customer engagement."
      >
        <div className="space-y-3">
          <RewardToggle
            title="Instagram Engagement Reward"
            description="Allow Instagram-related actions to qualify for rewards."
            checked={instagramReward}
            onChange={setInstagramReward}
          />

          <RewardToggle
            title="Google Review Reward"
            description="Allow eligible Google review actions to qualify for rewards."
            checked={googleReviewReward}
            onChange={setGoogleReviewReward}
          />
        </div>
      </SettingsSectionCard>

      <div className="flex justify-end">
        <Button onClick={handleSave}>
          Save Loyalty Settings
        </Button>
      </div>
    </div>
  );
}

function RewardToggle({
  title,
  description,
  checked,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 rounded-lg border p-4">
      <div>
        <p className="text-sm font-medium">
          {title}
        </p>

        <p className="mt-1 text-xs text-muted-foreground">
          {description}
        </p>
      </div>

      <input
        type="checkbox"
        checked={checked}
        onChange={(e) =>
          onChange(e.target.checked)
        }
        className="h-4 w-4"
      />
    </label>
  );
}