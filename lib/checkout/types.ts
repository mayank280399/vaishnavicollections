
export type RecipientMode = "me" | "someone_else";

/**
 * Payment method values accepted by the existing orders schema.
 * Razorpay's verified payment method is mapped to one of these
 * values after the gateway confirms a captured payment.
 */
export type PaymentMethod =
  | "CASH"
  | "UPI"
  | "CARD"
  | "BANK_TRANSFER"
  | "OTHER";

/**
 * Payment option selected during checkout.
 * The online storefront accepts full payment through Razorpay.
 */
export type CheckoutPaymentOption = "razorpay_full";

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

  /**
   * Database payment method.
   *
   * The existing online-order RPC creates the pending order before
   * Razorpay Checkout; the verified gateway method is saved later.
   */
  paymentMethod: PaymentMethod;

  /**
   * The online storefront currently supports full Razorpay payment.
   */
  paymentOption?: CheckoutPaymentOption;

  saveCustomerDetails?: boolean;
};

export type CheckoutProduct = {
  id: string;
  name: string;
  product_title: string | null;
  sku: string | null;

  selling_price: number;
  online_price: number | null;
  online_enabled: boolean;

  visibility: string;
};

export type CheckoutItem = {
  id: string;
  product_id: string;
  quantity: number;

  product: CheckoutProduct;

  image: string | null;
};

export type Customer = {
  display_name: string;

  phone: string | null;
  email: string | null;

  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
};

export type FormState = {
  customerName: string;
  customerPhone: string;

  addressLine1: string;
  addressLine2: string;

  city: string;
  state: string;
  postalCode: string;

  notes: string;
};