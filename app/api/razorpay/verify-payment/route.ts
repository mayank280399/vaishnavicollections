import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import Razorpay from "razorpay";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { notifyOrderPaymentReceived, notifyStaffNewOrder } from "@/lib/notifications/order-events";

function paymentMethodFor(method: string | undefined) {
  switch (String(method || "").toLowerCase()) {
    case "upi": return "UPI";
    case "card":
    case "emi": return "CARD";
    case "netbanking": return "BANK_TRANSFER";
    default: return "OTHER";
  }
}

export async function POST(request: Request) {
  try {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) {
      return NextResponse.json({ success: false, error: "Razorpay is not configured." }, { status: 500 });
    }

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ success: false, error: "Please sign in to verify this payment." }, { status: 401 });
    }

    const body = await request.json();
    const checkoutIntentId = typeof body?.checkoutIntentId === "string" ? body.checkoutIntentId.trim() : "";
    const razorpayOrderId = typeof body?.razorpay_order_id === "string" ? body.razorpay_order_id.trim() : "";
    const razorpayPaymentId = typeof body?.razorpay_payment_id === "string" ? body.razorpay_payment_id.trim() : "";
    const razorpaySignature = typeof body?.razorpay_signature === "string" ? body.razorpay_signature.trim() : "";

    if (!checkoutIntentId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return NextResponse.json({ success: false, error: "Required Razorpay verification details are missing." }, { status: 400 });
    }

    const admin = createAdminClient();
    const { data: intent, error: intentError } = await admin
      .from("razorpay_checkout_intents")
      .select("*")
      .eq("id", checkoutIntentId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (intentError) {
      console.error("Razorpay checkout intent lookup failed:", intentError);
      return NextResponse.json({ success: false, error: "Unable to load checkout details." }, { status: 500 });
    }
    if (!intent || intent.razorpay_order_id !== razorpayOrderId) {
      return NextResponse.json({ success: false, error: "This payment does not match the checkout session." }, { status: 404 });
    }

    if (intent.status === "ORDER_CREATED" && intent.order_id) {
      return NextResponse.json({ success: true, orderId: intent.order_id, alreadyVerified: true });
    }
    if (intent.status === "CANCELLED") {
      return NextResponse.json({ success: false, error: "This checkout session is no longer payable." }, { status: 409 });
    }

    const expectedSignature = createHmac("sha256", keySecret)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex");
    const expected = Buffer.from(expectedSignature, "hex");
    const received = Buffer.from(razorpaySignature, "hex");
    if (expected.length !== received.length || !timingSafeEqual(expected, received)) {
      return NextResponse.json({ success: false, error: "Payment signature validation failed." }, { status: 400 });
    }

    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
    const payment = await razorpay.payments.fetch(razorpayPaymentId);
    if (
      payment.order_id !== razorpayOrderId ||
      payment.currency !== "INR" ||
      Number(payment.amount) !== Number(intent.amount_paise) ||
      payment.status !== "captured"
    ) {
      return NextResponse.json({ success: false, error: "Razorpay has not confirmed a captured payment for the exact checkout amount yet." }, { status: 409 });
    }

    // The real VC order is deliberately created only after the gateway confirms
    // the captured payment. The existing database RPC validates the cart and
    // creates the order/items; all shipping details come from the server-side intent.
    const { data: createdOrderId, error: createError } = await supabase.rpc("create_online_order", {
      p_customer_name: intent.customer_name,
      p_customer_phone: intent.customer_phone,
      p_shipping_address_line1: intent.address_line1,
      p_shipping_address_line2: intent.address_line2 || "",
      p_shipping_city: intent.city,
      p_shipping_state: intent.state,
      p_shipping_postal_code: intent.postal_code,
      p_shipping_country: intent.country || "India",
      p_notes: intent.customer_notes || "",
      p_payment_method: "UPI",
      p_payment_plan: "FULL",
      p_save_customer_details: false,
    });

    if (createError || !createdOrderId) {
      console.error("Post-payment VC order creation failed:", {
        checkoutIntentId,
        razorpayPaymentId,
        message: createError?.message || "RPC returned no order ID",
        code: createError?.code,
        details: createError?.details,
        hint: createError?.hint,
      });
      // Payment is captured. Keep the intent for safe support/retry rather than
      // pretending checkout failed or creating a second payment.
      await admin.from("razorpay_checkout_intents").update({
        status: "PAID",
        razorpay_payment_id: razorpayPaymentId,
        updated_at: new Date().toISOString(),
      }).eq("id", intent.id).eq("user_id", user.id);
      return NextResponse.json({
        success: false,
        paymentCaptured: true,
        error: "Your payment was received, but we couldn't finish creating the order automatically. Please contact support with your payment ID.",
      }, { status: 500 });
    }

    const { data: order, error: orderLookupError } = await admin
      .from("orders")
      .select("id, order_number, total_amount, payment_status")
      .eq("id", createdOrderId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (orderLookupError || !order) {
      console.error("Post-payment order lookup failed:", orderLookupError);
      await admin.from("razorpay_checkout_intents").update({
        status: "PAID",
        razorpay_payment_id: razorpayPaymentId,
        updated_at: new Date().toISOString(),
      }).eq("id", intent.id).eq("user_id", user.id);
      return NextResponse.json({ success: false, paymentCaptured: true, error: "Payment was received. Order confirmation is taking longer than expected; please contact support with your payment ID." }, { status: 500 });
    }

    const expectedOrderAmount = Math.round(Number(order.total_amount) * 100);
    if (expectedOrderAmount !== Number(intent.amount_paise)) {
      console.error("Captured Razorpay amount differs from created VC order amount:", {
        orderId: order.id, expectedOrderAmount, capturedAmount: intent.amount_paise,
      });
      await admin.from("razorpay_checkout_intents").update({
        status: "PAID",
        razorpay_payment_id: razorpayPaymentId,
        order_id: order.id,
        updated_at: new Date().toISOString(),
      }).eq("id", intent.id).eq("user_id", user.id);
      return NextResponse.json({ success: false, paymentCaptured: true, error: "Payment was received, but the final order total needs review. Please contact support before placing another order." }, { status: 409 });
    }

    const { error: updateError } = await admin.from("orders")
      .update({
        payment_method: paymentMethodFor(payment.method),
        payment_status: "PAID",
        amount_paid: Number(order.total_amount),
        amount_due: 0,
        razorpay_order_id: razorpayOrderId,
        razorpay_payment_id: razorpayPaymentId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", order.id)
      .eq("user_id", user.id)
      .eq("payment_status", "PENDING");

    if (updateError) {
      console.error("Captured payment could not be applied to the VC order:", updateError);
      await admin.from("razorpay_checkout_intents").update({
        status: "PAID", razorpay_payment_id: razorpayPaymentId, order_id: order.id, updated_at: new Date().toISOString(),
      }).eq("id", intent.id).eq("user_id", user.id);
      return NextResponse.json({ success: false, paymentCaptured: true, orderId: order.id, error: "Payment was received, but order confirmation is still processing. Please contact support with your payment ID." }, { status: 500 });
    }

    const { error: intentUpdateError } = await admin.from("razorpay_checkout_intents").update({
      status: "ORDER_CREATED",
      order_id: order.id,
      razorpay_payment_id: razorpayPaymentId,
      updated_at: new Date().toISOString(),
    }).eq("id", intent.id).eq("user_id", user.id);
    if (intentUpdateError) console.error("Checkout intent completion update failed:", intentUpdateError);

    try {
      await notifyStaffNewOrder(order.id);
      await notifyOrderPaymentReceived(order.id);
    } catch (notificationError) {
      console.error("Post-payment order notification failed:", notificationError);
    }

    return NextResponse.json({ success: true, orderId: order.id, orderNumber: order.order_number });
  } catch (error) {
    console.error("Razorpay payment verification / post-payment order creation failed:", error);
    return NextResponse.json({ success: false, error: "Unable to verify payment and finalize the order. If money was deducted, do not pay again; contact support with your Razorpay payment ID." }, { status: 500 });
  }
}
