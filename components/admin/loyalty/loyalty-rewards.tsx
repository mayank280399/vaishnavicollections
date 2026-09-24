"use client";

import { Gift, Power } from "lucide-react";
import { Button } from "@/components/ui/button";

import type { LoyaltyReward } from "@/lib/loyalty/loyalty-types";

type Props = {
  rewards: LoyaltyReward[];
  onToggle: (
    rewardId: string,
    active: boolean
  ) => Promise<void>;
};

export function LoyaltyRewards({
  rewards,
  onToggle,
}: Props) {
  if (!rewards.length) {
    return (
      <div className="rounded-2xl border border-dashed p-8 text-center">
        <Gift className="mx-auto h-8 w-8 text-muted-foreground" />

        <h3 className="mt-3 font-semibold">
          No rewards yet
        </h3>

        <p className="mt-1 text-sm text-muted-foreground">
          Create your first loyalty reward.
        </p>
      </div>
    );
  }

  return (
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
              {reward.active ? "Active" : "Inactive"}
            </span>
          </div>

          <h3 className="mt-4 font-semibold">
            {reward.name}
          </h3>

          <p className="mt-1 text-sm text-muted-foreground">
            {reward.points_required} stamps required
          </p>

          <p className="mt-3 text-2xl font-bold">
            ₹{Number(reward.reward_value).toLocaleString("en-IN")}
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            Fixed discount
          </p>

          <Button
            variant="outline"
            size="sm"
            className="mt-4 w-full"
            onClick={() =>
              onToggle(reward.id, !reward.active)
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
  );
}