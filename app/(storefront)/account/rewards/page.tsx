"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowDownLeft,
  ArrowLeft,
  ArrowUpRight,
  Gift,
  History,
  RefreshCw,
  ShoppingBag,
  Sparkles,
  Stamp,
  TrendingUp,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Customer = {
  id: string;
  display_name: string | null;
  email: string | null;
  total_orders: number | null;
  total_spent: number | null;
};

type RewardAccount = {
  points_balance: number;
  lifetime_points_earned: number;
  lifetime_points_redeemed: number;
  eligible_spend_balance: number;
};

type Reward = {
  id: string;
  name: string;
  points_required: number;
  reward_type: string;
  reward_value: number;
  minimum_purchase: number | null;
  maximum_discount: number | null;
  expires_after_days: number | null;
};

type Transaction = {
  id: string;
  type: string;
  amount: number;
  description: string | null;
  created_at: string;
};

type LoyaltySettings = {
  spend_per_stamp: number;
  reward_expiry_days: number;
  minimum_redemption_points: number;
  maximum_redemption_percentage: number;
};

type RewardsData = {
  customer: Customer;
  account: RewardAccount;
  rewards: Reward[];
  transactions: Transaction[];
  settings: LoyaltySettings;
};

const EMPTY_ACCOUNT: RewardAccount = {
  points_balance: 0,
  lifetime_points_earned: 0,
  lifetime_points_redeemed: 0,
  eligible_spend_balance: 0,
};

const money = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const number = (value: number) =>
  Number(value || 0).toLocaleString("en-IN");

function rewardValue(reward: Reward) {
  return reward.reward_type === "PERCENTAGE_DISCOUNT"
    ? `${reward.reward_value}% off`
    : `${money(reward.reward_value)} off`;
}

export default function AccountRewardsPage() {
  const router = useRouter();
  const supabase = createClient();
  const [data, setData] = useState<RewardsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadRewards = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      if (!authData.user) {
        router.replace("/login?redirect=/account/rewards");
        return;
      }

      const userId = authData.user.id;
      const { data: customer, error: customerError } = await supabase
        .from("customers")
        .select("id,display_name,email,total_orders,total_spent")
        .eq("profile_id", userId)
        .maybeSingle();

      if (customerError) throw customerError;
      if (!customer) {
        throw new Error("Your customer profile is not linked yet. Please contact Vaishnavi Collections for help.");
      }

      const [
        accountResult,
        rewardsResult,
        transactionsResult,
        settingsResult,
      ] = await Promise.all([
        supabase
          .from("reward_accounts")
          .select("points_balance,lifetime_points_earned,lifetime_points_redeemed,eligible_spend_balance")
          .eq("customer_id", customer.id)
          .maybeSingle(),
        supabase
          .from("rewards")
          .select("id,name,points_required,reward_type,reward_value,minimum_purchase,maximum_discount,expires_after_days")
          .eq("active", true)
          .order("points_required", { ascending: true }),
        supabase
          .from("reward_transactions")
          .select("id,type,amount,description,created_at")
          .eq("customer_id", customer.id)
          .order("created_at", { ascending: false })
          .limit(20),
        supabase
          .from("loyalty_settings")
          .select("spend_per_stamp,reward_expiry_days,minimum_redemption_points,maximum_redemption_percentage")
          .limit(1)
          .maybeSingle(),
      ]);

      if (accountResult.error) throw accountResult.error;
      if (rewardsResult.error) throw rewardsResult.error;
      if (transactionsResult.error) throw transactionsResult.error;
      if (settingsResult.error) throw settingsResult.error;

      const settings = settingsResult.data;
      setData({
        customer,
        account: accountResult.data ?? EMPTY_ACCOUNT,
        rewards: (rewardsResult.data ?? []).map((reward) => ({
          ...reward,
          points_required: Number(reward.points_required || 0),
          reward_value: Number(reward.reward_value || 0),
          minimum_purchase: reward.minimum_purchase == null ? null : Number(reward.minimum_purchase),
          maximum_discount: reward.maximum_discount == null ? null : Number(reward.maximum_discount),
          expires_after_days: reward.expires_after_days == null ? null : Number(reward.expires_after_days),
        })),
        transactions: (transactionsResult.data ?? []).map((item) => ({
          ...item,
          amount: Number(item.amount || 0),
        })),
        settings: {
          spend_per_stamp: Number(settings?.spend_per_stamp || 500),
          reward_expiry_days: Number(settings?.reward_expiry_days || 180),
          minimum_redemption_points: Number(settings?.minimum_redemption_points || 50),
          maximum_redemption_percentage: Number(settings?.maximum_redemption_percentage || 20),
        },
      });
    } catch (err) {
      console.error("ACCOUNT REWARDS LOAD FAILED:", err);
      setError(err instanceof Error ? err.message : "We couldn't load your rewards right now.");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [router, supabase]);

  useEffect(() => {
    void loadRewards();
  }, [loadRewards]);

  if (loading) {
    return (
      <main className="min-h-[70vh] bg-[#faf9f6] px-4 py-12">
        <div className="mx-auto max-w-6xl animate-pulse space-y-5">
          <div className="h-40 rounded-3xl bg-slate-200" />
          <div className="grid gap-4 sm:grid-cols-3"><div className="h-28 rounded-2xl bg-slate-200" /><div className="h-28 rounded-2xl bg-slate-200" /><div className="h-28 rounded-2xl bg-slate-200" /></div>
          <div className="h-64 rounded-3xl bg-slate-200" />
        </div>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="min-h-[70vh] bg-[#faf9f6] px-4 py-16">
        <section className="mx-auto max-w-lg rounded-3xl border bg-white p-8 text-center shadow-sm">
          <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-[#071A35] text-[#D4AF37]"><Gift size={24} /></div>
          <h1 className="mt-4 text-xl font-bold text-[#071A35]">Your rewards are waiting</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">{error || "We couldn't load your rewards."}</p>
          <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
            <button onClick={() => void loadRewards()} className="rounded-xl bg-[#071A35] px-5 py-3 text-sm font-semibold text-white">Try again</button>
            <Link href="/account" className="rounded-xl border px-5 py-3 text-sm font-semibold text-[#071A35]">Back to account</Link>
          </div>
        </section>
      </main>
    );
  }

  const { account, rewards, transactions, settings, customer } = data;
  const spendPerStamp = Math.max(settings.spend_per_stamp, 1);
  const eligibleSpend = Math.max(account.eligible_spend_balance, 0);
  const progress = Math.min((eligibleSpend / spendPerStamp) * 100, 100);
  const remaining = Math.max(spendPerStamp - eligibleSpend, 0);
  const unlockedCount = rewards.filter((reward) => account.points_balance >= reward.points_required).length;

  return (
    <main className="min-h-screen bg-[#faf9f6] pb-16">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <Link href="/account" className="inline-flex items-center gap-2 text-sm font-semibold text-[#071A35] hover:text-[#8b6d05]"><ArrowLeft size={16} /> My account</Link>
          <button onClick={() => void loadRewards()} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:border-[#D4AF37]"><RefreshCw size={14} /> Refresh balance</button>
        </div>

        <section className="relative overflow-hidden rounded-3xl bg-[#071A35] p-6 text-white shadow-lg sm:p-8">
          <div className="pointer-events-none absolute -right-16 -top-24 size-72 rounded-full border border-[#D4AF37]/20" />
          <div className="pointer-events-none absolute -bottom-24 right-28 size-56 rounded-full bg-[#D4AF37]/10 blur-3xl" />
          <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[.18em] text-[#D4AF37]"><Sparkles size={15} /> VC Rewards Club</p>
              <h1 className="mt-3 text-3xl font-bold sm:text-4xl">Your rewards, {customer.display_name?.trim().split(/\s+/)[0] || "in one place"}.</h1>
              <p className="mt-2 max-w-xl text-sm leading-6 text-white/65">Your verified stamps, earning progress and reward options—all connected to your Vaishnavi Collections account.</p>
            </div>
            <Link href="/products" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#D4AF37] px-5 py-3 text-sm font-bold text-[#071A35] hover:bg-[#e8c95e]"><ShoppingBag size={16} /> Shop and earn</Link>
          </div>
          <div className="relative mt-8 grid gap-3 sm:grid-cols-3">
            <Metric label="Available stamps" value={number(account.points_balance)} />
            <Metric label="Lifetime earned" value={number(account.lifetime_points_earned)} />
            <Metric label="Lifetime redeemed" value={number(account.lifetime_points_redeemed)} />
          </div>
        </section>

        <section className="mt-6 grid gap-5 lg:grid-cols-[1.1fr_.9fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[.16em] text-[#9a7a20]">Your next stamp</p>
                <h2 className="mt-2 text-xl font-bold text-[#071A35]">Keep your progress growing</h2>
                <p className="mt-1 text-sm text-slate-500">Every {money(spendPerStamp)} in eligible paid purchases earns 1 stamp.</p>
              </div>
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#071A35] text-[#D4AF37]"><Stamp size={21} /></span>
            </div>
            <div className="mt-6 flex items-end justify-between gap-3">
              <p className="text-3xl font-extrabold text-[#071A35]">{money(eligibleSpend)} <span className="text-sm font-medium text-slate-400">/ {money(spendPerStamp)}</span></p>
              <p className="text-xs font-semibold text-[#8b6d05]">{Math.round(progress)}%</p>
            </div>
            <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-[#D4AF37] transition-all" style={{ width: `${progress}%` }} /></div>
            <p className="mt-3 text-sm text-slate-500">{remaining > 0 ? `${money(remaining)} eligible spend remaining for your next stamp.` : "Your next stamp threshold is reached."} Only successful paid orders count; promotional discounts are applied before loyalty is calculated.</p>
          </div>

          <div className="rounded-3xl border border-[#D4AF37]/35 bg-[#fffaf0] p-5 shadow-sm sm:p-6">
            <div className="flex items-center gap-2 text-[#8b6d05]"><TrendingUp size={18} /><p className="text-xs font-bold uppercase tracking-[.16em]">Your membership snapshot</p></div>
            <div className="mt-5 grid grid-cols-2 gap-4">
              <div><p className="text-2xl font-extrabold text-[#071A35]">{number(customer.total_orders || 0)}</p><p className="mt-1 text-xs text-slate-500">Orders placed</p></div>
              <div><p className="text-2xl font-extrabold text-[#071A35]">{money(Number(customer.total_spent || 0))}</p><p className="mt-1 text-xs text-slate-500">Total customer spend</p></div>
              <div><p className="text-2xl font-extrabold text-[#071A35]">{number(unlockedCount)}</p><p className="mt-1 text-xs text-slate-500">Reward thresholds reached</p></div>
              <div><p className="text-2xl font-extrabold text-[#071A35]">{number(rewards.length)}</p><p className="mt-1 text-xs text-slate-500">Active reward options</p></div>
            </div>
            <p className="mt-5 border-t border-[#D4AF37]/25 pt-4 text-xs leading-5 text-slate-600">Current program rules: {settings.minimum_redemption_points} stamps minimum for redemption and up to {settings.maximum_redemption_percentage}% of an eligible order, subject to the reward's own conditions. Reward expiry setting: {settings.reward_expiry_days} days.</p>
          </div>
        </section>

        <section className="mt-8">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div><p className="text-xs font-bold uppercase tracking-[.16em] text-[#9a7a20]">Member benefits</p><h2 className="mt-1 text-2xl font-bold text-[#071A35]">Rewards you can work towards</h2><p className="mt-1 text-sm text-slate-500">These options are loaded from the active rewards configured by Vaishnavi Collections.</p></div>
            <span className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-500">{rewards.length} active</span>
          </div>
          {rewards.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center"><Gift className="mx-auto text-slate-300" size={28} /><h3 className="mt-3 font-semibold text-[#071A35]">New rewards are on their way</h3><p className="mt-1 text-sm text-slate-500">Your stamp balance is still tracked. Check back for active reward options.</p></div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {rewards.map((reward) => {
                const unlocked = account.points_balance >= reward.points_required;
                return <article key={reward.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between gap-3"><span className="grid size-11 place-items-center rounded-xl bg-[#071A35] text-[#D4AF37]"><Gift size={20} /></span><span className={unlocked ? "rounded-full bg-[#f8f2d9] px-2.5 py-1 text-[10px] font-bold text-[#8b6d05]" : "rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-500"}>{unlocked ? "THRESHOLD REACHED" : `${number(Math.max(reward.points_required - account.points_balance, 0))} TO GO`}</span></div>
                  <h3 className="mt-4 font-bold text-[#071A35]">{reward.name}</h3>
                  <p className="mt-1 text-lg font-extrabold text-[#8b6d05]">{rewardValue(reward)}</p>
                  <div className="mt-4 space-y-1 border-t border-slate-100 pt-3 text-xs text-slate-500">
                    <p>{number(reward.points_required)} stamps required</p>
                    {reward.minimum_purchase != null && <p>Minimum purchase: {money(reward.minimum_purchase)}</p>}
                    {reward.maximum_discount != null && <p>Maximum discount: {money(reward.maximum_discount)}</p>}
                    <p>Reward expiry: {reward.expires_after_days == null ? "No expiry specified" : `${reward.expires_after_days} days`}</p>
                  </div>
                </article>;
              })}
            </div>
          )}
        </section>

        <section className="mt-8 rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center gap-3 border-b border-slate-100 p-5"><span className="grid size-10 place-items-center rounded-xl bg-[#faf8ef] text-[#9b7b08]"><History size={18} /></span><div><h2 className="font-bold text-[#071A35]">Your rewards activity</h2><p className="mt-1 text-xs text-slate-500">Latest entries recorded in your loyalty ledger</p></div></div>
          {transactions.length === 0 ? <div className="p-8 text-center"><Sparkles className="mx-auto text-slate-300" size={26} /><p className="mt-3 text-sm font-semibold text-[#071A35]">No loyalty transactions yet</p><p className="mt-1 text-xs text-slate-500">When you earn or redeem stamps, the verified activity will appear here.</p></div> :
            <div className="divide-y divide-slate-100">
              {transactions.map((item) => {
                const negative = ["REDEEM", "REDEEMED", "DEBIT", "REDEMPTION"].includes(item.type.toUpperCase()) || item.amount < 0;
                return <div key={item.id} className="flex items-center gap-3 px-5 py-4">
                  <span className={negative ? "grid size-9 shrink-0 place-items-center rounded-xl bg-rose-50 text-rose-600" : "grid size-9 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-600"}>{negative ? <ArrowDownLeft size={17} /> : <ArrowUpRight size={17} />}</span>
                  <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-[#071A35]">{item.description || item.type.replaceAll("_", " ")}</p><p className="mt-0.5 text-[11px] text-slate-400">{new Date(item.created_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</p></div>
                  <p className={negative ? "text-sm font-bold text-rose-600" : "text-sm font-bold text-emerald-600"}>{negative ? "−" : "+"}{number(Math.abs(item.amount))} <span className="text-[10px] font-medium">stamps</span></p>
                </div>;
              })}
            </div>
          }
        </section>

        <div className="mt-6 flex flex-col items-start justify-between gap-3 rounded-2xl bg-[#071A35] p-5 text-white sm:flex-row sm:items-center">
          <div><p className="font-semibold">Keep your VC journey growing</p><p className="mt-1 text-xs text-white/60">Shop eligible products and earn stamps on successful paid orders.</p></div>
          <Link href="/products" className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-[#D4AF37] px-4 py-2.5 text-sm font-bold text-[#071A35]"><ShoppingBag size={15} /> Explore products</Link>
        </div>
      </div>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl border border-white/10 bg-white/10 p-4"><p className="text-2xl font-extrabold">{value}</p><p className="mt-1 text-xs text-white/55">{label}</p></div>;
}
