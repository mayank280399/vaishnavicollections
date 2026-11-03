import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  calculatePromotionQuote,
  getEligiblePromotionQuotes,
} from "@/lib/promotions/engine";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ success: false, error: "Please sign in to view available offers." }, { status: 401 });
    }

    const body = await request.json();
    const items = Array.isArray(body?.items) ? body.items : [];
    const quantities = new Map<string, number>();

    for (const item of items) {
      const id = String(item.productId || item.product_id || "").trim();
      const quantity = Number(item.quantity);
      if (!id || !Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
        return NextResponse.json({ success: false, error: "Invalid cart item." }, { status: 400 });
      }
      quantities.set(id, (quantities.get(id) || 0) + quantity);
    }

    if (!quantities.size) {
      return NextResponse.json({ success: false, error: "Your cart is empty." }, { status: 400 });
    }

    const { data: products, error } = await supabase.from("products")
      .select("id,selling_price,online_price,online_enabled,visibility")
      .in("id", [...quantities.keys()]);

    if (error || !products || products.length !== quantities.size) {
      return NextResponse.json({ success: false, error: "Unable to validate your cart. Refresh and retry." }, { status: 409 });
    }

    let subtotal = 0;
    for (const product of products) {
      if (product.visibility !== "PUBLISHED" && product.visibility !== "PUBLIC") {
        return NextResponse.json({ success: false, error: "A product is no longer available." }, { status: 409 });
      }
      const price = product.online_enabled && product.online_price != null && Number(product.online_price) > 0
        ? Number(product.online_price)
        : Number(product.selling_price);
      subtotal += price * (quantities.get(product.id) || 0);
    }

    const admin = createAdminClient();
    const eligibleOffers = await getEligiblePromotionQuotes(admin, user.id, subtotal);
    const selectedPromotionId = typeof body?.selectedPromotionId === "string"
      ? body.selectedPromotionId
      : null;
    const couponCode = typeof body?.couponCode === "string" ? body.couponCode : null;

    const quote = selectedPromotionId || couponCode
      ? await calculatePromotionQuote(admin, user.id, subtotal, couponCode, selectedPromotionId)
      : null;

    return NextResponse.json({
      success: true,
      offers: eligibleOffers,
      quote,
      subtotalAmount: Math.round((subtotal + Number.EPSILON) * 100) / 100,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unable to validate offers.",
    }, { status: 400 });
  }
}
