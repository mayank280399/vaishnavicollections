"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";
import AccountHeader from "@/components/storefront/account/AccountHeader";
import ProfileCompletionCard from "@/components/storefront/account/ProfileCompletionCard";
import CustomerProfileCard from "@/components/storefront/account/CustomerProfileCard";
import DeliveryAddressCard from "@/components/storefront/account/DeliveryAddressCard";
import AccountQuickStats from "@/components/storefront/account/AccountQuickStats";
import RewardsBalanceCard from "@/components/storefront/account/RewardsBalanceCard";
import RecentOrders from "@/components/storefront/account/RecentOrders";
import LoyaltyActivity from "@/components/storefront/account/LoyaltyActivity";
import AccountHelpCard from "@/components/storefront/account/AccountHelpCard";

export type Customer = {
  id: string;
  profile_id: string | null;
  display_name: string | null;
  phone: string | null;
  email: string | null;
  date_of_birth: string | null;
  gender: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  total_orders: number | null;
  total_spent: number | null;
  last_purchase_at: string | null;
};

export type RewardAccount = {
  id: string;
  customer_id: string;
  points_balance: number;
  lifetime_points_earned: number;
  lifetime_points_redeemed: number;
  eligible_spend_balance: number;
};

export type Reward = {
  id: string;
  name: string;
  points_required: number;
  reward_type: "FIXED_DISCOUNT" | "PERCENTAGE_DISCOUNT";
  reward_value: number;
  minimum_purchase: number | null;
  maximum_discount: number | null;
  active: boolean;
  expires_after_days: number | null;
};

export type LoyaltySettings = {
  spend_per_stamp: number;
};

export type LoyaltyTransaction = {
  id: string;
  type: string;
  amount: number;
  description: string | null;
  created_at: string;
};

export type RecentOrder = {
  id: string;
  sale_number?: string | null;
  total_amount: number;
  status: string;
  created_at: string;
};

export type AccountData = {
  customer: Customer;
  rewardAccount: RewardAccount;
  rewards: Reward[];
  loyaltySettings: LoyaltySettings;
  transactions: LoyaltyTransaction[];
  orders: RecentOrder[];
};

const EMPTY_REWARD_ACCOUNT = (customerId: string): RewardAccount => ({
  id: "",
  customer_id: customerId,
  points_balance: 0,
  lifetime_points_earned: 0,
  lifetime_points_redeemed: 0,
  eligible_spend_balance: 0,
});

function getInitials(name: string | null) {
  if (!name?.trim()) return "VC";
  return name.trim().split(/\s+/).slice(0, 2).map((part) => part.charAt(0).toUpperCase()).join("");
}

function calculateProfileCompletion(customer: Customer) {
  const values = [
    customer.display_name,
    customer.phone,
    customer.date_of_birth,
    customer.gender,
    customer.address_line1,
    customer.city,
    customer.state,
    customer.postal_code,
  ];
  const completed = values.filter((value) => Boolean(value && String(value).trim())).length;
  return Math.round((completed / values.length) * 100);
}

export default function AccountPage() {
  const router = useRouter();
  // Keep the Supabase client stable so loadAccount does not recreate itself
  // after every render and accidentally trigger a continuous refetch loop.
  const supabase = useMemo(() => createClient(), []);
  const [data, setData] = useState<AccountData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAccount = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError) throw new Error("We couldn't verify your account. Please sign in again.");
      if (!authData.user) {
        router.replace("/login?redirect=/account");
        return;
      }

      const user = authData.user;
      const { data: customer, error: customerError } = await supabase
        .from("customers")
        .select("id,profile_id,display_name,phone,email,date_of_birth,gender,address_line1,address_line2,city,state,postal_code,total_orders,total_spent,last_purchase_at")
        .eq("profile_id", user.id)
        .maybeSingle();

      if (customerError) throw customerError;
      if (!customer) {
        throw new Error("Your account is signed in, but your customer profile hasn't been created yet. Please contact Vaishnavi Collections.");
      }

      const [rewardsResult, settingsResult, rewardAccountResult, transactionsResult, ordersResult] = await Promise.all([
        supabase.from("rewards")
          .select("id,name,points_required,reward_type,reward_value,minimum_purchase,maximum_discount,active,expires_after_days")
          .eq("active", true)
          .order("points_required", { ascending: true }),
        supabase.from("loyalty_settings")
          .select("spend_per_stamp")
          .limit(1)
          .maybeSingle(),
        supabase.from("reward_accounts")
          .select("id,customer_id,points_balance,lifetime_points_earned,lifetime_points_redeemed,eligible_spend_balance")
          .eq("customer_id", customer.id)
          .maybeSingle(),
        supabase.from("reward_transactions")
          .select("id,type,amount,description,created_at")
          .eq("customer_id", customer.id)
          .order("created_at", { ascending: false })
          .limit(8),
        supabase.from("orders")
          .select("id,order_number,total_amount,status,created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(5),
      ]);

      // Optional widgets should never prevent customers from opening their account.
      if (rewardsResult.error) console.warn("ACCOUNT REWARDS LOAD FAILED:", rewardsResult.error);
      if (settingsResult.error) console.warn("ACCOUNT LOYALTY SETTINGS LOAD FAILED:", settingsResult.error);
      if (rewardAccountResult.error) console.warn("ACCOUNT REWARD ACCOUNT LOAD FAILED:", rewardAccountResult.error);
      if (transactionsResult.error) console.warn("ACCOUNT TRANSACTIONS LOAD FAILED:", transactionsResult.error);
      if (ordersResult.error) console.warn("ACCOUNT ORDERS LOAD FAILED:", ordersResult.error);

      const rawAccount = rewardAccountResult.data;
      const rewardAccount: RewardAccount = rawAccount
        ? {
            id: rawAccount.id,
            customer_id: rawAccount.customer_id,
            points_balance: Number(rawAccount.points_balance || 0),
            lifetime_points_earned: Number(rawAccount.lifetime_points_earned || 0),
            lifetime_points_redeemed: Number(rawAccount.lifetime_points_redeemed || 0),
            eligible_spend_balance: Number(rawAccount.eligible_spend_balance || 0),
          }
        : EMPTY_REWARD_ACCOUNT(customer.id);

      setData({
        customer: customer as Customer,
        rewardAccount,
        rewards: rewardsResult.error ? [] : ((rewardsResult.data ?? []) as Reward[]).map((reward) => ({
          ...reward,
          points_required: Number(reward.points_required || 0),
          reward_value: Number(reward.reward_value || 0),
          minimum_purchase: reward.minimum_purchase == null ? null : Number(reward.minimum_purchase),
          maximum_discount: reward.maximum_discount == null ? null : Number(reward.maximum_discount),
        })),
        loyaltySettings: {
          spend_per_stamp: Math.max(Number(settingsResult.data?.spend_per_stamp || 500), 1),
        },
        transactions: transactionsResult.error ? [] : ((transactionsResult.data ?? []) as LoyaltyTransaction[]).map((item) => ({
          ...item,
          amount: Number(item.amount || 0),
        })),
        orders: ordersResult.error ? [] : (ordersResult.data ?? []).map((order) => ({
          id: order.id,
          sale_number: order.order_number,
          total_amount: Number(order.total_amount || 0),
          status: order.status,
          created_at: order.created_at,
        })),
      });
    } catch (err) {
      console.error("ACCOUNT PAGE ERROR:", err);
      setData(null);
      setError(err instanceof Error ? err.message : "Something went wrong while loading your account.");
    } finally {
      setLoading(false);
    }
  }, [router, supabase]);

  useEffect(() => {
    void loadAccount();
  }, [loadAccount]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#faf9f6]">
        <div className="mx-auto max-w-6xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
          <div className="h-32 animate-pulse rounded-3xl bg-slate-200" />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{[1, 2, 3, 4].map((item) => <div key={item} className="h-24 animate-pulse rounded-2xl bg-slate-200" />)}</div>
          <div className="h-72 animate-pulse rounded-3xl bg-slate-200" />
          <div className="grid gap-6 lg:grid-cols-2"><div className="h-64 animate-pulse rounded-3xl bg-slate-200" /><div className="h-64 animate-pulse rounded-3xl bg-slate-200" /></div>
        </div>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="min-h-screen bg-[#faf9f6] px-4 py-16">
        <section className="mx-auto max-w-lg rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#071A35] text-xl font-bold text-[#D4AF37]">VC</div>
          <h1 className="mt-5 text-xl font-semibold text-[#071A35]">We couldn't load your account</h1>
          <p className="mt-3 text-sm leading-6 text-slate-500">{error || "Please try again. If the problem continues, contact Vaishnavi Collections."}</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button onClick={() => void loadAccount()} className="rounded-xl bg-[#071A35] px-6 py-3 text-sm font-semibold text-white">Try again</button>
            <button onClick={() => router.push("/")} className="rounded-xl border border-slate-200 px-6 py-3 text-sm font-semibold text-[#071A35]">Back to shop</button>
          </div>
        </section>
      </main>
    );
  }

  const completion = calculateProfileCompletion(data.customer);

  return (
    <main className="min-h-screen bg-[#faf9f6]">
      <div className="mx-auto max-w-6xl space-y-6 px-4 pb-16 pt-6 sm:px-6 lg:px-8">
        <AccountHeader customer={data.customer} initials={getInitials(data.customer.display_name)} />

        <AccountQuickStats customer={data.customer} rewardAccount={data.rewardAccount} rewards={data.rewards} />

        <div className="grid gap-5 lg:grid-cols-[1.25fr_0.75fr]">
          <RewardsBalanceCard
            rewardAccount={data.rewardAccount}
            rewards={data.rewards}
            settings={data.loyaltySettings}
          />
          <ProfileCompletionCard customer={data.customer} completion={completion} onUpdated={loadAccount} />
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <CustomerProfileCard customer={data.customer} onUpdated={loadAccount} />
          <DeliveryAddressCard customer={data.customer} onUpdated={loadAccount} />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <RecentOrders orders={data.orders} />
          <LoyaltyActivity transactions={data.transactions} />
        </div>

        <AccountHelpCard />
      </div>
    </main>
  );
}
