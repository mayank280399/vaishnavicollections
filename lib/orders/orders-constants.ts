export const ORDER_STATUSES = [
    "PENDING",
    "CONFIRMED",
    "PROCESSING",
    "SHIPPED",
    "OUT_FOR_DELIVERY",
    "DELIVERED",
    "CANCELLED",
] as const;

export const PAYMENT_STATUSES = [
    "PENDING",
    "PAID",
    "FAILED",
    "REFUNDED",
] as const;

export const PAYMENT_METHODS = [
    "CASH",
    "UPI",
    "CARD",
    "BANK_TRANSFER",
    "OTHER",
] as const;

export const statusLabels: Record<string, string> = {
    PENDING: "Order Placed",
    CONFIRMED: "Confirmed",
    PROCESSING: "Processing",
    SHIPPED: "Shipped",
    OUT_FOR_DELIVERY: "Out for Delivery",
    DELIVERED: "Delivered",
    CANCELLED: "Cancelled",
};

export const paymentStatusLabels: Record<string, string> = {
    PENDING: "Pending",
    PAID: "Paid",
    FAILED: "Failed",
    REFUNDED: "Refunded",
};

export const paymentMethodLabels: Record<string, string> = {
    CASH: "Cash on Delivery",
    UPI: "UPI",
    CARD: "Card",
    BANK_TRANSFER: "Bank Transfer",
    OTHER: "Other",
};