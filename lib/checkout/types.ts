
export type RecipientMode = "me" | "someone_else";

/**
 * Payment method stored in the database.
 *
 * Both full and partial online payments currently use UPI.
 * The database does not need separate payment methods for
 * full vs partial payment.
 */
export type PaymentMethod =
  | "CASH"
  | "UPI"
  | "CARD"
  | "BANK_TRANSFER"
  | "OTHER";

/**
 * Payment option selected during checkout.
 *
 * This is a frontend checkout choice and is intentionally
 * separate from PaymentMethod.
 */
export type CheckoutPaymentOption =
  | "upi_full"
  | "upi_partial";

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
   * For the current checkout this will be "UPI".
   */
  paymentMethod: PaymentMethod;

  /**
   * Customer's checkout choice between full and partial UPI.
   *
   * This is used by the application and is not passed
   * directly to the payment_method database enum.
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