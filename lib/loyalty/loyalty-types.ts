export type LoyaltySettings = {
  id: string;
  spend_per_stamp: number;
  points_per_currency: number;
  currency_per_point: number;
  minimum_redemption_points: number;
  maximum_redemption_percentage: number;
  reward_expiry_days: number;
  repeat_bonus_enabled: boolean;
  referral_bonus_enabled: boolean;
};

export type LoyaltyCustomer = {
  id: string;
  display_name: string;
  phone: string | null;
  email: string | null;

  points_balance: number;
  lifetime_points_earned: number;
  lifetime_points_redeemed: number;

  total_spent: number;
  purchase_count: number;
};

export type LoyaltyReward = {
  id: string;
  name: string;
  points_required: number;
  reward_type: string;
  reward_value: number;
  minimum_purchase: number;
  maximum_discount: number | null;
  active: boolean;
  expires_after_days: number | null;
};

export type LoyaltyStats = {
  total_customers: number;
  enrolled_customers: number;
  total_stamps: number;
  total_rewards: number;
  active_rewards: number;
  redeemed_rewards: number;
};

export type LoyaltyActivity = {
  id: string;
  customer_id: string;
  customer_name: string;
  type: string;
  amount: number;
  description: string | null;
  created_at: string;
};