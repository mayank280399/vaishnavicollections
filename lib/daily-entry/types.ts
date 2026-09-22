export type TransactionType =
  | "sale"
  | "expense"
  | "purchase";

export type PaymentMethod =
  | "CASH"
  | "UPI"
  | "CARD"
  | "BANK_TRANSFER"
  | "OTHER";

export type DailyEntryOptions = {
  categories: {
    id: string;
    name: string;
    parent_id: string | null;
    category_type: string;
  }[];

  products: {
    id: string;
    name: string;
    category_id: string | null;
    selling_price: number | string;
    cost_price: number | string;
    visibility: string;
  }[];

  variants: {
    id: string;
    product_id: string;
    name: string;
    variant_value: string | null;
    selling_price: number | string | null;
    cost_price: number | string | null;
    stock_quantity: number | string;
  }[];

  customers: {
    id: string;
    customer_code: string;
    display_name: string;
    phone: string | null;
  }[];
};