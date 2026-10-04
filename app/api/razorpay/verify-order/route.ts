import { NextResponse } from "next/server";
import crypto from "crypto";
import Razorpay from "razorpay";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

type VerifyPaymentBody = {
  orderId?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
};

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

function generateSignature(
  razorpayOrderId: string,
  razorpayPaymentId: string
) {
  const secret =
    process.env.RAZORPAY_KEY_SECRET;

  if (!secret) {
    throw new Error(
      "RAZORPAY_KEY_SECRET is not configured."
    );
  }

  return crypto
    .createHmac("sha256", secret)
    .update(
      `${razorpayOrderId}|${razorpayPaymentId}`
    )
    .digest("hex");
}

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
            "Please sign in before verifying payment.",
        },
        { status: 401 }
      );
    }

    // --------------------------------------------------
    // 2. Read request body
    // --------------------------------------------------

    const body =
      (await request.json()) as VerifyPaymentBody;

    const orderId =
      typeof body.orderId === "string"
        ? body.orderId.trim()
        : "";

    const razorpayOrderId =
      typeof body.razorpayOrderId ===
      "string"
        ? body.razorpayOrderId.trim()
        : "";

    const razorpayPaymentId =
      typeof body.razorpayPaymentId ===
      "string"
        ? body.razorpayPaymentId.trim()
        : "";

    const razorpaySignature =
      typeof body.razorpaySignature ===
      "string"
        ? body.razorpaySignature.trim()
        : "";

    if (
      !orderId ||
      !razorpayOrderId ||
      !razorpayPaymentId ||
      !razorpaySignature
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Incomplete payment verification data.",
        },
        { status: 400 }
      );
    }

    // --------------------------------------------------
    // 3. Load our order
    //
    // The amount comes from our database.
    // We never trust an amount sent by the browser.
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
          razorpay_order_id,
          razorpay_payment_id
        `
      )
      .eq("id", orderId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (orderError) {
      console.error(
        "Payment verification order lookup error:",
        orderError
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Unable to verify the order.",
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
    // 4. Idempotency
    // --------------------------------------------------

    if (
      order.payment_status === "PAID" &&
      order.status === "CONFIRMED"
    ) {
      return NextResponse.json({
        success: true,
        alreadyConfirmed: true,
        orderId: order.id,
        orderNumber:
          order.order_number,
      });
    }

    // --------------------------------------------------
    // 5. Order must still be payable
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
    // 6. Verify Razorpay Order ID
    // --------------------------------------------------

    if (
      !order.razorpay_order_id ||
      order.razorpay_order_id !==
        razorpayOrderId
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Payment order verification failed.",
        },
        { status: 400 }
      );
    }

    // --------------------------------------------------
    // 7. Verify HMAC signature
    // --------------------------------------------------

    const expectedSignature =
      generateSignature(
        razorpayOrderId,
        razorpayPaymentId
      );

    if (
      expectedSignature.length !==
      razorpaySignature.length
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Payment signature verification failed.",
        },
        { status: 400 }
      );
    }

    const signaturesMatch =
      crypto.timingSafeEqual(
        Buffer.from(
          expectedSignature,
          "utf8"
        ),
        Buffer.from(
          razorpaySignature,
          "utf8"
        )
      );

    if (!signaturesMatch) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Payment signature verification failed.",
        },
        { status: 400 }
      );
    }

    // --------------------------------------------------
    // 8. Fetch payment directly from Razorpay
    // --------------------------------------------------

    const razorpayPayment =
      await razorpay.payments.fetch(
        razorpayPaymentId
      );

    // --------------------------------------------------
    // 9. Verify payment belongs to our order
    // --------------------------------------------------

    if (
      razorpayPayment.order_id !==
      razorpayOrderId
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Payment does not belong to this order.",
        },
        { status: 400 }
      );
    }

    // --------------------------------------------------
    // 10. Verify payment amount
    // --------------------------------------------------

    const expectedAmount =
      Math.round(
        Number(order.total_amount) * 100
      );

    if (
      !Number.isFinite(expectedAmount) ||
      expectedAmount <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid order amount.",
        },
        { status: 400 }
      );
    }

    if (
      Number(razorpayPayment.amount) !==
      expectedAmount
    ) {
      console.error(
        "Payment amount mismatch:",
        {
          orderId: order.id,
          expectedAmount,
          receivedAmount:
            razorpayPayment.amount,
        }
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Payment amount does not match the order.",
        },
        { status: 400 }
      );
    }

    // --------------------------------------------------
    // 11. Verify currency
    // --------------------------------------------------

    if (
      razorpayPayment.currency !==
      "INR"
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Payment currency is invalid.",
        },
        { status: 400 }
      );
    }

    // --------------------------------------------------
    // 12. Verify payment is captured
    // --------------------------------------------------

    if (
      razorpayPayment.status !==
      "captured"
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Payment has not been captured yet.",
        },
        { status: 400 }
      );
    }

    // --------------------------------------------------
    // 13. Confirm order using service_role
    // --------------------------------------------------

    const adminSupabase =
      createAdminClient();

    const {
      data: confirmation,
      error: confirmationError,
    } =
      await adminSupabase.rpc(
        "confirm_online_order_payment",
        {
          p_order_id: order.id,
          p_razorpay_payment_id:
            razorpayPaymentId,
        }
      );

    if (confirmationError) {
      console.error(
        "Confirm online order payment error:",
        confirmationError
      );

      return NextResponse.json(
        {
          success: false,
          error:
            confirmationError.message ||
            "Payment was received, but we could not complete the order.",
        },
        { status: 500 }
      );
    }

    // --------------------------------------------------
    // 14. Return success
    // --------------------------------------------------

    return NextResponse.json({
      success: true,
      alreadyConfirmed:
        confirmation?.already_confirmed ===
        true,
      orderId: order.id,
      orderNumber:
        confirmation?.order_number ||
        order.order_number,
    });
  } catch (error) {
    console.error(
      "Razorpay payment verification error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "Unable to verify the payment.",
      },
      { status: 500 }
    );
  }
}