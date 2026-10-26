
"use server";

import { createClient } from "@/lib/supabase/server";

import type {
  CreateOrderInput,
  PaymentMethod,
} from "@/lib/checkout/types";

/**
 * Creates a pending online order in Supabase before Razorpay Checkout.
 *
 * The existing create_online_order RPC expects UPI for online orders,
 * so the order is created pending and the verified Razorpay payment
 * method/status is persisted by the payment verification endpoint.
 *
 * Customer-detail persistence:
 * - Only attempted when saveCustomerDetails is true.
 * - Updates the profile belonging to the authenticated user.
 * - Updates only the customer record linked to that profile.
 * - Never creates or merges customer records automatically.
 * - Persistence failures do not prevent order creation.
 *
 * This action never marks an order as paid.
 */
export async function createOrder(input: CreateOrderInput) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      success: false,
      error: "Please sign in before placing your order.",
    };
  }

  try {
    /*
     * Validate the payment method on the server.
     */
    if (input.paymentMethod !== "UPI") {
      return {
        success: false,
        error: "Please select Razorpay as your payment method.",
      };
    }

    /*
     * Validate the selected payment option.
     */
    if (input.paymentOption !== "razorpay_full") {
      return {
        success: false,
        error: "Please select a valid UPI payment option.",
      };
    }

    /*
     * Prepare and validate reusable customer details.
     *
     * These details are optional for the order itself.
     * Their persistence must never prevent order creation.
     */
    if (input.saveCustomerDetails === true) {
      const customerName = input.customerName.trim();
      const customerPhone = input.customerPhone.replace(/\D/g, "");
      const addressLine1 = input.addressLine1.trim();
      const addressLine2 = input.addressLine2?.trim() || null;
      const city = input.city.trim();
      const state = input.state.trim();
      const postalCode = input.postalCode.replace(/\D/g, "");

      const validCustomerDetails =
        customerName.length > 0 &&
        /^[6-9]\d{9}$/.test(customerPhone) &&
        addressLine1.length > 0 &&
        city.length > 0 &&
        state.length > 0 &&
        /^\d{6}$/.test(postalCode);

      if (!validCustomerDetails) {
        console.warn(
          "Checkout: reusable customer details were not saved because the details were incomplete or invalid.",
        );
      } else {
        /*
         * Update the profile associated with the authenticated user.
         *
         * We deliberately update by user.id, never by email.
         * This avoids accidentally changing another account when
         * duplicate customer email records exist.
         */
        try {
          const { data: savedProfile, error: profileError } =
            await supabase
              .from("profiles")
              .update({
                full_name: customerName,
                phone: customerPhone,
              })
              .eq("id", user.id)
              .select("id")
              .maybeSingle();

          if (profileError) {
            console.error(
              "Checkout profile save error:",
              profileError,
            );
          } else if (!savedProfile) {
            console.warn(
              "Checkout: no profile was updated for the authenticated user. Continuing with order creation.",
            );
          }
        } catch (error) {
          console.error(
            "Unexpected checkout profile save error:",
            error,
          );
        }

        /*
         * Update only the customer record explicitly linked
         * to this authenticated profile.
         *
         * Do not fall back to email matching: duplicate email
         * records must not cause an unrelated record to change.
         */
        try {
          const { data: customer, error: customerLookupError } =
            await supabase
              .from("customers")
              .select("id")
              .eq("profile_id", user.id)
              .maybeSingle();

          if (customerLookupError) {
            console.error(
              "Checkout customer lookup error:",
              customerLookupError,
            );
          } else if (!customer) {
            console.warn(
              "Checkout: no customer record is linked to the authenticated profile. No customer record was created automatically.",
            );
          } else {
            const { data: savedCustomer, error: customerSaveError } =
              await supabase
                .from("customers")
                .update({
                  display_name: customerName,
                  phone: customerPhone,
                  address_line1: addressLine1,
                  address_line2: addressLine2,
                  city,
                  state,
                  postal_code: postalCode,
                })
                .eq("id", customer.id)
                .eq("profile_id", user.id)
                .select("id")
                .maybeSingle();

            if (customerSaveError) {
              console.error(
                "Checkout customer save error:",
                customerSaveError,
              );
            } else if (!savedCustomer) {
              console.warn(
                "Checkout: no customer record was updated for the authenticated profile.",
              );
            }
          }
        } catch (error) {
          console.error(
            "Unexpected checkout customer save error:",
            error,
          );
        }
      }
    }

    /*
     * Convert the frontend payment option to the database value.
     */
    const paymentPlan = "FULL" as const;

    /*
     * Create the order using the existing database RPC.
     *
     * The RPC remains responsible for validating the cart,
     * calculating prices, copying order items and creating
     * the pending order. This action never marks an order paid.
     */
    const { data, error } = await supabase.rpc(
      "create_online_order",
      {
        p_customer_name: input.customerName.trim(),

        p_customer_phone: input.customerPhone.trim(),

        p_shipping_address_line1: input.addressLine1.trim(),

        p_shipping_address_line2:
          input.addressLine2?.trim() || "",

        p_shipping_city: input.city.trim(),

        p_shipping_state: input.state.trim(),

        p_shipping_postal_code: input.postalCode.trim(),

        p_shipping_country: input.country?.trim() || "India",

        p_notes: input.notes?.trim() || "",

        p_payment_method: "UPI" satisfies PaymentMethod,

        p_payment_plan: paymentPlan,

        // Customer details have already been handled above.
        p_save_customer_details: false,
      },
    );

    if (error) {
      console.error("Create order error:", error);

      return {
        success: false,
        error:
          error.message ||
          "Unable to place your order. Please try again.",
      };
    }

    if (!data) {
      return {
        success: false,
        error: "The order could not be created. Please try again.",
      };
    }

    return {
      success: true,
      orderId: data as string,
      paymentOption: input.paymentOption,
      paymentPlan,
    };
  } catch (error) {
    console.error("Unexpected create order error:", error);

    return {
      success: false,
      error: "Something went wrong while placing your order.",
    };
  }
}
