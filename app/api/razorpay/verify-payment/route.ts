import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import Razorpay from "razorpay";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { notifyOrderPaymentReceived } from "@/lib/notifications/order-events";

export async function POST(request: Request) {
  try {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) {
      return NextResponse.json(
        { success: false, error: "Razorpay is not configured." },
        { status: 500 },
      );
    }

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "Please sign in to verify this payment." },
        { status: 401 },
      );
    }

    const body = await request.json();
    const orderId = typeof body?.orderId === "string" ? body.orderId.trim() : "";
    const razorpayOrderId = typeof body?.razorpay_order_id === "string" ? body.razorpay_order_id.trim() : "";
    const razorpayPaymentId = typeof body?.razorpay_payment_id === "string" ? body.razorpay_payment_id.trim() : "";
    const razorpaySignature = typeof body?.razorpay_signature === "string" ? body.razorpay_signature.trim() : "";

    if (!orderId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return NextResponse.json(
        { success: false, error: "Required Razorpay verification details are missing." },
        { status: 400 },
      );
    }

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("id, user_id, order_number, status, payment_status, total_amount, amount_paid, amount_due, razorpay_order_id")
      .eq("id", orderId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (orderError) {
      console.error("Razorpay verification order lookup failed:", orderError);
      return NextResponse.json(
        { success: false, error: "Unable to load this order." },
        { status: 500 },
      );
    }
    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found." },
        { status: 404 },
      );
    }
    if (order.status === "CANCELLED") {
      return NextResponse.json(
        { success: false, error: "This order has been cancelled." },
        { status: 409 },
      );
    }
    if (order.razorpay_order_id !== razorpayOrderId) {
      return NextResponse.json(
        { success: false, error: "The Razorpay order does not match this order." },
        { status: 400 },
      );
    }

    const expectedSignature = createHmac("sha256", keySecret)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex");
    const expected = Buffer.from(expectedSignature, "hex");
    const received = Buffer.from(razorpaySignature, "hex");
    if (expected.length !== received.length || !timingSafeEqual(expected, received)) {
      return NextResponse.json(
        { success: false, error: "Payment signature validation failed." },
        { status: 400 },
      );
    }

    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
    const payment = await razorpay.payments.fetch(razorpayPaymentId);
    if (
      payment.order_id !== razorpayOrderId ||
      payment.currency !== "INR" ||
      Number(payment.amount) !== Math.round(Number(order.total_amount) * 100) ||
      payment.status !== "captured"
    ) {
      return NextResponse.json(
        { success: false, error: "Razorpay has not confirmed a captured payment for the exact order amount yet." },
        { status: 409 },
      );
    }

    if (order.payment_status === "PAID") {
      return NextResponse.json({ success: true, alreadyVerified: true });
    }
    if (order.payment_status !== "PENDING") {
      return NextResponse.json(
        { success: false, error: "This order is not in a payable state." },
        { status: 409 },
      );
    }

    const method = String(payment.method || "").toLowerCase();
    const paymentMethod =
      method === "upi" ? "UPI" :
      method === "card" ? "CARD" :
      method === "netbanking" ? "BANK_TRANSFER" :
      method === "wallet" ? "OTHER" :
      method === "emi" ? "CARD" :
      method === "paylater" ? "OTHER" :
      "OTHER";

    const adminSupabase = createAdminClient();
    const { data: updatedOrder, error: updateError } = await adminSupabase
      .from("orders")
      .update({
        payment_method: paymentMethod,
        payment_status: "PAID",
        amount_paid: Number(order.total_amount),
        amount_due: 0,
        updated_at: new Date().toISOString(),
      })
      .eq("id", order.id)
      .eq("user_id", user.id)
      .eq("payment_status", "PENDING")
      .select("id")
      .maybeSingle();

    if (updateError) {
      console.error("Razorpay verified payment could not be saved:", updateError);
      return NextResponse.json(
        { success: false, error: "Payment was captured but order status could not be updated. Please contact support with your order number." },
        { status: 500 },
      );
    }

    if (!updatedOrder) {
      const { data: latestOrder } = await adminSupabase
        .from("orders")
        .select("payment_status")
        .eq("id", order.id)
        .eq("user_id", user.id)
        .maybeSingle();

      if (latestOrder?.payment_status === "PAID") {
        return NextResponse.json({ success: true, alreadyVerified: true });
      }
      return NextResponse.json(
        { success: false, error: "Payment verification is being processed. Refresh the order page shortly." },
        { status: 409 },
      );
    }

    try {
      await notifyOrderPaymentReceived(order.id);
    } catch (notificationError) {
      console.error("Verified-payment notification failed:", notificationError);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Razorpay payment verification error:", error);
    return NextResponse.json(
      { success: false, error: "Unable to verify the payment right now. Please retry or contact support." },
      { status: 500 },
    );
  }
}
