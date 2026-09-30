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
    subtotal,
    shipping_amount,
    discount_amount,
    total_amount,
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
        })
    );

    return {
        data: orders,
        error: null,
    };
}

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
        updated_at: string;
    } | null;
    error: string | null;
}> {
    const updatedAt = new Date().toISOString();

    const { data, error } = await supabase
        .from("orders")
        .update({
            status,
            payment_status: paymentStatus,
            updated_at: updatedAt,
        })
        .eq("id", orderId)
        .select(
            "id, status, payment_status, updated_at"
        )
        .single();

    if (error) {
        return {
            data: null,
            error: error.message,
        };
    }

    return {
        data,
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
        delivered_at: params.deliveredAt,
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