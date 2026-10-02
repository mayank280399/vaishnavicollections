"use client";

import React from "react";
import {
  Gift,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { Customer, LoyaltySettings, RewardAccount } from "@/app/(storefront)/account/page";



type Props = {
  customer: Customer;
  rewardAccount: RewardAccount;
  settings: LoyaltySettings;
};

export default function LoyaltyCard({
  rewardAccount,
  settings,
}: Props) {
  const spendPerStamp =
    Number(settings.spend_per_stamp) || 500;

  const eligibleSpend =
    Number(rewardAccount.eligible_spend_balance) || 0;

  const progress = Math.min(
    (eligibleSpend / spendPerStamp) * 100,
    100
  );

  const remaining = Math.max(
    spendPerStamp - eligibleSpend,
    0
  );

  return (
    <section className="overflow-hidden rounded-3xl bg-[#071A35] text-white shadow-sm">
      <div className="p-6 sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles
                size={18}
                className="text-[#D4AF37]"
              />

              <span className="text-xs font-semibold uppercase tracking-[0.15em] text-[#D4AF37]">
                VC Rewards
              </span>
            </div>

            <h2 className="mt-3 text-2xl font-bold">
              Your reward balance
            </h2>

            <p className="mt-1 text-sm text-white/65">
              Keep shopping and unlock more rewards.
            </p>
          </div>

          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10">
            <Gift className="text-[#D4AF37]" size={22} />
          </div>
        </div>

        <div className="mt-7 grid gap-4 sm:grid-cols-3">
          <RewardMetric
            label="Points"
            value={rewardAccount.points_balance}
          />

          <RewardMetric
            label="Lifetime earned"
            value={rewardAccount.lifetime_points_earned}
          />

          <RewardMetric
            label="Redeemed"
            value={rewardAccount.lifetime_points_redeemed}
          />
        </div>

        <div className="mt-7 rounded-2xl bg-white/10 p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold">
                Next reward progress
              </p>

              <p className="mt-1 text-xs text-white/60">
                ₹{spendPerStamp.toLocaleString("en-IN")} eligible
                spend earns the next stamp.
              </p>
            </div>

            <TrendingUp
              size={19}
              className="shrink-0 text-[#D4AF37]"
            />
          </div>

          <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-[#D4AF37] transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>

          <p className="mt-3 text-xs text-white/65">
            {remaining > 0
              ? `₹${remaining.toLocaleString(
                  "en-IN"
                )} more eligible spend to reach the next stamp.`
              : "You have reached the next stamp threshold."}
          </p>
        </div>
      </div>
    </section>
  );
}

function RewardMetric({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl bg-white/10 p-4">
      <p className="text-2xl font-bold">
        {Number(value || 0).toLocaleString("en-IN")}
      </p>

      <p className="mt-1 text-xs text-white/55">
        {label}
      </p>
    </div>
  );
}