export type AppSettings = {
  id: number;

  // General
  app_name: string;
  currency: string;
  currency_symbol: string;
  timezone: string;
  date_format: string;
  logo_url: string | null;
  favicon_url: string | null;

  // Business
  shop_name: string;
  legal_business_name: string | null;
  business_description: string | null;
  owner_name: string | null;
  primary_phone: string | null;
  secondary_phone: string | null;
  whatsapp_number: string | null;
  business_email: string | null;

  address_line_1: string | null;
  address_line_2: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  country: string;

  gstin: string | null;
  pan: string | null;

  // Online
  website_url: string | null;
  online_store_url: string | null;
  online_orders_enabled: boolean;
  order_preparation_enabled: boolean;
  pan_india_shipping_enabled: boolean;

  // Social
  instagram_url: string | null;
  facebook_url: string | null;
  youtube_url: string | null;
  google_business_url: string | null;
  google_review_url: string | null;
  whatsapp_url: string | null;

  instagram_enabled: boolean;
  facebook_enabled: boolean;
  youtube_enabled: boolean;
  google_review_enabled: boolean;

  // Business hours
  business_hours_enabled: boolean;

  monday_open: string | null;
  monday_close: string | null;
  tuesday_open: string | null;
  tuesday_close: string | null;
  wednesday_open: string | null;
  wednesday_close: string | null;
  thursday_open: string | null;
  thursday_close: string | null;
  friday_open: string | null;
  friday_close: string | null;
  saturday_open: string | null;
  saturday_close: string | null;
  sunday_open: string | null;
  sunday_close: string | null;

  // Inventory
  low_stock_threshold: number;
  allow_negative_stock: boolean;
  low_stock_alerts_enabled: boolean;

  // Orders
  minimum_order_amount: number;
  default_shipping_charge: number;
  free_shipping_threshold: number | null;
  invoice_prefix: string;
  invoice_terms: string | null;

  // Tax
  tax_enabled: boolean;
  tax_rate: number;

  // Communication
  customer_support_phone: string | null;
  customer_support_email: string | null;
  order_confirmation_message: string | null;
  order_footer_message: string | null;
  receipt_footer_message: string | null;

  // Notifications
  new_order_alerts_enabled: boolean;
  notification_email: string | null;

  created_at: string;
  updated_at: string;
};

export type AppSettingsUpdate = Omit<
  AppSettings,
  "id" | "created_at" | "updated_at"
>;