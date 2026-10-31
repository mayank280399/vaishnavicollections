import { createHmac } from "node:crypto";
import { NextResponse } from "next/server";
import Razorpay from "razorpay";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { calculatePromotionQuote } from "@/lib/promotions/engine";

type CheckoutBody = {
  items?: Array<{ productId?: string; product_id?: string; quantity?: number }>;
  customerName?: string;
  customerPhone?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  notes?: string;
  saveCustomerDetails?: boolean;
  couponCode?: string;
};

function safeError(error: unknown) {
  if (error instanceof Error) return error.message;
  return "Unknown provider error";
}

function getRazorpay() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    throw new Error("Razorpay server credentials are missing. Configure RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in the active deployment environment.");
  }
  return { client: new Razorpay({ key_id: keyId, key_secret: keySecret }), keyId, keySecret };
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ success: false, error: "Please sign in before making a payment." }, { status: 401 });
    }

    let body: CheckoutBody;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ success: false, error: "Invalid checkout request." }, { status: 400 });
    }

    const customerName = String(body.customerName || "").trim();
    const customerPhone = String(body.customerPhone || "").replace(/\D/g, "");
    const addressLine1 = String(body.addressLine1 || "").trim();
    const addressLine2 = String(body.addressLine2 || "").trim();
    const city = String(body.city || "").trim();
    const state = String(body.state || "").trim();
    const postalCode = String(body.postalCode || "").trim();
    const country = String(body.country || "India").trim();
    const notes = String(body.notes || "").trim();

    if (!customerName || !/^[6-9]\d{9}$/.test(customerPhone) || !addressLine1 || !city || !state || !/^\d{6}$/.test(postalCode)) {
      return NextResponse.json({ success: false, error: "Please provide a valid name, Indian mobile number and complete delivery address." }, { status: 400 });
    }

    const requestedItems = Array.isArray(body.items) ? body.items : [];
    const quantities = new Map<string, number>();
    for (const item of requestedItems) {
      const productId = String(item.productId || item.product_id || "").trim();
      const quantity = Number(item.quantity);
      if (!productId || !Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
        return NextResponse.json({ success: false, error: "Your cart contains an invalid item or quantity. Please review your cart." }, { status: 400 });
      }
      quantities.set(productId, (quantities.get(productId) || 0) + quantity);
    }
    if (!quantities.size) {
      return NextResponse.json({ success: false, error: "Your cart is empty." }, { status: 400 });
    }
    const productIds = [...quantities.keys()];
    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("id,name,product_title,slug,selling_price,online_price,online_enabled,visibility,stock_quantity")
      .in("id", productIds);
    if (productsError) {
      console.error("Razorpay checkout product lookup failed:", productsError);
      return NextResponse.json({ success: false, error: "We couldn't validate your cart. Please retry." }, { status: 500 });
    }
    if (!products || products.length !== productIds.length) {
      return NextResponse.json({ success: false, error: "One or more products are no longer available. Refresh your cart." }, { status: 409 });
    }

    const intentItems: Array<{ product_id: string; name: string; slug: string; unit_price: number; quantity: number }> = [];
    let total = 0;
    for (const product of products) {
      if (product.visibility !== "PUBLISHED" && product.visibility !== "PUBLIC") {
        return NextResponse.json({ success: false, error: "One or more products are no longer available for online purchase." }, { status: 409 });
      }
      const unitPrice = product.online_enabled && product.online_price != null && Number(product.online_price) > 0
        ? Number(product.online_price)
        : Number(product.selling_price);
      const quantity = quantities.get(product.id)!;
      if (!Number.isFinite(unitPrice) || unitPrice <= 0) {
        return NextResponse.json({ success: false, error: "A product in your cart has an invalid price. Please contact the store." }, { status: 409 });
      }
      if (typeof product.stock_quantity === "number" && product.stock_quantity < quantity) {
        return NextResponse.json({ success: false, error: `${product.product_title || product.name} does not have enough stock for the selected quantity.` }, { status: 409 });
      }
      total += unitPrice * quantity;
      intentItems.push({ product_id: product.id, name: product.product_title || product.name, slug: product.slug, unit_price: unitPrice, quantity });
    }

    const subtotalAmount = Math.round((total + Number.EPSILON) * 100) / 100;
    const quote = await calculatePromotionQuote(createAdminClient(), user.id, subtotalAmount, body.couponCode || null);
    const amountPaise = Math.round(quote.payableAmount * 100);
    if (!Number.isSafeInteger(amountPaise) || amountPaise < 100) {
      return NextResponse.json({ success: false, error: "The checkout total is invalid. Please review your cart." }, { status: 400 });
    }

    const { client: razorpay, keyId } = getRazorpay();
    let razorpayOrder;
    try {
      razorpayOrder = await razorpay.orders.create({
        amount: amountPaise,
        currency: "INR",
        receipt: `vc_${Date.now()}_${user.id.slice(0, 8)}`.slice(0, 40),
        notes: { vc_user_id: user.id },
      });
    } catch (error) {
      console.error("Razorpay API order creation failed:", {
        message: safeError(error),
        statusCode: (error as { statusCode?: number })?.statusCode,
        errorCode: (error as { error?: { code?: string; description?: string } })?.error?.code,
        errorDescription: (error as { error?: { description?: string } })?.error?.description,
      });
      return NextResponse.json({
        success: false,
        error: "Razorpay could not initialize this payment. Please retry; if it continues, contact support.",
        ...(process.env.NODE_ENV !== "production" ? { debug: safeError(error) } : {}),
      }, { status: 502 });
    }

    const admin = createAdminClient();
    const { data: checkoutIntent, error: intentError } = await admin.from("razorpay_checkout_intents").insert({
      user_id: user.id,
      razorpay_order_id: razorpayOrder.id,
      amount_paise: amountPaise,
      subtotal_amount: subtotalAmount,
      discount_amount: quote.discountAmount,
      promotion_id: quote.promotionId,
      promotion_code: quote.promotionCode,
      promotion_name: quote.promotionName,
      currency: "INR",
      customer_name: customerName,
      customer_phone: customerPhone,
      address_line1: addressLine1,
      address_line2: addressLine2 || null,
      city,
      state,
      postal_code: postalCode,
      country,
      customer_notes: notes || null,
      save_customer_details: body.saveCustomerDetails === true,
      items: intentItems,
    }).select("id").single();
    if (intentError || !checkoutIntent) {
      console.error("Razorpay checkout intent persistence failed:", intentError);
      return NextResponse.json({ success: false, error: "Payment was initialized but checkout details could not be saved. Please retry; no store order has been created." }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      checkoutIntentId: checkoutIntent.id,
      razorpayOrderId: razorpayOrder.id,
      amount: amountPaise,
      currency: "INR",
      keyId,
      customer: { name: customerName, phone: customerPhone, email: user.email || "" },
      pricing: { subtotal: quote.subtotalAmount, discount: quote.discountAmount, total: quote.payableAmount, promotionName: quote.promotionName, promotionCode: quote.promotionCode },
    });
  } catch (error) {
    console.error("Razorpay create-order route failed:", {
      message: safeError(error),
      statusCode: (error as { statusCode?: number })?.statusCode,
      errorCode: (error as { error?: { code?: string } })?.error?.code,
    });
    const message = safeError(error);
    const configError = /Razorpay server credentials are missing|SUPABASE_SERVICE_ROLE_KEY|NEXT_PUBLIC_SUPABASE_URL/.test(message);
    return NextResponse.json({
      success: false,
      error: configError ? message : "Unable to prepare secure checkout. Please retry.",
      ...(process.env.NODE_ENV !== "production" ? { debug: message } : {}),
    }, { status: configError ? 500 : 500 });
  }
}
