export type OrderItem = {
    id: string;
    product_name: string;
    product_sku: string | null;
    product_image: string | null;
    quantity: number;
    unit_price: number;
    total_price: number;
};

export type OrderPaymentPlan =
    | "FULL"
    | "PARTIAL";

export type OrderRow = {
    id: string;
    order_number: string;
    status: string;

    payment_status: string;
    payment_method: string | null;
    payment_plan: OrderPaymentPlan;

    subtotal: number;
    shipping_amount: number;
    discount_amount: number;
    total_amount: number;

    amount_paid: number;
    amount_due: number;

    customer_name: string;
    customer_phone: string;

    shipping_address_line1: string;
    shipping_address_line2: string | null;
    shipping_city: string;
    shipping_state: string;
    shipping_postal_code: string;
    shipping_country: string;

    notes: string | null;

    created_at: string;
    updated_at: string;

    items: OrderItem[];
};

export type Shipment = {
    id: string;
    order_id: string;

    delivery_partner: string | null;
    tracking_number: string | null;
    tracking_url: string | null;

    shipped_at: string | null;
    out_for_delivery_at: string | null;
    delivered_at: string | null;

    delivery_notes: string | null;

    created_at: string;
    updated_at: string;
};

export type SortOrder = "newest" | "oldest";

export type OrderFilters = {
    search: string;
    status: string;
    paymentStatus: string;
    paymentMethod: string;
    dateFrom: string;
    dateTo: string;
};

export type OrderSummary = {
    totalValue: number;
    orderCount: number;
    average: number;
    itemCount: number;
    pendingCount: number;
};

export type ShipmentForm = {
    deliveryPartner: string;
    trackingNumber: string;
    trackingUrl: string;
    deliveryNotes: string;

    shippedAt: string | null;
    outForDeliveryAt: string | null;
    deliveredAt: string | null;
};