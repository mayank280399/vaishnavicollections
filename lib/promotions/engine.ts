import type { SupabaseClient } from "@supabase/supabase-js";

export type PromotionQuote = {
  promotionId: string | null;
  promotionCode: string | null;
  promotionName: string | null;
  promotionKind: "COUPON" | "AUTOMATIC" | null;
  discountAmount: number;
  subtotalAmount: number;
  payableAmount: number;
  description: string | null;
};

type PromotionRow = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  promotion_kind: "COUPON" | "AUTOMATIC";
  discount_type: "FIXED" | "PERCENTAGE";
  discount_value: number;
  minimum_order_amount: number;
  maximum_discount_amount: number | null;
  usage_limit: number | null;
  per_customer_limit: number;
  starts_at: string | null;
  ends_at: string | null;
  first_order_only: boolean;
  active: boolean;
};

const roundMoney = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;

export async function calculatePromotionQuote(
  admin: SupabaseClient,
  userId: string,
  subtotalAmount: number,
  couponCode?: string | null,
): Promise<PromotionQuote> {
  const subtotal = roundMoney(subtotalAmount);
  const normalizedCode = String(couponCode || "").trim().toUpperCase();

  const empty: PromotionQuote = {
    promotionId: null, promotionCode: null, promotionName: null,
    promotionKind: null, discountAmount: 0, subtotalAmount: subtotal,
    payableAmount: subtotal, description: null,
  };

  if (!Number.isFinite(subtotal) || subtotal <= 0) {
    throw new Error("Your cart total is invalid.");
  }

  const { data, error } = await admin
    .from("promotions")
    .select("id,code,name,description,promotion_kind,discount_type,discount_value,minimum_order_amount,maximum_discount_amount,usage_limit,per_customer_limit,starts_at,ends_at,first_order_only,active")
    .eq("active", true);
  if (error) throw new Error("Unable to validate current offers. Please retry.");

  const now = Date.now();
  const rows = (data || []) as PromotionRow[];
  const candidates = normalizedCode
    ? rows.filter((p) => p.promotion_kind === "COUPON" && p.code.toUpperCase() === normalizedCode)
    : rows.filter((p) => p.promotion_kind === "AUTOMATIC");

  if (normalizedCode && candidates.length === 0) {
    throw new Error("This coupon code is invalid or currently unavailable.");
  }

  const { data: priorOrders, error: ordersError } = await admin
    .from("orders")
    .select("id")
    .eq("user_id", userId)
    .neq("status", "CANCELLED")
    .limit(1);
  if (ordersError) throw new Error("Unable to validate offer eligibility.");

  const { data: redemptions, error: redemptionError } = await admin
    .from("promotion_redemptions")
    .select("promotion_id,user_id");
  if (redemptionError) throw new Error("Unable to validate offer usage limits.");

  const eligible: Array<{ promotion: PromotionRow; discount: number }> = [];
  for (const promotion of candidates) {
    if (promotion.starts_at && new Date(promotion.starts_at).getTime() > now) continue;
    if (promotion.ends_at && new Date(promotion.ends_at).getTime() <= now) continue;
    if (subtotal < Number(promotion.minimum_order_amount || 0)) continue;
    if (promotion.first_order_only && (priorOrders || []).length > 0) continue;

    const uses = (redemptions || []).filter((r) => r.promotion_id === promotion.id);
    if (promotion.usage_limit != null && uses.length >= promotion.usage_limit) continue;
    if (uses.filter((r) => r.user_id === userId).length >= promotion.per_customer_limit) continue;

    let discount = promotion.discount_type === "PERCENTAGE"
      ? subtotal * Number(promotion.discount_value) / 100
      : Number(promotion.discount_value);
    if (promotion.maximum_discount_amount != null) {
      discount = Math.min(discount, Number(promotion.maximum_discount_amount));
    }
    discount = roundMoney(Math.min(discount, subtotal));
    if (discount > 0 && subtotal - discount >= 1) eligible.push({ promotion, discount });
  }

  if (normalizedCode && eligible.length === 0) {
    throw new Error("This coupon is not eligible for your cart or has reached its usage limit.");
  }

  if (!eligible.length) return empty;
  eligible.sort((a, b) => b.discount - a.discount);
  const selected = eligible[0];

  return {
    promotionId: selected.promotion.id,
    promotionCode: selected.promotion.promotion_kind === "COUPON" ? selected.promotion.code : null,
    promotionName: selected.promotion.name,
    promotionKind: selected.promotion.promotion_kind,
    discountAmount: selected.discount,
    subtotalAmount: subtotal,
    payableAmount: roundMoney(subtotal - selected.discount),
    description: selected.promotion.description,
  };
}
