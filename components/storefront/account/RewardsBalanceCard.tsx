"use client";

import Link from "next/link";
import {
  ArrowRight,
  Gift,
  LockKeyhole,
  ShoppingBag,
  Sparkles,
  Stamp,
  TrendingUp,
} from "lucide-react";
import type { LoyaltySettings, Reward, RewardAccount } from "@/app/(storefront)/account/page";

type Props = {
  rewardAccount: RewardAccount;
  rewards: Reward[];
  settings: LoyaltySettings;
};

const money = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const number = (value: number) => Number(value || 0).toLocaleString("en-IN");

export default function RewardsBalanceCard({ rewardAccount, rewards, settings }: Props) {
  const balance = Math.max(Number(rewardAccount.points_balance || 0), 0);
  const spendPerStamp = Math.max(Number(settings.spend_per_stamp || 500), 1);
  const eligibleSpend = Math.max(Number(rewardAccount.eligible_spend_balance || 0), 0);
  const progress = Math.min((eligibleSpend / spendPerStamp) * 100, 100);
  const remaining = Math.max(spendPerStamp - eligibleSpend, 0);
  const unlocked = rewards.filter((reward) => balance >= Number(reward.points_required || 0));
  const upcoming = rewards.filter((reward) => balance < Number(reward.points_required || 0)).slice(0, 2);

  return (
    <section className="overflow-hidden rounded-3xl border border-[#d9c47d]/40 bg-white shadow-sm">
      <div className="relative overflow-hidden bg-[#071A35] p-5 text-white sm:p-7">
        <div className="pointer-events-none absolute -right-16 -top-24 size-64 rounded-full border border-[#D4AF37]/20" />
        <div className="pointer-events-none absolute -bottom-24 right-20 size-48 rounded-full bg-[#D4AF37]/10 blur-3xl" />

        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.16em] text-[#D4AF37]">
              <Sparkles size={15} /> VC Rewards Club
            </p>
            <h2 className="mt-2 text-2xl font-bold sm:text-3xl">Your reward balance</h2>
            <p className="mt-1 max-w-md text-sm leading-5 text-white/65">
              Keep shopping and unlock more rewards.
            </p>
          </div>
          <div className="grid size-12 shrink-0 place-items-center rounded-2xl border border-white/10 bg-white/10 text-[#D4AF37]">
            <Gift size={23} />
          </div>
        </div>

        <div className="relative mt-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-white/60">Available stamps</p>
            <p className="mt-1 text-4xl font-extrabold tabular-nums">{number(balance)}</p>
          </div>
          <div className="grid grid-cols-2 gap-3 text-right">
            <div><p className="text-lg font-bold">{number(rewardAccount.lifetime_points_earned)}</p><p className="text-[11px] text-white/55">Earned</p></div>
            <div><p className="text-lg font-bold">{number(rewardAccount.lifetime_points_redeemed)}</p><p className="text-[11px] text-white/55">Redeemed</p></div>
          </div>
        </div>
      </div>

      <div className="grid gap-5 p-5 sm:p-6">
        <div>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="flex items-center gap-2 text-sm font-bold text-[#071A35]"><Stamp size={16} className="text-[#9b7b08]" /> Progress to your next stamp</p>
              <p className="mt-1 text-xs text-slate-500">₹{number(eligibleSpend)} of ₹{number(spendPerStamp)} eligible spend carried forward</p>
            </div>
            <span className="rounded-full bg-[#faf5df] px-2.5 py-1 text-xs font-bold text-[#80640d]">{Math.floor(progress)}%</span>
          </div>
          <div
            className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-100"
            role="progressbar"
            aria-label="Progress towards next reward stamp"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.floor(progress)}
          >
            <div className="h-full rounded-full bg-[#D4AF37] transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
          <p className="mt-2 text-xs leading-5 text-slate-500">
            {remaining > 0 ? `Shop ${money(remaining)} more in eligible paid orders to earn your next stamp.` : "Your next stamp threshold has been reached."}
            {" "}Only successful paid online orders count. The stamp is calculated on the final order total after discounts.
          </p>
        </div>

        <div className="border-t border-slate-100 pt-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-[#071A35]">Rewards you can unlock</h3>
              <p className="mt-0.5 text-xs text-slate-500">Based on your current stamp balance</p>
            </div>
            <span className="text-xs font-semibold text-slate-400">{rewards.length} active</span>
          </div>

          {rewards.length === 0 ? (
            <div className="rounded-2xl bg-[#faf9f6] p-4 text-sm text-slate-500">
              New rewards will appear here when they are activated.
            </div>
          ) : (
            <div className="space-y-2">
              {unlocked.slice(0, 2).map((reward) => (
                <div key={reward.id} className="flex items-center gap-3 rounded-2xl border border-[#eadfbf] bg-[#fffdf6] p-3">
                  <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[#071A35] text-[#D4AF37]"><Gift size={17} /></span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-[#071A35]">{reward.name}</p>
                    <p className="text-xs text-[#8b6d05]">{reward.reward_type === "PERCENTAGE_DISCOUNT" ? `${reward.reward_value}% off` : `${money(reward.reward_value)} off`} · {number(reward.points_required)} stamps</p>
                  </div>
                  <span className="shrink-0 text-[10px] font-bold uppercase text-[#8b6d05]">Unlocked</span>
                </div>
              ))}

              {upcoming.map((reward) => {
                const needed = Math.max(Number(reward.points_required || 0) - balance, 0);
                return (
                  <div key={reward.id} className="flex items-center gap-3 rounded-2xl border border-slate-100 p-3">
                    <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-500"><LockKeyhole size={16} /></span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-[#071A35]">{reward.name}</p>
                      <p className="text-xs text-slate-500">{reward.reward_type === "PERCENTAGE_DISCOUNT" ? `${reward.reward_value}% off` : `${money(reward.reward_value)} off`}</p>
                    </div>
                    <span className="shrink-0 text-[10px] font-semibold text-slate-500">{number(needed)} to go</span>
                  </div>
                );
              })}

              {unlocked.length === 0 && upcoming.length === 0 && (
                <p className="rounded-2xl bg-[#faf9f6] p-4 text-xs text-slate-500">Keep shopping to build your balance. Your active reward options will show here.</p>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <TrendingUp size={15} className="text-[#9b7b08]" />
            <span>{unlocked.length} reward {unlocked.length === 1 ? "threshold" : "thresholds"} reached</span>
          </div>
          <Link href="/products" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#D4AF37] px-5 py-3 text-sm font-bold text-[#071A35] transition hover:bg-[#e8c95e]">
            <ShoppingBag size={16} /> Shop & earn more <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </section>
  );
}
