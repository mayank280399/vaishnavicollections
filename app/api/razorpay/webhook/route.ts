import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import Razorpay from "razorpay";

import { createAdminClient } from "@/lib/supabase/admin";
import { notifyOrderPaymentReceived } from "@/lib/notifications/order-events";

function paymentMethodFor(method: string | undefined) {
  switch (String(method || "").toLowerCase()) {
    case "upi": return "UPI";
    case "card": return "CARD";
    case "netbanking": return "BANK_TRANSFER";
    case "emi": return "CARD";
    case "wallet":
    case "paylater":
    default: return "OTHER";
  }
}

export async function POST(request: Request) {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const signature = request.headers.get("x-razorpay-signature");
  if (!webhookSecret || !signature) {
    return NextResponse.json({ error: "Webhook is not configured." }, { status: 400 });
  }

  const rawBody = await request.text();
  const expectedSignature = createHmac("sha256", webhookSecret).update(rawBody).digest("hex");
  const expected = Buffer.from(expectedSignature, "hex");
  const received = Buffer.from(signature, "hex");
  if (expected.length !== received.length || !timingSafeEqual(expected, received)) {
    return NextResponse.json({ error: "Invalid webhook signature." }, { status: 400 });
  }

  try {
    const event = JSON.parse(rawBody) as {
      event?: string;
      payload?: {
        payment?: {
          entity?: {
            id?: string;
            order_id?: string;
            amount?: number;
            currency?: string;
            status?: string;
            method?: string;
          };
        };
      };
    };

    if (event.event !== "payment.captured") {
      return NextResponse.json({ received: true, ignored: true });
    }

    const payment = event.payload?.payment?.entity;
    if (
      !payment?.id ||
      !payment.order_id ||
      payment.status !== "captured" ||
      payment.currency !== "INR" ||
      !Number.isFinite(Number(payment.amount))
    ) {
      return NextResponse.json({ error: "Invalid captured payment payload." }, { status: 400 });
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) {
      return NextResponse.json({ error: "Razorpay is not configured." }, { status: 500 });
    }

    // Fetch payment from Razorpay as an additional verification step.
    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
    const verifiedPayment = await razorpay.payments.fetch(payment.id);
    if (
      verifiedPayment.order_id !== payment.order_id ||
      verifiedPayment.status !== "captured" ||
      verifiedPayment.currency !== "INR"
    ) {
      return NextResponse.json({ error: "Payment could not be verified." }, { status: 409 });
    }

    const adminSupabase = createAdminClient();
    const { data: order, error: orderError } = await adminSupabase
      .from("orders")
      .select("id, total_amount, payment_status, status")
      .eq("razorpay_order_id", payment.order_id)
      .maybeSingle();

    if (orderError) {
      console.error("Razorpay webhook order lookup failed:", orderError);
      return NextResponse.json({ error: "Unable to load the order." }, { status: 500 });
    }
    if (!order) {
      // New checkout creates a payment intent first and creates the VC order
      // only after the captured payment is verified in the browser callback.
      const { data: intent, error: intentError } = await adminSupabase
        .from("razorpay_checkout_intents")
        .select("id, amount_paise, status, razorpay_payment_id")
        .eq("razorpay_order_id", payment.order_id)
        .maybeSingle();

      if (intentError) {
        console.error("Razorpay webhook checkout-intent lookup failed:", intentError);
        return NextResponse.json({ error: "Unable to load checkout details." }, { status: 500 });
      }
      if (!intent) {
        // Acknowledge unrelated payments so Razorpay doesn't retry indefinitely.
        return NextResponse.json({ received: true, unmatched: true });
      }
      if (Number(verifiedPayment.amount) !== Number(intent.amount_paise)) {
        console.error("Razorpay webhook amount mismatch for checkout intent:", intent.id);
        return NextResponse.json({ error: "Payment amount does not match checkout." }, { status: 409 });
      }
      if (intent.status === "ORDER_CREATED" || intent.status === "PAID") {
        return NextResponse.json({ received: true, alreadyProcessed: true });
      }
      const { error: intentUpdateError } = await adminSupabase
        .from("razorpay_checkout_intents")
        .update({
          status: "PAID",
          razorpay_payment_id: payment.id,
          updated_at: new Date().toISOString(),
        })
        .eq("id", intent.id)
        .eq("status", "PENDING");
      if (intentUpdateError) {
        console.error("Razorpay webhook could not persist captured payment:", intentUpdateError);
        return NextResponse.json({ error: "Unable to save captured payment." }, { status: 500 });
      }
      // The authenticated verify-payment route finalizes the VC order idempotently
      // when the customer returns from Razorpay Checkout.
      return NextResponse.json({ received: true, checkoutIntentRecorded: true });
    }
    if (order.status === "CANCELLED") {
      console.error("Captured Razorpay payment belongs to a cancelled VC order:", order.id);
      return NextResponse.json({ received: true, reviewRequired: true });
    }

    const expectedAmount = Math.round(Number(order.total_amount) * 100);
    if (Number(verifiedPayment.amount) !== expectedAmount) {
      console.error("Razorpay webhook amount mismatch for order:", order.id);
      return NextResponse.json({ error: "Payment amount does not match the order." }, { status: 409 });
    }

    if (order.payment_status === "PAID") {
      return NextResponse.json({ received: true, alreadyProcessed: true });
    }
    if (order.payment_status !== "PENDING") {
      return NextResponse.json({ received: true, reviewRequired: true });
    }

    const { data: updated, error: updateError } = await adminSupabase
      .from("orders")
      .update({
        payment_method: paymentMethodFor(verifiedPayment.method),
        payment_status: "PAID",
        amount_paid: Number(order.total_amount),
        amount_due: 0,
        updated_at: new Date().toISOString(),
      })
      .eq("id", order.id)
      .eq("payment_status", "PENDING")
      .select("id")
      .maybeSingle();

    if (updateError) {
      console.error("Razorpay webhook failed to update VC order:", updateError);
      return NextResponse.json({ error: "Unable to update order payment status." }, { status: 500 });
    }

    if (updated) {
      try {
        await notifyOrderPaymentReceived(order.id);
      } catch (notificationError) {
        console.error("Webhook payment notification failed:", notificationError);
      }
    }

    return NextResponse.json({ received: true, processed: Boolean(updated) });
  } catch (error) {
    console.error("Razorpay webhook error:", error);
    return NextResponse.json({ error: "Unable to process Razorpay webhook." }, { status: 500 });
  }
}
