"use client";

import React from "react";
import {
  Gift,
  IndianRupee,
  ShoppingBag,
  Sparkles,
} from "lucide-react";

import type {
  Customer,
  Reward,
  RewardAccount,
} from "@/app/account/page";

type Props = {
  customer: Customer;
  rewardAccount: RewardAccount;
  rewards: Reward[];
};

export default function AccountQuickStats({
  customer,
  rewardAccount,
  rewards,
}: Props) {
  const stats = [
    {
      label: "Orders",
      value: customer.total_orders ?? 0,
      icon: ShoppingBag,
    },
    {
      label: "Total spent",
      value: `₹${Number(customer.total_spent ?? 0).toLocaleString(
        "en-IN"
      )}`,
      icon: IndianRupee,
    },
    {
      label: "Reward points",
      value: rewardAccount.points_balance ?? 0,
      icon: Sparkles,
    },
    {
      label: "Rewards available",
      value: rewards.filter(
        (reward) =>
          reward.points_required <=
          rewardAccount.points_balance
      ).length,
      icon: Gift,
    },
  ];

  return (
    <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <div
            key={stat.label}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#071A35] text-[#D4AF37]">
                <Icon size={17} />
              </div>
            </div>

            <p className="mt-4 text-xl font-bold text-[#071A35]">
              {stat.value}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              {stat.label}
            </p>
          </div>
        );
      })}
    </section>
  );
}