"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";
import AccountHeader from "@/components/storefront/account/AccountHeader";
import ProfileCompletionCard from "@/components/storefront/account/ProfileCompletionCard";
import CustomerProfileCard from "@/components/storefront/account/CustomerProfileCard";
import DeliveryAddressCard from "@/components/storefront/account/DeliveryAddressCard";
import AccountQuickStats from "@/components/storefront/account/AccountQuickStats";
import LoyaltyCard from "@/components/storefront/account/LoyaltyCard";
import RewardsSection from "@/components/storefront/account/RewardsSection";
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

function getInitials(name: string | null) {
  if (!name) return "VC";

  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

function calculateProfileCompletion(customer: Customer) {
  const profileFields = [
    {
      label: "Name",
      value: customer.display_name,
    },
    {
      label: "Phone number",
      value: customer.phone,
    },
    {
      label: "Date of birth",
      value: customer.date_of_birth,
    },
    {
      label: "Gender",
      value: customer.gender,
    },
    {
      label: "Address",
      value: customer.address_line1,
    },
    {
      label: "City",
      value: customer.city,
    },
    {
      label: "State",
      value: customer.state,
    },
    {
      label: "PIN code",
      value: customer.postal_code,
    },
  ];

  const completed = profileFields.filter(
    (field) =>
      field.value &&
      String(field.value).trim().length > 0
  ).length;

  return Math.round(
    (completed / profileFields.length) * 100
  );
}

const EMPTY_REWARD_ACCOUNT = (
  customerId: string
): RewardAccount => ({
  id: "",
  customer_id: customerId,
  points_balance: 0,
  lifetime_points_earned: 0,
  lifetime_points_redeemed: 0,
  eligible_spend_balance: 0,
});

export default function AccountPage() {
  const router = useRouter();
  const supabase = createClient();

  const [data, setData] = useState<AccountData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAccount = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // ---------------------------------------------------------
      // 1. AUTHENTICATED USER
      // ---------------------------------------------------------

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) {
        console.error("ACCOUNT AUTH ERROR:", authError);
        throw new Error(
          "We couldn't verify your account. Please sign in again."
        );
      }

      if (!user) {
        router.replace("/login?redirect=/account");
        return;
      }

      // ---------------------------------------------------------
      // 2. CUSTOMER
      //
      // This is the ONLY required database record for the page.
      // ---------------------------------------------------------

      const { data: customer, error: customerError } =
        await supabase
          .from("customers")
          .select(`
            id,
            profile_id,
            display_name,
            phone,
            email,
            date_of_birth,
            gender,
            address_line1,
            address_line2,
            city,
            state,
            postal_code,
            total_orders,
            total_spent,
            last_purchase_at
          `)
          .eq("profile_id", user.id)
          .maybeSingle();

      if (customerError) {
        console.error(
          "ACCOUNT CUSTOMER ERROR:",
          customerError
        );

        throw new Error(
          "We couldn't load your customer profile. Please try again."
        );
      }

      /*
       * A logged-in user without a customer record should not
       * break the entire account page.
       *
       * However, because the rest of the account data depends
       * on customer.id, we still need to tell the customer
       * that their customer profile hasn't been created.
       */

      if (!customer) {
        console.error(
          "ACCOUNT CUSTOMER MISSING FOR AUTH USER:",
          user.id
        );

        throw new Error(
          "Your account is signed in, but your customer profile hasn't been created yet. Please contact Vaishnavi Collections."
        );
      }

      // ---------------------------------------------------------
      // 3. OPTIONAL ACCOUNT DATA
      //
      // These should NEVER prevent the account page from opening.
      // ---------------------------------------------------------

      const [
        rewardsResult,
        settingsResult,
        rewardAccountResult,
        transactionsResult,
        ordersResult,
      ] = await Promise.all([
        supabase
          .from("rewards")
          .select(`
            id,
            name,
            points_required,
            reward_type,
            reward_value,
            minimum_purchase,
            maximum_discount,
            active,
            expires_after_days
          `)
          .eq("active", true)
          .order("points_required", {
            ascending: true,
          }),

        supabase
          .from("loyalty_settings")
          .select("spend_per_stamp")
          .limit(1)
          .maybeSingle(),

        supabase
          .from("reward_accounts")
          .select(`
            id,
            customer_id,
            points_balance,
            lifetime_points_earned,
            lifetime_points_redeemed,
            eligible_spend_balance
          `)
          .eq("customer_id", customer.id)
          .maybeSingle(),

        supabase
          .from("reward_transactions")
          .select(`
            id,
            type,
            amount,
            description,
            created_at
          `)
          .eq("customer_id", customer.id)
          .order("created_at", {
            ascending: false,
          })
          .limit(10),

        supabase
          .from("sales")
          .select(`
            id,
            sale_number,
            total_amount,
            status,
            created_at
          `)
          .eq("customer_id", customer.id)
          .order("created_at", {
            ascending: false,
          })
          .limit(5),
      ]);

      // ---------------------------------------------------------
      // 4. LOG OPTIONAL ERRORS
      //
      // Don't break the entire page.
      // ---------------------------------------------------------

      if (rewardsResult.error) {
        console.warn(
          "ACCOUNT REWARDS LOAD FAILED:",
          rewardsResult.error
        );
      }

      if (settingsResult.error) {
        console.warn(
          "ACCOUNT LOYALTY SETTINGS LOAD FAILED:",
          settingsResult.error
        );
      }

      if (rewardAccountResult.error) {
        console.warn(
          "ACCOUNT REWARD ACCOUNT LOAD FAILED:",
          rewardAccountResult.error
        );
      }

      if (transactionsResult.error) {
        console.warn(
          "ACCOUNT TRANSACTIONS LOAD FAILED:",
          transactionsResult.error
        );
      }

      if (ordersResult.error) {
        console.warn(
          "ACCOUNT ORDERS LOAD FAILED:",
          ordersResult.error
        );
      }

      // ---------------------------------------------------------
      // 5. BUILD SAFE ACCOUNT DATA
      // ---------------------------------------------------------

      const rewardAccount =
        rewardAccountResult.data ??
        EMPTY_REWARD_ACCOUNT(customer.id);

      setData({
        customer,

        rewards: rewardsResult.error
          ? []
          : rewardsResult.data ?? [],

        loyaltySettings: {
          spend_per_stamp:
            settingsResult.data?.spend_per_stamp ?? 500,
        },

        rewardAccount,

        transactions: transactionsResult.error
          ? []
          : transactionsResult.data ?? [],

        orders: ordersResult.error
          ? []
          : ordersResult.data ?? [],
      });
    } catch (err) {
      console.error("ACCOUNT PAGE ERROR:", err);

      setData(null);

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while loading your account."
      );
    } finally {
      setLoading(false);
    }
  }, [router, supabase]);

  useEffect(() => {
    loadAccount();
  }, [loadAccount]);

  // -----------------------------------------------------------
  // LOADING
  // -----------------------------------------------------------

  if (loading) {
    return (
      <main className="min-h-screen bg-[#faf9f6]">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-6">
            <div className="h-32 rounded-3xl bg-slate-200" />

            <div className="h-28 rounded-3xl bg-slate-200" />

            <div className="grid gap-4 md:grid-cols-4">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="h-28 rounded-2xl bg-slate-200"
                />
              ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="h-72 rounded-3xl bg-slate-200" />
              <div className="h-72 rounded-3xl bg-slate-200" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  // -----------------------------------------------------------
  // ERROR
  // -----------------------------------------------------------

  if (error || !data) {
    return (
      <main className="min-h-screen bg-[#faf9f6] px-4 py-16">
        <div className="mx-auto max-w-lg rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#071A35] text-xl font-bold text-[#D4AF37]">
            VC
          </div>

          <h1 className="mt-5 text-xl font-semibold text-[#071A35]">
            We couldn't load your account
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-500">
            {error ??
              "Please try again. If the problem continues, contact Vaishnavi Collections."}
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              onClick={loadAccount}
              className="rounded-xl bg-[#071A35] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#0b2447]"
            >
              Try again
            </button>

            <button
              onClick={() => router.push("/")}
              className="rounded-xl border border-slate-200 px-6 py-3 text-sm font-semibold text-[#071A35] transition hover:bg-slate-50"
            >
              Back to shop
            </button>
          </div>
        </div>
      </main>
    );
  }

  const completion = calculateProfileCompletion(
    data.customer
  );

  // Prevent unused-variable warning until the profile component
  // is enabled again.
  void completion;

  // -----------------------------------------------------------
  // ACCOUNT
  // -----------------------------------------------------------

  return (
    <main className="min-h-screen bg-[#faf9f6]">
      <div className="mx-auto max-w-6xl px-4 pb-16 pt-6 sm:px-6 lg:px-8">

        <AccountHeader
          customer={data.customer}
          initials={getInitials(data.customer.display_name)}
        />

        {/* ---------------------------------------------------
            PROFILE COMPLETION
        --------------------------------------------------- */}

        <div className="mt-6">
          {
          <ProfileCompletionCard
            customer={data.customer}
            completion={completion}
            onUpdated={loadAccount}
          />
          }
        </div>

        {/* ---------------------------------------------------
            QUICK STATS
        --------------------------------------------------- */}

        <div className="mt-6">
          {
          <AccountQuickStats
            customer={data.customer}
            rewardAccount={data.rewardAccount}
            rewards={data.rewards}
          />
          }
        </div>

        {/* ---------------------------------------------------
            PROFILE + DELIVERY ADDRESS
        --------------------------------------------------- */}

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          {
          <CustomerProfileCard
            customer={data.customer}
            onUpdated={loadAccount}
          />
          }

          {
          <DeliveryAddressCard
            customer={data.customer}
            onUpdated={loadAccount}
          />
          }

        </div>

        {/* ---------------------------------------------------
            LOYALTY
        --------------------------------------------------- */}

        <div className="mt-8">
          {
          <LoyaltyCard
            customer={data.customer}
            rewardAccount={data.rewardAccount}
            settings={data.loyaltySettings}
          />
          }
        </div>

        {/* ---------------------------------------------------
            REWARDS
        --------------------------------------------------- */}

        <div className="mt-8">
          {
          <RewardsSection
            rewards={data.rewards}
            pointsBalance={data.rewardAccount.points_balance}
          />
          }
        </div>

        {/* ---------------------------------------------------
            ORDERS + LOYALTY ACTIVITY
        --------------------------------------------------- */}

        <div className="mt-8 grid gap-6 lg:grid-cols-2">

          {
          <><RecentOrders
                          orders={data.orders} /><LoyaltyActivity
                              transactions={data.transactions} /></>
          }

        </div>

        {/* ---------------------------------------------------
            HELP
        --------------------------------------------------- */}

        <div className="mt-8">
          {
          <AccountHelpCard />
          }
        </div>

      </div>
    </main>
  );
}