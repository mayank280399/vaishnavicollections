import type { SupabaseClient } from "@supabase/supabase-js";

import type {
    OrderRow,
    Shipment,
    SortOrder,
} from "@/lib/orders/orders-types";

const ORDER_SELECT = `
    id,
    order_number,
    status,
    payment_status,
    payment_method,
    payment_plan,
    subtotal,
    shipping_amount,
    discount_amount,
    total_amount,
    amount_paid,
    amount_due,
    customer_name,
    customer_phone,
    shipping_address_line1,
    shipping_address_line2,
    shipping_city,
    shipping_state,
    shipping_postal_code,
    shipping_country,
    notes,
    created_at,
    updated_at,
    order_items (
        id,
        product_name,
        product_sku,
        product_image,
        quantity,
        unit_price,
        total_price
    )
`;

const SHIPMENT_SELECT = `
    id,
    order_id,
    delivery_partner,
    tracking_number,
    tracking_url,
    shipped_at,
    out_for_delivery_at,
    delivered_at,
    delivery_notes,
    created_at,
    updated_at
`;

type OrderPaymentStatus =
    | "PENDING"
    | "PARTIALLY_PAID"
    | "PAID"
    | "FAILED"
    | "REFUNDED";

/**
 * Loads all orders for the admin order management screen.
 *
 * Includes:
 * - payment plan
 * - payment status
 * - amount paid
 * - amount due
 * - order items
 */
export async function loadOrders(
    supabase: SupabaseClient,
    sortOrder: SortOrder
): Promise<{
    data: OrderRow[] | null;
    error: string | null;
}> {
    const { data, error } = await supabase
        .from("orders")
        .select(ORDER_SELECT)
        .order("created_at", {
            ascending: sortOrder === "oldest",
        });

    if (error) {
        return {
            data: null,
            error: error.message,
        };
    }

    const orders: OrderRow[] = (data ?? []).map(
        (order: any) => ({
            ...order,

            items: order.order_items ?? [],

            /*
             * payment_plan was introduced after some existing
             * orders may already have existed.
             *
             * The database default is FULL, and this fallback
             * keeps the admin UI resilient if an unexpected
             * null/invalid value is returned.
             */
            payment_plan:
                order.payment_plan === "PARTIAL"
                    ? "PARTIAL"
                    : "FULL",

            amount_paid:
                Number(order.amount_paid ?? 0),

            amount_due:
                Number(order.amount_due ?? 0),
        })
    );

    return {
        data: orders,
        error: null,
    };
}

/**
 * Loads the latest shipment record for an order.
 */
export async function loadShipment(
    supabase: SupabaseClient,
    orderId: string
): Promise<{
    data: Shipment | null;
    error: string | null;
}> {
    const { data, error } = await supabase
        .from("order_shipments")
        .select(SHIPMENT_SELECT)
        .eq("order_id", orderId)
        .order("created_at", {
            ascending: false,
        })
        .limit(1)
        .maybeSingle();

    if (error) {
        return {
            data: null,
            error: error.message,
        };
    }

    return {
        data: data as Shipment | null,
        error: null,
    };
}

/**
 * Updates the operational order status and payment status.
 *
 * IMPORTANT:
 * For PAID and PARTIALLY_PAID payments, use
 * updateOrderPayment() instead.
 *
 * This function remains compatible with the existing
 * OrdersTable call:
 *
 * updateOrder(
 *     supabase,
 *     orderId,
 *     status,
 *     paymentStatus
 * )
 *
 * When payment status is changed to PAID, the payment
 * amounts are automatically synchronized to:
 *
 * amount_paid = total_amount
 * amount_due  = 0
 *
 * For PARTIALLY_PAID, the existing payment amount must
 * already represent a valid partial payment. Otherwise,
 * use updateOrderPayment().
 */
export async function updateOrder(
    supabase: SupabaseClient,
    orderId: string,
    status: string,
    paymentStatus: string
): Promise<{
    data: {
        id: string;
        status: string;
        payment_status: string;
        payment_plan: "FULL" | "PARTIAL";
        total_amount: number;
        amount_paid: number;
        amount_due: number;
        updated_at: string;
    } | null;
    error: string | null;
}> {
    if (!orderId) {
        return {
            data: null,
            error: "Order ID is required.",
        };
    }

    const normalizedPaymentStatus =
        paymentStatus.toUpperCase() as OrderPaymentStatus;

    const validPaymentStatuses: OrderPaymentStatus[] = [
        "PENDING",
        "PARTIALLY_PAID",
        "PAID",
        "FAILED",
        "REFUNDED",
    ];

    if (
        !validPaymentStatuses.includes(
            normalizedPaymentStatus
        )
    ) {
        return {
            data: null,
            error: "Invalid payment status.",
        };
    }

    /*
     * Always fetch the current payment information first.
     *
     * This prevents us from blindly overwriting payment
     * amounts when only the operational order status changes.
     */
    const { data: currentOrder, error: currentOrderError } =
        await supabase
            .from("orders")
            .select(
                `
                    id,
                    total_amount,
                    amount_paid,
                    amount_due,
                    payment_plan
                `
            )
            .eq("id", orderId)
            .single();

    if (currentOrderError) {
        return {
            data: null,
            error: currentOrderError.message,
        };
    }

    const totalAmount =
        Number(currentOrder.total_amount ?? 0);

    const currentAmountPaid =
        Number(currentOrder.amount_paid ?? 0);

    let amountPaid = currentAmountPaid;
    let amountDue = Math.max(
        totalAmount - amountPaid,
        0
    );

    /*
     * A verified PAID order means the complete order
     * amount has been received.
     */
    if (normalizedPaymentStatus === "PAID") {
        amountPaid = totalAmount;
        amountDue = 0;
    }

    /*
     * A PARTIALLY_PAID status is only valid when there
     * is already an actual payment amount recorded.
     *
     * We deliberately do NOT invent a partial payment
     * amount here.
     */
    if (
        normalizedPaymentStatus ===
        "PARTIALLY_PAID"
    ) {
        if (
            amountPaid <= 0 ||
            amountPaid >= totalAmount
        ) {
            return {
                data: null,
                error:
                    "A valid amount paid is required before an order can be marked as partially paid.",
            };
        }

        amountDue = totalAmount - amountPaid;
    }

    /*
     * PENDING means payment has not yet been verified.
     *
     * We preserve the current payment amount rather than
     * automatically assuming that no money was received.
     *
     * New orders normally have:
     * amount_paid = 0
     * amount_due = total_amount
     */
    if (
        normalizedPaymentStatus === "PENDING"
    ) {
        amountDue = Math.max(
            totalAmount - amountPaid,
            0
        );
    }

    /*
     * FAILED means the attempted payment did not succeed.
     *
     * For a normal unpaid order this remains:
     * amount_paid = 0
     * amount_due = total_amount
     *
     * We do not erase a previously verified payment here.
     */
    if (
        normalizedPaymentStatus === "FAILED"
    ) {
        amountDue = Math.max(
            totalAmount - amountPaid,
            0
        );
    }

    /*
     * REFUNDED is intentionally not used to automatically
     * erase amount_paid.
     *
     * The current schema does not have a separate
     * refund_amount field, so keeping the historical
     * payment amount is safer than pretending the customer
     * never paid.
     */
    if (
        normalizedPaymentStatus === "REFUNDED"
    ) {
        amountDue = Math.max(
            totalAmount - amountPaid,
            0
        );
    }

    /*
     * Final safety checks before touching the database.
     */
    if (amountPaid < 0) {
        return {
            data: null,
            error: "Amount paid cannot be negative.",
        };
    }

    if (amountPaid > totalAmount) {
        return {
            data: null,
            error:
                "Amount paid cannot be greater than the order total.",
        };
    }

    amountDue = Number(
        (totalAmount - amountPaid).toFixed(2)
    );

    amountPaid = Number(
        amountPaid.toFixed(2)
    );

    const updatedAt =
        new Date().toISOString();

    const { data, error } = await supabase
        .from("orders")
        .update({
            status,
            payment_status:
                normalizedPaymentStatus,
            amount_paid: amountPaid,
            amount_due: amountDue,
            updated_at: updatedAt,
        })
        .eq("id", orderId)
        .select(
            `
                id,
                status,
                payment_status,
                payment_plan,
                total_amount,
                amount_paid,
                amount_due,
                updated_at
            `
        )
        .single();

    if (error) {
        return {
            data: null,
            error: error.message,
        };
    }

    return {
        data: {
            id: data.id,
            status: data.status,
            payment_status:
                data.payment_status,
            payment_plan:
                data.payment_plan ===
                "PARTIAL"
                    ? "PARTIAL"
                    : "FULL",
            total_amount:
                Number(data.total_amount ?? 0),
            amount_paid:
                Number(data.amount_paid ?? 0),
            amount_due:
                Number(data.amount_due ?? 0),
            updated_at: data.updated_at,
        },
        error: null,
    };
}

/**
 * Explicitly records a verified payment amount.
 *
 * This is the preferred function for the admin payment
 * verification flow.
 *
 * Examples:
 *
 * Full payment:
 *   amountPaid = 999
 *   paymentStatus = PAID
 *
 * Partial payment:
 *   amountPaid = 149
 *   paymentStatus = PARTIALLY_PAID
 *
 * The function calculates amount_due from the order total.
 *
 * It never trusts an amount_due supplied by the client.
 */
export async function updateOrderPayment(
    supabase: SupabaseClient,
    orderId: string,
    amountPaidInput: number,
    paymentStatus: OrderPaymentStatus
): Promise<{
    data: {
        id: string;
        payment_status: string;
        payment_plan: "FULL" | "PARTIAL";
        total_amount: number;
        amount_paid: number;
        amount_due: number;
        updated_at: string;
    } | null;
    error: string | null;
}> {
    if (!orderId) {
        return {
            data: null,
            error: "Order ID is required.",
        };
    }

    const validPaymentStatuses: OrderPaymentStatus[] = [
        "PENDING",
        "PARTIALLY_PAID",
        "PAID",
        "FAILED",
        "REFUNDED",
    ];

    if (
        !validPaymentStatuses.includes(
            paymentStatus
        )
    ) {
        return {
            data: null,
            error: "Invalid payment status.",
        };
    }

    const { data: order, error: orderError } =
        await supabase
            .from("orders")
            .select(
                `
                    id,
                    total_amount,
                    payment_plan
                `
            )
            .eq("id", orderId)
            .single();

    if (orderError) {
        return {
            data: null,
            error: orderError.message,
        };
    }

    const totalAmount =
        Number(order.total_amount ?? 0);

    if (!Number.isFinite(totalAmount) || totalAmount < 0) {
        return {
            data: null,
            error:
                "The order has an invalid total amount.",
        };
    }

    let amountPaid =
        Number(amountPaidInput);

    if (!Number.isFinite(amountPaid)) {
        return {
            data: null,
            error:
                "Please enter a valid payment amount.",
        };
    }

    amountPaid = Number(
        amountPaid.toFixed(2)
    );

    if (amountPaid < 0) {
        return {
            data: null,
            error:
                "Payment amount cannot be negative.",
        };
    }

    if (amountPaid > totalAmount) {
        return {
            data: null,
            error:
                "Payment amount cannot be greater than the order total.",
        };
    }

    /*
     * PAID always means the complete order amount has
     * been verified.
     */
    if (paymentStatus === "PAID") {
        if (amountPaid !== totalAmount) {
            return {
                data: null,
                error:
                    "A paid order must have the full order amount recorded.",
            };
        }
    }

    /*
     * PARTIALLY_PAID requires an amount between zero
     * and the full order total.
     */
    if (
        paymentStatus === "PARTIALLY_PAID"
    ) {
        if (
            amountPaid <= 0 ||
            amountPaid >= totalAmount
        ) {
            return {
                data: null,
                error:
                    "A partially paid order must have a payment amount greater than zero and less than the order total.",
            };
        }
    }

    /*
     * PENDING and FAILED should not be used to record
     * a newly verified payment.
     *
     * For these states, the caller should normally pass
     * zero unless an existing verified payment is being
     * preserved.
     */
    if (
        paymentStatus === "PENDING" ||
        paymentStatus === "FAILED"
    ) {
        if (amountPaid !== 0) {
            return {
                data: null,
                error:
                    "Pending or failed payments cannot record a new verified payment amount.",
            };
        }
    }

    /*
     * REFUNDED is kept separate because the current schema
     * does not have a refund_amount column.
     *
     * We therefore do not automatically invent refund
     * accounting here.
     */
    if (
        paymentStatus === "REFUNDED" &&
        amountPaid > totalAmount
    ) {
        return {
            data: null,
            error:
                "Refunded amount cannot exceed the order total.",
        };
    }

    const amountDue = Number(
        (totalAmount - amountPaid).toFixed(2)
    );

    const updatedAt =
        new Date().toISOString();

    const { data, error } = await supabase
        .from("orders")
        .update({
            payment_status: paymentStatus,
            amount_paid: amountPaid,
            amount_due: amountDue,
            updated_at: updatedAt,
        })
        .eq("id", orderId)
        .select(
            `
                id,
                payment_status,
                payment_plan,
                total_amount,
                amount_paid,
                amount_due,
                updated_at
            `
        )
        .single();

    if (error) {
        return {
            data: null,
            error: error.message,
        };
    }

    return {
        data: {
            id: data.id,
            payment_status:
                data.payment_status,
            payment_plan:
                data.payment_plan ===
                "PARTIAL"
                    ? "PARTIAL"
                    : "FULL",
            total_amount:
                Number(data.total_amount ?? 0),
            amount_paid:
                Number(data.amount_paid ?? 0),
            amount_due:
                Number(data.amount_due ?? 0),
            updated_at: data.updated_at,
        },
        error: null,
    };
}

interface SaveShipmentParams {
    orderId: string;
    shipmentId: string | null;

    deliveryPartner: string;
    trackingNumber: string;
    trackingUrl: string;
    deliveryNotes: string;

    shippedAt: string | null;
    outForDeliveryAt: string | null;
    deliveredAt: string | null;
}

/**
 * Creates or updates shipment information for an order.
 */
export async function saveShipment(
    supabase: SupabaseClient,
    params: SaveShipmentParams
): Promise<{
    data: Shipment | null;
    error: string | null;
}> {
    const now = new Date().toISOString();

    const shipmentPayload = {
        order_id: params.orderId,
        delivery_partner:
            params.deliveryPartner.trim() || null,
        tracking_number:
            params.trackingNumber.trim() || null,
        tracking_url:
            params.trackingUrl.trim() || null,
        shipped_at: params.shippedAt,
        out_for_delivery_at:
            params.outForDeliveryAt,
        delivered_at:
            params.deliveredAt,
        delivery_notes:
            params.deliveryNotes.trim() || null,
        updated_at: now,
    };

    if (params.shipmentId) {
        const { data, error } = await supabase
            .from("order_shipments")
            .update(shipmentPayload)
            .eq("id", params.shipmentId)
            .select(SHIPMENT_SELECT)
            .single();

        if (error) {
            return {
                data: null,
                error: error.message,
            };
        }

        return {
            data: data as Shipment,
            error: null,
        };
    }

    const { data, error } = await supabase
        .from("order_shipments")
        .insert({
            ...shipmentPayload,
            created_at: now,
        })
        .select(SHIPMENT_SELECT)
        .single();

    if (error) {
        return {
            data: null,
            error: error.message,
        };
    }

    return {
        data: data as Shipment,
        error: null,
    };
}