import { NextResponse } from "next/server";
import Razorpay from "razorpay";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(
  request: Request
) {
  try {
    // --------------------------------------------------
    // 1. Authenticate customer
    // --------------------------------------------------

    const supabase =
      await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Please sign in before making a payment.",
        },
        { status: 401 }
      );
    }

    // --------------------------------------------------
    // 2. Read order ID
    // --------------------------------------------------

    const body =
      await request.json();

    const orderId =
      typeof body?.orderId === "string"
        ? body.orderId.trim()
        : "";

    if (!orderId) {
      return NextResponse.json(
        {
          success: false,
          error: "Order ID is required.",
        },
        { status: 400 }
      );
    }

    // --------------------------------------------------
    // 3. Load our order
    //
    // IMPORTANT:
    // Amount is always taken from our database.
    // We do not trust the browser's amount.
    // --------------------------------------------------

    const {
      data: order,
      error: orderError,
    } = await supabase
      .from("orders")
      .select(
        `
          id,
          user_id,
          order_number,
          status,
          payment_status,
          total_amount,
          razorpay_order_id
        `
      )
      .eq("id", orderId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (orderError) {
      console.error(
        "Load order error:",
        orderError
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Unable to load the order.",
        },
        { status: 500 }
      );
    }

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          error: "Order not found.",
        },
        { status: 404 }
      );
    }

    // --------------------------------------------------
    // 4. Make sure order is payable
    // --------------------------------------------------

    if (
      order.status !== "PENDING" ||
      order.payment_status !== "PENDING"
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "This order is no longer available for payment.",
        },
        { status: 400 }
      );
    }

    // --------------------------------------------------
    // 5. Reuse existing Razorpay order
    // --------------------------------------------------

    if (order.razorpay_order_id) {
      return NextResponse.json({
        success: true,
        razorpayOrderId:
          order.razorpay_order_id,
        amount:
          Math.round(
            Number(order.total_amount) *
              100
          ),
        currency: "INR",
        orderId: order.id,
        orderNumber:
          order.order_number,
      });
    }

    // --------------------------------------------------
    // 6. Validate order amount
    // --------------------------------------------------

    const totalAmount =
      Number(order.total_amount);

    if (
      !Number.isFinite(totalAmount) ||
      totalAmount <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid order amount.",
        },
        { status: 400 }
      );
    }

    const amountInPaise =
      Math.round(
        totalAmount * 100
      );

    // --------------------------------------------------
    // 7. Create Razorpay order
    // --------------------------------------------------

    const razorpayOrder =
      await razorpay.orders.create({
        amount: amountInPaise,
        currency: "INR",
        receipt:
          order.order_number,
        notes: {
          vc_order_id: order.id,
          vc_order_number:
            order.order_number,
        },
      });

    // --------------------------------------------------
    // 8. Save Razorpay order ID
    //
    // Use service_role because the normal customer
    // client may not have permission to update this
    // server-controlled field.
    // --------------------------------------------------

    const adminSupabase =
      createAdminClient();

    const {
      error: updateError,
    } = await adminSupabase
      .from("orders")
      .update({
        razorpay_order_id:
          razorpayOrder.id,
        updated_at:
          new Date().toISOString(),
      })
      .eq("id", order.id)
      .eq("user_id", user.id)
      .eq(
        "payment_status",
        "PENDING"
      );

    if (updateError) {
      console.error(
        "Save Razorpay order ID error:",
        updateError
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Unable to prepare the payment.",
        },
        { status: 500 }
      );
    }

    // --------------------------------------------------
    // 9. Return payment information
    // --------------------------------------------------

    return NextResponse.json({
      success: true,
      razorpayOrderId:
        razorpayOrder.id,
      amount: amountInPaise,
      currency: "INR",
      orderId: order.id,
      orderNumber:
        order.order_number,
    });
  } catch (error) {
    console.error(
      "Razorpay create order error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "Unable to create the payment order.",
      },
      { status: 500 }
    );
  }
}