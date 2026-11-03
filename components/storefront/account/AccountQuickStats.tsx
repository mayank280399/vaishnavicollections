"use client";

import { Gift, IndianRupee, ShoppingBag, Sparkles } from "lucide-react";
import type { Customer, Reward, RewardAccount } from "@/app/(storefront)/account/page";

type Props = {
  customer: Customer;
  rewardAccount: RewardAccount;
  rewards: Reward[];
};

export default function AccountQuickStats({ customer, rewardAccount, rewards }: Props) {
  const unlocked = rewards.filter((reward) => Number(reward.points_required || 0) <= Number(rewardAccount.points_balance || 0)).length;
  const stats = [
    { label: "Orders placed", value: Number(customer.total_orders || 0).toLocaleString("en-IN"), icon: ShoppingBag },
    { label: "Total spent", value: `₹${Number(customer.total_spent || 0).toLocaleString("en-IN")}`, icon: IndianRupee },
    { label: "Lifetime stamps earned", value: Number(rewardAccount.lifetime_points_earned || 0).toLocaleString("en-IN"), icon: Sparkles },
    { label: "Rewards unlocked", value: unlocked.toLocaleString("en-IN"), icon: Gift },
  ];

  return (
    <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div key={stat.label} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#071A35] text-[#D4AF37]"><Icon size={17} /></div>
            <div className="min-w-0"><p className="truncate text-lg font-bold text-[#071A35]">{stat.value}</p><p className="mt-0.5 text-[11px] text-slate-500">{stat.label}</p></div>
          </div>
        );
      })}
    </section>
  );
}
