import { createClient } from "@/lib/supabase/client";

import type {
  LoyaltyActivity,
  LoyaltyCustomer,
  LoyaltyReward,
  LoyaltySettings,
  LoyaltyStats,
} from "./loyalty-types";

/*
 * --------------------------------------------------
 * Supabase row types
 * --------------------------------------------------
 *
 * These types describe the database response.
 * They are intentionally separate from the
 * UI/domain types imported above.
 */

/*
 * loyalty_settings
 */
type LoyaltySettingsRow = {
  id: string;
  spend_per_stamp: number | string | null;
  points_per_currency?: number | string | null;
  currency_per_point?: number | string | null;
  reward_expiry_days: number | string | null;
  minimum_redemption_points:
    | number
    | string
    | null;
  maximum_redemption_percentage:
    | number
    | string
    | null;
  repeat_bonus_enabled: boolean | null;
  referral_bonus_enabled: boolean | null;
  created_at?: string | null;
  updated_at?: string | null;
};

/*
 * customers
 */
type LoyaltyCustomerRow = {
  id: string;
  display_name: string | null;
  phone: string | null;
  email: string | null;
};

/*
 * reward_accounts
 */
type LoyaltyAccountRow = {
  id: string;
  customer_id: string;
  points_balance: number | string | null;
  lifetime_points_earned:
    | number
    | string
    | null;
  lifetime_points_redeemed:
    | number
    | string
    | null;
  eligible_spend_balance:
    | number
    | string
    | null;
};

/*
 * sales
 */
type LoyaltySaleRow = {
  customer_id: string | null;
  total_amount: number | string | null;
};

/*
 * rewards
 */
type LoyaltyRewardRow = {
  id: string;
  name: string;
  points_required:
    | number
    | string
    | null;
  reward_type: string | null;
  reward_value:
    | number
    | string
    | null;
  minimum_purchase:
    | number
    | string
    | null;
  maximum_discount:
    | number
    | string
    | null;
  active: boolean | null;
  expires_after_days:
    | number
    | string
    | null;
  created_at?: string | null;
  updated_at?: string | null;
};

/*
 * reward_transactions + customer relation
 */
type LoyaltyTransactionCustomerRow = {
  display_name: string | null;
};

type LoyaltyTransactionRow = {
  id: string;
  customer_id: string | null;
  type: string;
  amount: number | string | null;
  description: string | null;
  created_at: string;
  customers:
    | LoyaltyTransactionCustomerRow
    | LoyaltyTransactionCustomerRow[]
    | null;
};

/*
 * reward_redemptions
 */
type LoyaltyRedemptionRow = {
  id: string;
};

/*
 * --------------------------------------------------
 * SETTINGS
 * --------------------------------------------------
 */

export async function getLoyaltySettings(): Promise<LoyaltySettings> {
  const { data, error } = await createClient()
    .from("loyalty_settings")
    .select("*")
    .limit(1)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  const settings =
    data as LoyaltySettingsRow;

  return {
    id: settings.id,

    spend_per_stamp:
      Number(
        settings.spend_per_stamp ?? 0
      ),

    points_per_currency:
      Number(
        settings.points_per_currency ?? 0
      ),

    currency_per_point:
      Number(
        settings.currency_per_point ?? 0
      ),

    minimum_redemption_points:
      Number(
        settings.minimum_redemption_points ?? 0
      ),

    maximum_redemption_percentage:
      Number(
        settings.maximum_redemption_percentage ?? 0
      ),

    reward_expiry_days:
      Number(
        settings.reward_expiry_days ?? 0
      ),

    repeat_bonus_enabled:
      Boolean(
        settings.repeat_bonus_enabled
      ),

    referral_bonus_enabled:
      Boolean(
        settings.referral_bonus_enabled
      ),
  };
}

/*
 * --------------------------------------------------
 * CUSTOMERS
 * --------------------------------------------------
 */

export async function getLoyaltyCustomers(): Promise<
  LoyaltyCustomer[]
> {
  const supabase = createClient();

  const [
    {
      data: customerData,
      error: customerError,
    },
    {
      data: accountData,
      error: accountError,
    },
    {
      data: salesData,
      error: salesError,
    },
  ] = await Promise.all([
    supabase
      .from("customers")
      .select(
        "id, display_name, phone, email"
      )
      .order("display_name"),

    supabase
      .from("reward_accounts")
      .select(
        `
          id,
          customer_id,
          points_balance,
          lifetime_points_earned,
          lifetime_points_redeemed,
          eligible_spend_balance
        `
      ),

    supabase
      .from("sales")
      .select(
        "customer_id, total_amount"
      ),
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

  const customers =
    (customerData ??
      []) as LoyaltyCustomerRow[];

  const accounts =
    (accountData ??
      []) as LoyaltyAccountRow[];

  const sales =
    (salesData ??
      []) as LoyaltySaleRow[];

  /*
   * ------------------------------------------------
   * Account map
   * ------------------------------------------------
   */

  const accountMap =
    new Map<
      string,
      LoyaltyAccountRow
    >();

  for (
    const account of accounts
  ) {
    accountMap.set(
      account.customer_id,
      account
    );
  }

  /*
   * ------------------------------------------------
   * Sales map
   * ------------------------------------------------
   */

  const salesMap = new Map<
    string,
    {
      total_spent: number;
      purchase_count: number;
    }
  >();

  for (
    const sale of sales
  ) {
    if (!sale.customer_id) {
      continue;
    }

    const existing =
      salesMap.get(
        sale.customer_id
      ) ?? {
        total_spent: 0,
        purchase_count: 0,
      };

    existing.total_spent +=
      Number(
        sale.total_amount ?? 0
      );

    existing.purchase_count += 1;

    salesMap.set(
      sale.customer_id,
      existing
    );
  }

  /*
   * ------------------------------------------------
   * Build loyalty customers
   * ------------------------------------------------
   */

  return customers.map(
    (
      customer: LoyaltyCustomerRow
    ): LoyaltyCustomer => {
      const account =
        accountMap.get(
          customer.id
        );

      const salesSummary =
        salesMap.get(
          customer.id
        ) ?? {
          total_spent: 0,
          purchase_count: 0,
        };

      return {
        id: customer.id,

        display_name:
          customer.display_name ??
          "Customer",

        phone:
          customer.phone,

        email:
          customer.email,

        points_balance:
          Number(
            account?.points_balance ?? 0
          ),

        lifetime_points_earned:
          Number(
            account?.lifetime_points_earned ??
              0
          ),

        lifetime_points_redeemed:
          Number(
            account?.lifetime_points_redeemed ??
              0
          ),

        eligible_spend_balance:
          Number(
            account?.eligible_spend_balance ??
              0
          ),

        total_spent:
          salesSummary.total_spent,

        purchase_count:
          salesSummary.purchase_count,
      };
    }
  );
}

/*
 * --------------------------------------------------
 * REWARDS
 * --------------------------------------------------
 */

export async function getLoyaltyRewards(): Promise<
  LoyaltyReward[]
> {
  const { data, error } =
    await createClient()
      .from("rewards")
      .select("*")
      .order("created_at", {
        ascending: false,
      });

  if (error) {
    throw new Error(error.message);
  }

  const rewards =
    (data ??
      []) as LoyaltyRewardRow[];

  return rewards.map(
    (
      reward: LoyaltyRewardRow
    ): LoyaltyReward => ({
      id: reward.id,

      name: reward.name,

      points_required:
        Number(
          reward.points_required ?? 0
        ),

      reward_type:
        reward.reward_type ??
        "FIXED_DISCOUNT",

      reward_value:
        Number(
          reward.reward_value ?? 0
        ),

      minimum_purchase:
        Number(
          reward.minimum_purchase ?? 0
        ),

      maximum_discount:
        reward.maximum_discount === null
          ? null
          : Number(
              reward.maximum_discount
            ),

      active:
        Boolean(reward.active),

      expires_after_days:
        reward.expires_after_days === null
          ? null
          : Number(
              reward.expires_after_days
            ),
    })
  );
}

/*
 * --------------------------------------------------
 * ACTIVITY
 * --------------------------------------------------
 */

export async function getLoyaltyActivities(): Promise<
  LoyaltyActivity[]
> {
  const { data, error } =
    await createClient()
      .from("reward_transactions")
      .select(
        `
          id,
          customer_id,
          type,
          amount,
          description,
          created_at,
          customers (
            display_name
          )
        `
      )
      .order("created_at", {
        ascending: false,
      })
      .limit(20);

  if (error) {
    throw new Error(error.message);
  }

  const transactions =
    (data ??
      []) as LoyaltyTransactionRow[];

  return transactions
    .filter(
      (
        item: LoyaltyTransactionRow
      ): item is LoyaltyTransactionRow & {
        customer_id: string;
      } =>
        item.customer_id !== null
    )
    .map(
      (
        item: LoyaltyTransactionRow & {
          customer_id: string;
        }
      ): LoyaltyActivity => {
        const customer =
          Array.isArray(
            item.customers
          )
            ? item.customers[0]
            : item.customers;

        return {
          id: item.id,

          customer_id:
            item.customer_id,

          customer_name:
            customer?.display_name ??
            "Customer",

          type: item.type,

          amount:
            Number(
              item.amount ?? 0
            ),

          description:
            item.description,

          created_at:
            item.created_at,
        };
      }
    );
}

/*
 * --------------------------------------------------
 * STATS
 * --------------------------------------------------
 */

export async function getLoyaltyStats(): Promise<LoyaltyStats> {
  const supabase = createClient();

  const [
    {
      count: totalCustomers,
      error: customerError,
    },
    {
      data: accountData,
      error: accountError,
    },
    {
      data: rewardData,
      error: rewardError,
    },
    {
      data: redemptionData,
      error: redemptionError,
    },
  ] = await Promise.all([
    supabase
      .from("customers")
      .select("*", {
        count: "exact",
        head: true,
      }),

    supabase
      .from("reward_accounts")
      .select(
        "points_balance"
      ),

    supabase
      .from("rewards")
      .select(
        "id, active"
      ),

    supabase
      .from("reward_redemptions")
      .select("id"),
  ]);

  if (customerError) {
    throw new Error(
      customerError.message
    );
  }

  if (accountError) {
    throw new Error(
      accountError.message
    );
  }

  if (rewardError) {
    throw new Error(
      rewardError.message
    );
  }

  if (redemptionError) {
    throw new Error(
      redemptionError.message
    );
  }

  /*
   * Establish explicit row types.
   */

  const accounts =
    (accountData ??
      []) as Array<
      Pick<
        LoyaltyAccountRow,
        "points_balance"
      >
    >;

  const rewards =
    (rewardData ??
      []) as Array<
      Pick<
        LoyaltyRewardRow,
        "id" | "active"
      >
    >;

  const redemptions =
    (redemptionData ??
      []) as LoyaltyRedemptionRow[];

  /*
   * ------------------------------------------------
   * Total outstanding stamps
   * ------------------------------------------------
   */

  const totalStamps =
    accounts.reduce(
      (
        sum: number,
        account: Pick<
          LoyaltyAccountRow,
          "points_balance"
        >
      ) =>
        sum +
        Number(
          account.points_balance ?? 0
        ),
      0
    );

  /*
   * ------------------------------------------------
   * Stats
   * ------------------------------------------------
   */

  return {
    total_customers:
      totalCustomers ?? 0,

    enrolled_customers:
      accounts.length,

    total_stamps:
      totalStamps,

    total_rewards:
      rewards.length,

    active_rewards:
      rewards.filter(
        (
          reward: Pick<
            LoyaltyRewardRow,
            "id" | "active"
          >
        ) => Boolean(reward.active)
      ).length,

    redeemed_rewards:
      redemptions.length,
  };
}

/*
 * --------------------------------------------------
 * UPDATE SETTINGS
 * --------------------------------------------------
 */

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
  const { error } =
    await createClient()
      .from("loyalty_settings")
      .update({
        spend_per_stamp:
          values.spend_per_stamp,

        reward_expiry_days:
          values.reward_expiry_days,

        minimum_redemption_points:
          values.minimum_redemption_points,

        maximum_redemption_percentage:
          values.maximum_redemption_percentage,

        repeat_bonus_enabled:
          values.repeat_bonus_enabled,

        referral_bonus_enabled:
          values.referral_bonus_enabled,

        updated_at:
          new Date().toISOString(),
      })
      .eq("id", settingsId);

  if (error) {
    throw new Error(error.message);
  }
}

/*
 * --------------------------------------------------
 * CREATE REWARD
 * --------------------------------------------------
 */

export async function createReward(
  values: {
    name: string;
    points_required: number;
    reward_value: number;
    minimum_purchase: number;
    expires_after_days: number | null;
  }
) {
  const { error } =
    await createClient()
      .from("rewards")
      .insert({
        name: values.name,

        points_required:
          values.points_required,

        reward_type:
          "FIXED_DISCOUNT",

        reward_value:
          values.reward_value,

        minimum_purchase:
          values.minimum_purchase,

        maximum_discount:
          null,

        active: true,

        expires_after_days:
          values.expires_after_days,
      });

  if (error) {
    throw new Error(error.message);
  }
}

/*
 * --------------------------------------------------
 * TOGGLE REWARD
 * --------------------------------------------------
 */

export async function toggleReward(
  rewardId: string,
  active: boolean
) {
  const { error } =
    await createClient()
      .from("rewards")
      .update({
        active,
      })
      .eq("id", rewardId);

  if (error) {
    throw new Error(error.message);
  }
}

/*
 * --------------------------------------------------
 * ADJUST CUSTOMER STAMPS
 * --------------------------------------------------
 */

export async function adjustCustomerPoints(
  customerId: string,
  amount: number,
  description: string
) {
  if (
    !Number.isInteger(amount) ||
    amount === 0
  ) {
    throw new Error(
      "Stamp adjustment must be a non-zero whole number."
    );
  }

  const supabase = createClient();

  /*
   * ------------------------------------------------
   * Existing account
   * ------------------------------------------------
   */

  const {
    data: existingData,
    error: accountError,
  } = await supabase
    .from("reward_accounts")
    .select("*")
    .eq("customer_id", customerId)
    .maybeSingle();

  if (accountError) {
    throw new Error(
      accountError.message
    );
  }

  const existing =
    existingData as LoyaltyAccountRow | null;

  let accountId: string;
  let newBalance: number;

  /*
   * ------------------------------------------------
   * Create account if necessary
   * ------------------------------------------------
   */

  if (!existing) {
    if (amount < 0) {
      throw new Error(
        "Customer does not have any stamps to remove."
      );
    }

    const {
      data: createdData,
      error: createError,
    } = await supabase
      .from("reward_accounts")
      .insert({
        customer_id:
          customerId,

        points_balance:
          amount,

        lifetime_points_earned:
          amount,

        lifetime_points_redeemed:
          0,

        eligible_spend_balance:
          0,
      })
      .select()
      .single();

    if (createError) {
      throw new Error(
        createError.message
      );
    }

    const created =
      createdData as LoyaltyAccountRow;

    accountId = created.id;
    newBalance = amount;
  } else {
    /*
     * ------------------------------------------------
     * Update existing account
     * ------------------------------------------------
     */

    const currentBalance =
      Number(
        existing.points_balance ?? 0
      );

    newBalance =
      currentBalance + amount;

    if (newBalance < 0) {
      throw new Error(
        "Customer does not have enough stamps for this adjustment."
      );
    }

    const lifetimeEarned =
      Number(
        existing.lifetime_points_earned ??
          0
      ) +
      (amount > 0
        ? amount
        : 0);

    const lifetimeRedeemed =
      Number(
        existing.lifetime_points_redeemed ??
          0
      ) +
      (amount < 0
        ? Math.abs(amount)
        : 0);

    const {
      error: updateError,
    } = await supabase
      .from("reward_accounts")
      .update({
        points_balance:
          newBalance,

        lifetime_points_earned:
          lifetimeEarned,

        lifetime_points_redeemed:
          lifetimeRedeemed,

        updated_at:
          new Date().toISOString(),
      })
      .eq(
        "id",
        existing.id
      );

    if (updateError) {
      throw new Error(
        updateError.message
      );
    }

    accountId =
      existing.id;
  }

  /*
   * ------------------------------------------------
   * Audit transaction
   * ------------------------------------------------
   *
   * Positive amount = stamps added.
   * Negative amount = stamps removed.
   */

  const {
    error: transactionError,
  } = await supabase
    .from("reward_transactions")
    .insert({
      reward_account_id:
        accountId,

      customer_id:
        customerId,

      type:
        "MANUAL_ADJUSTMENT",

      amount,

      reference_type:
        "MANUAL_ADJUSTMENT",

      reference_id:
        null,

      description:
        description ||
        "Manual loyalty stamp adjustment",
    });

  if (transactionError) {
    throw new Error(
      transactionError.message
    );
  }

  return {
    accountId,
    newBalance,
  };
}