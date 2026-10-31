import type { SupabaseClient } from "@supabase/supabase-js";

export type PromotionQuote = {
  promotionId: string | null;
  promotionCode: string | null;
  promotionName: string | null;
  promotionKind: "COUPON" | "AUTOMATIC" | null;
  firstOrderOnly: boolean;
  discountAmount: number;
  subtotalAmount: number;
  payableAmount: number;
  description: string | null;
  minimumOrderAmount: number;
  discountType: "FIXED" | "PERCENTAGE" | null;
  discountValue: number;
  maximumDiscountAmount: number | null;
};

type PromotionRow = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  promotion_kind: "COUPON" | "AUTOMATIC";
  discount_type: "FIXED" | "PERCENTAGE";
  discount_value: number | string;
  minimum_order_amount: number | string;
  maximum_discount_amount: number | string | null;
  usage_limit: number | null;
  per_customer_limit: number;
  starts_at: string | null;
  ends_at: string | null;
  first_order_only: boolean;
  active: boolean;
};

type RedemptionRow = { promotion_id: string; user_id: string };

const roundMoney = (value: number) =>
  Math.round((value + Number.EPSILON) * 100) / 100;

function emptyQuote(subtotal: number): PromotionQuote {
  return {
    promotionId: null,
    promotionCode: null,
    promotionName: null,
    promotionKind: null,
    firstOrderOnly: false,
    discountAmount: 0,
    subtotalAmount: subtotal,
    payableAmount: subtotal,
    description: null,
    minimumOrderAmount: 0,
    discountType: null,
    discountValue: 0,
    maximumDiscountAmount: null,
  };
}

/**
 * Returns every currently eligible promotion for this customer and cart.
 * Coupon and automatic promotions are presented as alternatives; they never stack.
 */
export async function getEligiblePromotionQuotes(
  admin: SupabaseClient,
  userId: string,
  subtotalAmount: number,
): Promise<PromotionQuote[]> {
  const subtotal = roundMoney(subtotalAmount);
  if (!Number.isFinite(subtotal) || subtotal <= 0) {
    throw new Error("Your cart total is invalid.");
  }

  const { data, error } = await admin
    .from("promotions")
    .select("id,code,name,description,promotion_kind,discount_type,discount_value,minimum_order_amount,maximum_discount_amount,usage_limit,per_customer_limit,starts_at,ends_at,first_order_only,active")
    .eq("active", true);

  if (error) throw new Error("Unable to validate current offers. Please retry.");

  const rows = (data || []) as PromotionRow[];
  if (!rows.length) return [];

  const [{ data: priorOrders, error: ordersError }, { data: redemptions, error: redemptionError }] =
    await Promise.all([
      admin.from("orders").select("id").eq("user_id", userId).neq("status", "CANCELLED").limit(1),
      admin.from("promotion_redemptions").select("promotion_id,user_id"),
    ]);

  if (ordersError) throw new Error("Unable to validate offer eligibility.");
  if (redemptionError) throw new Error("Unable to validate offer usage limits.");

  const hasPriorOrder = (priorOrders || []).length > 0;
  const redemptionRows = (redemptions || []) as RedemptionRow[];
  const now = Date.now();
  const eligible: PromotionQuote[] = [];

  for (const promotion of rows) {
    if (promotion.starts_at && new Date(promotion.starts_at).getTime() > now) continue;
    if (promotion.ends_at && new Date(promotion.ends_at).getTime() <= now) continue;
    if (subtotal < Number(promotion.minimum_order_amount || 0)) continue;
    if (promotion.first_order_only && hasPriorOrder) continue;

    const uses = redemptionRows.filter((row) => row.promotion_id === promotion.id);
    if (promotion.usage_limit != null && uses.length >= promotion.usage_limit) continue;
    if (uses.filter((row) => row.user_id === userId).length >= promotion.per_customer_limit) continue;

    let discount = promotion.discount_type === "PERCENTAGE"
      ? subtotal * Number(promotion.discount_value) / 100
      : Number(promotion.discount_value);

    if (promotion.maximum_discount_amount != null) {
      discount = Math.min(discount, Number(promotion.maximum_discount_amount));
    }

    discount = roundMoney(Math.min(discount, subtotal));
    if (discount <= 0 || subtotal - discount < 1) continue;

    eligible.push({
      promotionId: promotion.id,
      promotionCode: promotion.promotion_kind === "COUPON" ? promotion.code : null,
      promotionName: promotion.name,
      promotionKind: promotion.promotion_kind,
      firstOrderOnly: promotion.first_order_only,
      discountAmount: discount,
      subtotalAmount: subtotal,
      payableAmount: roundMoney(subtotal - discount),
      description: promotion.description,
      minimumOrderAmount: Number(promotion.minimum_order_amount || 0),
      discountType: promotion.discount_type,
      discountValue: Number(promotion.discount_value),
      maximumDiscountAmount: promotion.maximum_discount_amount == null
        ? null
        : Number(promotion.maximum_discount_amount),
    });
  }

  // Most valuable eligible offer appears first; customer still chooses one.
  return eligible.sort((a, b) => b.discountAmount - a.discountAmount);
}

/**
 * Recomputes the selected offer on the server. Client-supplied discount values
 * are never accepted. With no selection, the cart receives no discount.
 */
export async function calculatePromotionQuote(
  admin: SupabaseClient,
  userId: string,
  subtotalAmount: number,
  couponCode?: string | null,
  selectedPromotionId?: string | null,
): Promise<PromotionQuote> {
  const subtotal = roundMoney(subtotalAmount);
  const normalizedCode = String(couponCode || "").trim().toUpperCase();
  const options = await getEligiblePromotionQuotes(admin, userId, subtotal);

  if (selectedPromotionId) {
    const selected = options.find((offer) => offer.promotionId === selectedPromotionId);
    if (!selected) {
      throw new Error("This offer is no longer eligible for your cart. Please refresh and select another offer.");
    }
    if (normalizedCode && selected.promotionCode !== normalizedCode) {
      throw new Error("The selected offer does not match the entered coupon code.");
    }
    return selected;
  }

  if (normalizedCode) {
    const selected = options.find((offer) => offer.promotionCode?.toUpperCase() === normalizedCode);
    if (!selected) {
      throw new Error("This coupon is invalid, unavailable, or your cart does not meet its eligibility requirements.");
    }
    return selected;
  }

  return emptyQuote(subtotal);
}
