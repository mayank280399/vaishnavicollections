"use server";

import { createClient } from "@/lib/supabase/server";

export type PaymentMethod = "CASH" | "RAZORPAY";

export type CreateOrderInput = {
  customerName: string;
  customerPhone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country?: string;
  notes?: string;
  paymentMethod: PaymentMethod;
  saveCustomerDetails?: boolean;
};

export async function createOrder(input: CreateOrderInput) {
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
    const { data, error } = await supabase.rpc(
      "create_online_order",
      {
        p_customer_name: input.customerName.trim(),
        p_customer_phone: input.customerPhone.trim(),
        p_shipping_address_line1:
          input.addressLine1.trim(),
        p_shipping_address_line2:
          input.addressLine2?.trim() || "",
        p_shipping_city: input.city.trim(),
        p_shipping_state: input.state.trim(),
        p_shipping_postal_code:
          input.postalCode.trim(),
        p_shipping_country:
          input.country?.trim() || "India",
        p_notes: input.notes?.trim() || "",
        p_payment_method: input.paymentMethod,
        p_save_customer_details:
          input.saveCustomerDetails === true,
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

    return {
      success: true,
      orderId: data as string,
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