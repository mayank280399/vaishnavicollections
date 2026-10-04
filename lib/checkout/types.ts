export type RecipientMode = "me" | "someone_else";
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
