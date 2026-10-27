"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export type PromotionInput = {
  code: string;
  name: string;
  description?: string;
  discount_type: "FIXED" | "PERCENTAGE";
  discount_value: number;
  minimum_order_amount: number;
  maximum_discount_amount?: number | null;
  usage_limit?: number | null;
  per_customer_limit: number;
  starts_at?: string | null;
  ends_at?: string | null;
  first_order_only: boolean;
  active: boolean;
};

async function requirePromotionAdmin() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) throw new Error("Please sign in with an authorized admin account.");

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError || !profile || !["ADMIN", "OWNER"].includes(String(profile.role).toUpperCase())) {
    throw new Error("Only an ADMIN or OWNER can manage promotions.");
  }

  return { user, admin: createAdminClient() };
}

function normalizeInput(input: PromotionInput) {
  const code = input.code.trim().toUpperCase();
  const name = input.name.trim();
  const value = Number(input.discount_value);
  const minimum = Number(input.minimum_order_amount);
  const perCustomer = Number(input.per_customer_limit);
  const maximum = input.maximum_discount_amount == null || input.maximum_discount_amount === ("" as unknown as number)
    ? null
    : Number(input.maximum_discount_amount);
  const usageLimit = input.usage_limit == null ? null : Number(input.usage_limit);

  if (!/^[A-Z0-9][A-Z0-9_-]{2,39}$/.test(code)) throw new Error("Coupon code must be 3–40 characters and contain only letters, numbers, hyphens or underscores.");
  if (!name || name.length > 100) throw new Error("Enter a promotion name (up to 100 characters).");
  if (!Number.isFinite(value) || value <= 0) throw new Error("Discount value must be positive.");
  if (input.discount_type === "PERCENTAGE" && value > 100) throw new Error("Percentage discount cannot exceed 100%.");
  if (!Number.isFinite(minimum) || minimum < 0) throw new Error("Minimum order amount cannot be negative.");
  if (!Number.isInteger(perCustomer) || perCustomer < 1) throw new Error("Per-customer usage limit must be at least 1.");
  if (maximum !== null && (!Number.isFinite(maximum) || maximum <= 0)) throw new Error("Maximum discount must be a positive amount.");
  if (usageLimit !== null && (!Number.isInteger(usageLimit) || usageLimit < 1)) throw new Error("Total usage limit must be a positive whole number.");
  if (input.starts_at && input.ends_at && new Date(input.ends_at) <= new Date(input.starts_at)) throw new Error("End date must be later than start date.");

  return {
    code,
    name,
    description: input.description?.trim() || null,
    discount_type: input.discount_type,
    discount_value: value,
    minimum_order_amount: minimum,
    maximum_discount_amount: maximum,
    usage_limit: usageLimit,
    per_customer_limit: perCustomer,
    starts_at: input.starts_at || null,
    ends_at: input.ends_at || null,
    first_order_only: Boolean(input.first_order_only),
    active: Boolean(input.active),
  };
}

export async function listPromotions() {
  const { admin } = await requirePromotionAdmin();
  const { data, error } = await admin
    .from("promotions")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function savePromotion(input: PromotionInput, id?: string) {
  const { user, admin } = await requirePromotionAdmin();
  const values = normalizeInput(input);

  if (id) {
    const { data, error } = await admin
      .from("promotions")
      .update({ ...values, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return data;
  }

  const { data, error } = await admin
    .from("promotions")
    .insert({ ...values, created_by: user.id })
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function setPromotionActive(id: string, active: boolean) {
  await requirePromotionAdmin();
  const { error } = await createAdminClient()
    .from("promotions")
    .update({ active, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);
}
