import { createClient } from "@/lib/supabase/client";

import type {
  LoyaltyActivity,
  LoyaltyCustomer,
  LoyaltyReward,
  LoyaltySettings,
  LoyaltyStats,
} from "./loyalty-types";

/* ----------------------------------------
   SETTINGS
----------------------------------------- */

export async function getLoyaltySettings(): Promise<LoyaltySettings> {
  const { data, error } = await createClient()
    .from("loyalty_settings")
    .select("*")
    .limit(1)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as LoyaltySettings;
}

/* ----------------------------------------
   CUSTOMERS
----------------------------------------- */

export async function getLoyaltyCustomers(): Promise<LoyaltyCustomer[]> {
  const [{ data: customers, error: customerError }, { data: accounts, error: accountError }, { data: sales, error: salesError }] =
    await Promise.all([
      createClient()
        .from("customers")
        .select("id, display_name, phone, email")
        .order("display_name"),

      createClient()
        .from("reward_accounts")
        .select(
          "customer_id, points_balance, lifetime_points_earned, lifetime_points_redeemed"
        ),

      createClient()
        .from("sales")
        .select("customer_id, total_amount"),
    ]);

  if (customerError) {
    throw new Error(customerError.message);
  }

  if (accountError) {
    throw new Error(accountError.message);
  }

  if (salesError) {
    throw new Error(salesError.message);
  }

  const accountMap = new Map(
    (accounts ?? []).map((account) => [
      account.customer_id,
      account,
    ])
  );

  const salesMap = new Map<
    string,
    {
      total_spent: number;
      purchase_count: number;
    }
  >();

  for (const sale of sales ?? []) {
    if (!sale.customer_id) continue;

    const existing = salesMap.get(sale.customer_id) ?? {
      total_spent: 0,
      purchase_count: 0,
    };

    existing.total_spent += Number(sale.total_amount ?? 0);
    existing.purchase_count += 1;

    salesMap.set(sale.customer_id, existing);
  }

  return (customers ?? []).map((customer) => {
    const account = accountMap.get(customer.id);

    const salesData = salesMap.get(customer.id) ?? {
      total_spent: 0,
      purchase_count: 0,
    };

    return {
      id: customer.id,
      display_name: customer.display_name,
      phone: customer.phone,
      email: customer.email,

      points_balance: account?.points_balance ?? 0,
      lifetime_points_earned:
        account?.lifetime_points_earned ?? 0,
      lifetime_points_redeemed:
        account?.lifetime_points_redeemed ?? 0,

      total_spent: salesData.total_spent,
      purchase_count: salesData.purchase_count,
    };
  });
}

/* ----------------------------------------
   REWARDS
----------------------------------------- */

export async function getLoyaltyRewards(): Promise<LoyaltyReward[]> {
  const { data, error } = await createClient()
    .from("rewards")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as LoyaltyReward[];
}

/* ----------------------------------------
   ACTIVITY
----------------------------------------- */

export async function getLoyaltyActivities(): Promise<LoyaltyActivity[]> {
  const { data, error } = await createClient()
    .from("reward_transactions")
    .select(`
      id,
      customer_id,
      type,
      amount,
      description,
      created_at,
      customers (
        display_name
      )
    `)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((item: any) => ({
    id: item.id,
    customer_id: item.customer_id,
    customer_name:
      item.customers?.display_name ?? "Customer",
    type: item.type,
    amount: Number(item.amount ?? 0),
    description: item.description,
    created_at: item.created_at,
  }));
}

/* ----------------------------------------
   STATS
----------------------------------------- */

export async function getLoyaltyStats(): Promise<LoyaltyStats> {
  const [
    { count: totalCustomers, error: customerError },
    { data: accounts, error: accountError },
    { data: rewards, error: rewardError },
    { data: redemptions, error: redemptionError },
  ] = await Promise.all([
    createClient()
      .from("customers")
      .select("*", { count: "exact", head: true }),

    createClient()
      .from("reward_accounts")
      .select("points_balance"),

    createClient()
      .from("rewards")
      .select("id, active"),

    createClient()
      .from("reward_redemptions")
      .select("id"),
  ]);

  if (customerError) throw new Error(customerError.message);
  if (accountError) throw new Error(accountError.message);
  if (rewardError) throw new Error(rewardError.message);
  if (redemptionError) throw new Error(redemptionError.message);

  const totalStamps = (accounts ?? []).reduce(
    (sum, account) => sum + Number(account.points_balance ?? 0),
    0
  );

  return {
    total_customers: totalCustomers ?? 0,
    enrolled_customers: accounts?.length ?? 0,
    total_stamps: totalStamps,
    total_rewards: rewards?.length ?? 0,
    active_rewards:
      rewards?.filter((reward) => reward.active).length ?? 0,
    redeemed_rewards: redemptions?.length ?? 0,
  };
}

/* ----------------------------------------
   UPDATE SETTINGS
----------------------------------------- */

export async function updateLoyaltySettings(
  settingsId: string,
  values: {
    spend_per_stamp: number;
    reward_expiry_days: number;
    minimum_redemption_points: number;
    maximum_redemption_percentage: number;
    repeat_bonus_enabled: boolean;
    referral_bonus_enabled: boolean;
  }
) {
  const { error } = await createClient()
    .from("loyalty_settings")
    .update({
      spend_per_stamp: values.spend_per_stamp,
      reward_expiry_days: values.reward_expiry_days,
      minimum_redemption_points:
        values.minimum_redemption_points,
      maximum_redemption_percentage:
        values.maximum_redemption_percentage,
      repeat_bonus_enabled:
        values.repeat_bonus_enabled,
      referral_bonus_enabled:
        values.referral_bonus_enabled,
      updated_at: new Date().toISOString(),
    })
    .eq("id", settingsId);

  if (error) {
    throw new Error(error.message);
  }
}

/* ----------------------------------------
   CREATE REWARD
----------------------------------------- */

export async function createReward(values: {
  name: string;
  points_required: number;
  reward_value: number;
  minimum_purchase: number;
  expires_after_days: number | null;
}) {
  const { error } = await createClient().from("rewards").insert({
    name: values.name,
    points_required: values.points_required,
    reward_type: "FIXED_DISCOUNT",
    reward_value: values.reward_value,
    minimum_purchase: values.minimum_purchase,
    maximum_discount: null,
    active: true,
    expires_after_days: values.expires_after_days,
  });

  if (error) {
    throw new Error(error.message);
  }
}

/* ----------------------------------------
   TOGGLE REWARD
----------------------------------------- */

export async function toggleReward(
  rewardId: string,
  active: boolean
) {
  const { error } = await createClient()
    .from("rewards")
    .update({ active })
    .eq("id", rewardId);

  if (error) {
    throw new Error(error.message);
  }
}

/* ----------------------------------------
   ADJUST CUSTOMER STAMPS
----------------------------------------- */

export async function adjustCustomerPoints(
  customerId: string,
  amount: number,
  description: string
) {
  const { data: existing, error: accountError } = await createClient()
    .from("reward_accounts")
    .select("*")
    .eq("customer_id", customerId)
    .maybeSingle();

  if (accountError) {
    throw new Error(accountError.message);
  }

  let accountId: string;

  if (!existing) {
    const { data: created, error: createError } =
      await createClient()
        .from("reward_accounts")
        .insert({
          customer_id: customerId,
          points_balance: Math.max(amount, 0),
          lifetime_points_earned: Math.max(amount, 0),
          lifetime_points_redeemed: 0,
        })
        .select()
        .single();

    if (createError) {
      throw new Error(createError.message);
    }

    accountId = created.id;
  } else {
    const newBalance = Math.max(
      0,
      existing.points_balance + amount
    );

    const lifetimeEarned =
      amount > 0
        ? existing.lifetime_points_earned + amount
        : existing.lifetime_points_earned;

    const lifetimeRedeemed =
      amount < 0
        ? existing.lifetime_points_redeemed +
          Math.abs(amount)
        : existing.lifetime_points_redeemed;

    const { error: updateError } = await createClient()
      .from("reward_accounts")
      .update({
        points_balance: newBalance,
        lifetime_points_earned: lifetimeEarned,
        lifetime_points_redeemed: lifetimeRedeemed,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id);

    if (updateError) {
      throw new Error(updateError.message);
    }

    accountId = existing.id;
  }

  /*
   * NOTE:
   * reward_transactions.type is an enum in your database.
   * We will connect the exact enum values after checking
   * the enum definition.
   */
  return accountId;
}