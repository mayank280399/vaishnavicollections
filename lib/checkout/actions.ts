"use server";

import { createClient } from "@/lib/supabase/server";

import type {
  CreateOrderInput,
  PaymentMethod,
} from "@/lib/checkout/types";

/**
 * Creates an online order in Supabase.
 *
 * Current payment flow:
 * - Full UPI
 * - Partial UPI
 *
 * Database representation:
 * - payment_method = "UPI"
 * - payment_plan = "FULL" | "PARTIAL"
 *
 * IMPORTANT:
 * This action only creates the order.
 * It does NOT mark the order as paid.
 *
 * Payment is verified separately after the customer
 * completes the UPI payment.
 */
export async function createOrder(
  input: CreateOrderInput,
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      error: "Please sign in before placing your order.",
    };
  }

  try {
    /*
     * --------------------------------------------------------
     * Validate the current checkout payment method.
     *
     * For the current ecommerce flow, only UPI is accepted.
     *
     * We intentionally validate this on the server as well
     * as the frontend so a client cannot submit an unsupported
     * payment method.
     * --------------------------------------------------------
     */

    if (input.paymentMethod !== "UPI") {
      return {
        success: false,
        error:
          "Please select UPI as your payment method.",
      };
    }

    /*
     * --------------------------------------------------------
     * Validate the checkout payment option.
     *
     * Frontend values:
     *   upi_full
     *   upi_partial
     *
     * Database values:
     *   FULL
     *   PARTIAL
     * --------------------------------------------------------
     */

    if (
      input.paymentOption !== "upi_full" &&
      input.paymentOption !== "upi_partial"
    ) {
      return {
        success: false,
        error:
          "Please select a valid UPI payment option.",
      };
    }

    /*
     * Convert the frontend payment option into the
     * persistent database payment_plan value.
     */
    const paymentPlan =
      input.paymentOption === "upi_partial"
        ? "PARTIAL"
        : "FULL";

    /*
     * --------------------------------------------------------
     * Create the order.
     *
     * The database RPC:
     *
     * - authenticates the customer
     * - validates the cart
     * - creates the order number
     * - copies cart items
     * - calculates prices
     * - calculates total
     * - stores payment_plan
     * - sets payment_status = PENDING
     * - sets amount_paid = 0
     * - sets amount_due = total_amount
     *
     * It does NOT:
     * - mark the order as paid
     * - verify a UPI payment
     * - clear the cart
     *
     * The customer must pay separately and the payment
     * must be verified by the shop.
     * --------------------------------------------------------
     */

    const { data, error } = await supabase.rpc(
      "create_online_order",
      {
        p_customer_name:
          input.customerName.trim(),

        p_customer_phone:
          input.customerPhone.trim(),

        p_shipping_address_line1:
          input.addressLine1.trim(),

        p_shipping_address_line2:
          input.addressLine2?.trim() || "",

        p_shipping_city:
          input.city.trim(),

        p_shipping_state:
          input.state.trim(),

        p_shipping_postal_code:
          input.postalCode.trim(),

        p_shipping_country:
          input.country?.trim() || "India",

        p_notes:
          input.notes?.trim() || "",

        p_payment_method:
          "UPI" satisfies PaymentMethod,

        /*
         * Persist the customer's selected payment plan.
         */
        p_payment_plan:
          paymentPlan,

        p_save_customer_details:
          input.saveCustomerDetails === true,
      },
    );

    if (error) {
      console.error(
        "Create order error:",
        error,
      );

      return {
        success: false,
        error:
          error.message ||
          "Unable to place your order. Please try again.",
      };
    }

    /*
     * The RPC returns the UUID of the newly created order.
     *
     * The customer-facing order number will be fetched from
     * the orders table on the order/payment page.
     */

    if (!data) {
      return {
        success: false,
        error:
          "The order could not be created. Please try again.",
      };
    }

    return {
      success: true,

      /*
       * UUID of the newly created order.
       */
      orderId: data as string,

      /*
       * Keep returning the frontend payment option so the
       * checkout page can continue displaying the appropriate
       * payment instructions.
       */
      paymentOption: input.paymentOption,

      /*
       * Also return the persistent database representation.
       *
       * This is useful for future checkout/payment UI changes
       * without having to convert the value again.
       */
      paymentPlan,
    };
  } catch (error) {
    console.error(
      "Unexpected create order error:",
      error,
    );

    return {
      success: false,
      error:
        "Something went wrong while placing your order.",
    };
  }
}