"use client";

import React, {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import { Loader2, RefreshCw } from "lucide-react";

import { createClient } from "@/lib/supabase/client";

import OrdersFilters from "./orders-filters";
import OrdersSummary from "./orders-summary";
import OrdersTableView from "./orders-table-view";
import OrderDetailsDialog from "./order-details-dialog";
import { OrderFilters, OrderRow, Shipment, SortOrder } from "@/lib/orders/orders-types";
import { loadOrders, loadShipment, saveShipment, updateOrder } from "@/lib/service/orders/orders-service";
import { ORDER_STATUSES } from "@/lib/orders/orders-constants";


const DEFAULT_FILTERS: OrderFilters = {
    search: "",
    status: "ALL",
    paymentStatus: "ALL",
    paymentMethod: "ALL",
    dateFrom: "",
    dateTo: "",
};

const EMPTY_SHIPMENT_FORM = {
    deliveryPartner: "",
    trackingNumber: "",
    trackingUrl: "",
    deliveryNotes: "",
    shippedAt: null as string | null,
    outForDeliveryAt: null as string | null,
    deliveredAt: null as string | null,
};

export default function OrdersTable() {
    const supabase = useMemo(() => createClient(), []);

    /* ------------------------------------------------------------------
     * Main data
     * ------------------------------------------------------------------ */

    const [orders, setOrders] = useState<OrderRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const [error, setError] = useState<string | null>(
        null
    );

    /* ------------------------------------------------------------------
     * Filters
     * ------------------------------------------------------------------ */

    const [filters, setFilters] =
        useState<OrderFilters>(DEFAULT_FILTERS);

    const [sortOrder, setSortOrder] =
        useState<SortOrder>("newest");

    /* ------------------------------------------------------------------
     * Selected order / dialog
     * ------------------------------------------------------------------ */

    const [selectedOrder, setSelectedOrder] =
        useState<OrderRow | null>(null);

    const [dialogOpen, setDialogOpen] =
        useState(false);

    /* ------------------------------------------------------------------
     * Order editing
     * ------------------------------------------------------------------ */

    const [editStatus, setEditStatus] =
        useState("");

    const [editPaymentStatus, setEditPaymentStatus] =
        useState("");

    const [orderSaving, setOrderSaving] =
        useState(false);

    /* ------------------------------------------------------------------
     * Shipment
     * ------------------------------------------------------------------ */

    const [shipment, setShipment] =
        useState<Shipment | null>(null);

    const [shipmentLoading, setShipmentLoading] =
        useState(false);

    const [shipmentSaving, setShipmentSaving] =
        useState(false);

    const [deliveryPartner, setDeliveryPartner] =
        useState("");

    const [trackingNumber, setTrackingNumber] =
        useState("");

    const [trackingUrl, setTrackingUrl] =
        useState("");

    const [deliveryNotes, setDeliveryNotes] =
        useState("");

    const [shippedAt, setShippedAt] =
        useState<string | null>(null);

    const [outForDeliveryAt, setOutForDeliveryAt] =
        useState<string | null>(null);

    const [deliveredAt, setDeliveredAt] =
        useState<string | null>(null);

    /* ------------------------------------------------------------------
     * Shipment original state
     *
     * Used to determine whether the shipment form has changed.
     * ------------------------------------------------------------------ */

    const [originalShipmentForm, setOriginalShipmentForm] =
        useState(EMPTY_SHIPMENT_FORM);

    /* ------------------------------------------------------------------
     * Load orders
     * ------------------------------------------------------------------ */

    const fetchOrders = useCallback(
        async (showRefreshing = false) => {
            try {
                setError(null);

                if (showRefreshing) {
                    setRefreshing(true);
                } else {
                    setLoading(true);
                }

                const result = await loadOrders(
                    supabase,
                    sortOrder
                );

                if (result.error) {
                    setError(result.error);
                    return;
                }

                setOrders(result.data ?? []);
            } catch (err) {
                console.error(
                    "Failed to load orders:",
                    err
                );

                setError(
                    err instanceof Error
                        ? err.message
                        : "Failed to load orders."
                );
            } finally {
                setLoading(false);
                setRefreshing(false);
            }
        },
        [supabase, sortOrder]
    );

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    /* ------------------------------------------------------------------
     * Filter orders
     * ------------------------------------------------------------------ */

    const filteredOrders = useMemo(() => {
        const search =
            filters.search.trim().toLowerCase();

        return orders.filter((order) => {
            /* Search */
            if (search) {
                const searchableText = [
                    order.order_number,
                    order.customer_name,
                    order.customer_phone,
                    order.shipping_address_line1,
                    order.shipping_address_line2,
                    order.shipping_city,
                    order.shipping_state,
                    order.shipping_postal_code,
                    ...order.items.flatMap((item) => [
                        item.product_name,
                        item.product_sku ?? "",
                    ]),
                ]
                    .join(" ")
                    .toLowerCase();

                if (
                    !searchableText.includes(search)
                ) {
                    return false;
                }
            }

            /* Order status */
            if (
                filters.status !== "ALL" &&
                order.status !== filters.status
            ) {
                return false;
            }

            /* Payment status */
            if (
                filters.paymentStatus !== "ALL" &&
                order.payment_status !==
                    filters.paymentStatus
            ) {
                return false;
            }

            /* Payment method */
            if (
                filters.paymentMethod !== "ALL" &&
                order.payment_method !==
                    filters.paymentMethod
            ) {
                return false;
            }

            /* Date from */
            if (filters.dateFrom) {
                const fromDate = new Date(
                    `${filters.dateFrom}T00:00:00`
                );

                const orderDate = new Date(
                    order.created_at
                );

                if (orderDate < fromDate) {
                    return false;
                }
            }

            /* Date to */
            if (filters.dateTo) {
                const toDate = new Date(
                    `${filters.dateTo}T23:59:59.999`
                );

                const orderDate = new Date(
                    order.created_at
                );

                if (orderDate > toDate) {
                    return false;
                }
            }

            return true;
        });
    }, [orders, filters]);

    /* ------------------------------------------------------------------
     * Summary
     * ------------------------------------------------------------------ */

    const summary = useMemo(() => {
        const totalValue = filteredOrders.reduce(
            (sum, order) =>
                sum + Number(order.total_amount || 0),
            0
        );

        const itemCount = filteredOrders.reduce(
            (sum, order) =>
                sum +
                order.items.reduce(
                    (itemSum, item) =>
                        itemSum +
                        Number(item.quantity || 0),
                    0
                ),
            0
        );

        const orderCount = filteredOrders.length;

        const pendingCount = filteredOrders.filter(
            (order) => order.status === "PENDING"
        ).length;

        const average =
            orderCount > 0
                ? totalValue / orderCount
                : 0;

        return {
            totalValue,
            orderCount,
            average,
            itemCount,
            pendingCount,
        };
    }, [filteredOrders]);

    /* ------------------------------------------------------------------
     * Reset filters
     * ------------------------------------------------------------------ */

    const resetFilters = () => {
        setFilters(DEFAULT_FILTERS);
    };

    /* ------------------------------------------------------------------
     * Shipment form helpers
     * ------------------------------------------------------------------ */

    const getShipmentForm = useCallback(
        () => ({
            deliveryPartner,
            trackingNumber,
            trackingUrl,
            deliveryNotes,
            shippedAt,
            outForDeliveryAt,
            deliveredAt,
        }),
        [
            deliveryPartner,
            trackingNumber,
            trackingUrl,
            deliveryNotes,
            shippedAt,
            outForDeliveryAt,
            deliveredAt,
        ]
    );

    const resetShipmentForm = () => {
        setShipment(null);

        setDeliveryPartner("");
        setTrackingNumber("");
        setTrackingUrl("");
        setDeliveryNotes("");

        setShippedAt(null);
        setOutForDeliveryAt(null);
        setDeliveredAt(null);

        setOriginalShipmentForm(
            EMPTY_SHIPMENT_FORM
        );
    };

    const populateShipmentForm = (
        currentShipment: Shipment | null
    ) => {
        if (!currentShipment) {
            resetShipmentForm();
            return;
        }

        const form = {
            deliveryPartner:
                currentShipment.delivery_partner ?? "",
            trackingNumber:
                currentShipment.tracking_number ?? "",
            trackingUrl:
                currentShipment.tracking_url ?? "",
            deliveryNotes:
                currentShipment.delivery_notes ?? "",
            shippedAt:
                currentShipment.shipped_at,
            outForDeliveryAt:
                currentShipment.out_for_delivery_at,
            deliveredAt:
                currentShipment.delivered_at,
        };

        setDeliveryPartner(
            form.deliveryPartner
        );
        setTrackingNumber(
            form.trackingNumber
        );
        setTrackingUrl(form.trackingUrl);
        setDeliveryNotes(
            form.deliveryNotes
        );

        setShippedAt(form.shippedAt);
        setOutForDeliveryAt(
            form.outForDeliveryAt
        );
        setDeliveredAt(form.deliveredAt);

        setOriginalShipmentForm(form);
    };

    /* ------------------------------------------------------------------
     * Shipment dirty state
     * ------------------------------------------------------------------ */

    const shipmentHasChanges = useMemo(() => {
        const current = getShipmentForm();

        return (
            current.deliveryPartner !==
                originalShipmentForm.deliveryPartner ||
            current.trackingNumber !==
                originalShipmentForm.trackingNumber ||
            current.trackingUrl !==
                originalShipmentForm.trackingUrl ||
            current.deliveryNotes !==
                originalShipmentForm.deliveryNotes ||
            current.shippedAt !==
                originalShipmentForm.shippedAt ||
            current.outForDeliveryAt !==
                originalShipmentForm.outForDeliveryAt ||
            current.deliveredAt !==
                originalShipmentForm.deliveredAt
        );
    }, [
        getShipmentForm,
        originalShipmentForm,
    ]);

    /* ------------------------------------------------------------------
     * Order dirty state
     * ------------------------------------------------------------------ */

    const orderHasChanges = useMemo(() => {
        if (!selectedOrder) {
            return false;
        }

        return (
            editStatus !== selectedOrder.status ||
            editPaymentStatus !==
                selectedOrder.payment_status
        );
    }, [
        selectedOrder,
        editStatus,
        editPaymentStatus,
    ]);

    /* ------------------------------------------------------------------
     * Load shipment
     * ------------------------------------------------------------------ */

    const fetchShipment = useCallback(
        async (orderId: string) => {
            try {
                setShipmentLoading(true);

                const result =
                    await loadShipment(
                        supabase,
                        orderId
                    );

                if (result.error) {
                    console.error(
                        "Failed to load shipment:",
                        result.error
                    );

                    resetShipmentForm();
                    return;
                }

                setShipment(
                    result.data ?? null
                );

                populateShipmentForm(
                    result.data ?? null
                );
            } catch (err) {
                console.error(
                    "Failed to load shipment:",
                    err
                );

                resetShipmentForm();
            } finally {
                setShipmentLoading(false);
            }
        },
        [supabase]
    );

    /* ------------------------------------------------------------------
     * Open order
     * ------------------------------------------------------------------ */

    const openOrder = async (
        order: OrderRow
    ) => {
        setSelectedOrder(order);

        setEditStatus(order.status);
        setEditPaymentStatus(
            order.payment_status
        );

        setDialogOpen(true);

        await fetchShipment(order.id);
    };

    /* ------------------------------------------------------------------
     * Close dialog
     * ------------------------------------------------------------------ */

    const closeDialog = () => {
        if (orderSaving || shipmentSaving) {
            return;
        }

        setDialogOpen(false);

        setSelectedOrder(null);

        setEditStatus("");
        setEditPaymentStatus("");

        resetShipmentForm();
    };

    /* ------------------------------------------------------------------
     * Update selected order locally
     * ------------------------------------------------------------------ */

    const updateSelectedOrderLocally = (
        updates: Partial<OrderRow>
    ) => {
        if (!selectedOrder) {
            return;
        }

        setSelectedOrder((current) =>
            current
                ? {
                      ...current,
                      ...updates,
                  }
                : current
        );

        setOrders((currentOrders) =>
            currentOrders.map((order) =>
                order.id === selectedOrder.id
                    ? {
                          ...order,
                          ...updates,
                      }
                    : order
            )
        );
    };

    /* ------------------------------------------------------------------
     * Save order status/payment
     * ------------------------------------------------------------------ */

    const handleSaveOrder = async () => {
        if (!selectedOrder) {
            return;
        }

        if (
            !ORDER_STATUSES.includes(
                editStatus as (typeof ORDER_STATUSES)[number]
            )
        ) {
            alert("Invalid order status.");
            return;
        }

        try {
            setOrderSaving(true);

            /*
             * Automatically create shipment timestamps based
             * on the order status.
             *
             * These are only applied when the relevant timestamp
             * does not already exist.
             */
            const now =
                new Date().toISOString();

            let nextShippedAt = shippedAt;
            let nextOutForDeliveryAt =
                outForDeliveryAt;
            let nextDeliveredAt =
                deliveredAt;

            if (
                editStatus === "SHIPPED" &&
                !nextShippedAt
            ) {
                nextShippedAt = now;
            }

            if (
                editStatus ===
                    "OUT_FOR_DELIVERY"
            ) {
                if (!nextShippedAt) {
                    nextShippedAt = now;
                }

                if (
                    !nextOutForDeliveryAt
                ) {
                    nextOutForDeliveryAt =
                        now;
                }
            }

            if (
                editStatus === "DELIVERED"
            ) {
                if (!nextShippedAt) {
                    nextShippedAt = now;
                }

                if (
                    !nextOutForDeliveryAt
                ) {
                    nextOutForDeliveryAt =
                        now;
                }

                if (!nextDeliveredAt) {
                    nextDeliveredAt = now;
                }
            }

            const result =
                await updateOrder(
                    supabase,
                    selectedOrder.id,
                    editStatus,
                    editPaymentStatus
                );

            if (result.error) {
                alert(
                    `Failed to update order: ${result.error}`
                );
                return;
            }

            if (result.data) {
                updateSelectedOrderLocally({
                    status: result.data.status,
                    payment_status:
                        result.data
                            .payment_status,
                    updated_at:
                        result.data.updated_at,
                });
            }

            /*
             * If the order status implies shipment progress,
             * persist those timestamps as well.
             */
            const shipmentTimestampChanged =
                nextShippedAt !==
                    shippedAt ||
                nextOutForDeliveryAt !==
                    outForDeliveryAt ||
                nextDeliveredAt !==
                    deliveredAt;

            if (
                shipmentTimestampChanged
            ) {
                setShippedAt(
                    nextShippedAt
                );
                setOutForDeliveryAt(
                    nextOutForDeliveryAt
                );
                setDeliveredAt(
                    nextDeliveredAt
                );

                const shipmentResult =
                    await saveShipment(
                        supabase,
                        {
                            orderId:
                                selectedOrder.id,
                            shipmentId:
                                shipment?.id ??
                                null,

                            deliveryPartner,
                            trackingNumber,
                            trackingUrl,
                            deliveryNotes,

                            shippedAt:
                                nextShippedAt,
                            outForDeliveryAt:
                                nextOutForDeliveryAt,
                            deliveredAt:
                                nextDeliveredAt,
                        }
                    );

                if (
                    shipmentResult.error
                ) {
                    alert(
                        `Order updated, but shipment timestamp could not be saved: ${shipmentResult.error}`
                    );
                    return;
                }

                if (
                    shipmentResult.data
                ) {
                    setShipment(
                        shipmentResult.data
                    );

                    populateShipmentForm(
                        shipmentResult.data
                    );
                }
            }

            alert(
                "Order updated successfully."
            );
        } catch (err) {
            console.error(
                "Failed to update order:",
                err
            );

            alert(
                err instanceof Error
                    ? err.message
                    : "Failed to update order."
            );
        } finally {
            setOrderSaving(false);
        }
    };

    /* ------------------------------------------------------------------
     * Save shipment
     * ------------------------------------------------------------------ */

    const handleSaveShipment = async () => {
        if (!selectedOrder) {
            return;
        }

        try {
            setShipmentSaving(true);

            const result =
                await saveShipment(
                    supabase,
                    {
                        orderId:
                            selectedOrder.id,
                        shipmentId:
                            shipment?.id ??
                            null,

                        deliveryPartner,
                        trackingNumber,
                        trackingUrl,
                        deliveryNotes,

                        shippedAt,
                        outForDeliveryAt,
                        deliveredAt,
                    }
                );

            if (result.error) {
                alert(
                    `Failed to save shipment: ${result.error}`
                );
                return;
            }

            if (result.data) {
                setShipment(
                    result.data
                );

                populateShipmentForm(
                    result.data
                );
            }

            alert(
                "Shipment details saved successfully."
            );
        } catch (err) {
            console.error(
                "Failed to save shipment:",
                err
            );

            alert(
                err instanceof Error
                    ? err.message
                    : "Failed to save shipment."
            );
        } finally {
            setShipmentSaving(false);
        }
    };

    /* ------------------------------------------------------------------
     * Loading state
     * ------------------------------------------------------------------ */

    if (loading) {
        return (
            <div className="flex min-h-[400px] items-center justify-center">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />

                    Loading orders...
                </div>
            </div>
        );
    }

    /* ------------------------------------------------------------------
     * Error state
     * ------------------------------------------------------------------ */

    if (error && orders.length === 0) {
        return (
            <div className="rounded-xl border bg-card p-8 shadow-sm">
                <div className="mx-auto max-w-md text-center">
                    <h2 className="text-base font-semibold">
                        Unable to load orders
                    </h2>

                    <p className="mt-2 text-sm text-muted-foreground">
                        {error}
                    </p>

                    <button
                        type="button"
                        onClick={() =>
                            fetchOrders(true)
                        }
                        disabled={refreshing}
                        className="mt-5 inline-flex h-9 items-center gap-2 rounded-md border px-4 text-sm font-medium hover:bg-muted disabled:pointer-events-none disabled:opacity-50"
                    >
                        {refreshing ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <RefreshCw className="h-4 w-4" />
                        )}

                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    /* ------------------------------------------------------------------
     * Main UI
     * ------------------------------------------------------------------ */

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-xl font-semibold tracking-tight">
                        Orders & Sales
                    </h1>

                    <p className="mt-1 text-sm text-muted-foreground">
                        Manage customer orders, payments and
                        delivery tracking.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() =>
                        fetchOrders(true)
                    }
                    disabled={refreshing}
                    className="inline-flex h-9 w-fit items-center gap-2 rounded-md border bg-background px-3 text-sm font-medium hover:bg-muted disabled:pointer-events-none disabled:opacity-50"
                >
                    {refreshing ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <RefreshCw className="h-4 w-4" />
                    )}

                    Refresh
                </button>
            </div>

            {/* Error banner */}
            {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-300">
                    {error}
                </div>
            )}

            {/* Summary */}
            <OrdersSummary
                summary={summary}
            />

            {/* Filters */}
            <OrdersFilters
                filters={filters}
                sortOrder={sortOrder}
                onFiltersChange={setFilters}
                onSortOrderChange={
                    setSortOrder
                }
                onReset={resetFilters}
            />

            {/* Result count */}
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-muted-foreground">
                    Showing{" "}
                    <span className="font-medium text-foreground">
                        {filteredOrders.length}
                    </span>{" "}
                    of{" "}
                    <span className="font-medium text-foreground">
                        {orders.length}
                    </span>{" "}
                    orders
                </p>

                {filteredOrders.length !==
                    orders.length && (
                    <p className="text-xs text-muted-foreground">
                        Filters are currently applied.
                    </p>
                )}
            </div>

            {/* Table */}
            <OrdersTableView
                orders={filteredOrders}
                onOpenOrder={openOrder}
            />

            {/* Details dialog */}
            <OrderDetailsDialog
                open={dialogOpen}
                order={selectedOrder}
                onClose={closeDialog}
                editStatus={editStatus}
                editPaymentStatus={
                    editPaymentStatus
                }
                onStatusChange={setEditStatus}
                onPaymentStatusChange={
                    setEditPaymentStatus
                }
                onSaveOrder={handleSaveOrder}
                orderSaving={orderSaving}
                orderHasChanges={
                    orderHasChanges
                }
                shipment={shipment}
                shipmentLoading={
                    shipmentLoading
                }
                deliveryPartner={
                    deliveryPartner
                }
                trackingNumber={
                    trackingNumber
                }
                trackingUrl={trackingUrl}
                deliveryNotes={
                    deliveryNotes
                }
                shippedAt={shippedAt}
                outForDeliveryAt={
                    outForDeliveryAt
                }
                deliveredAt={deliveredAt}
                onDeliveryPartnerChange={
                    setDeliveryPartner
                }
                onTrackingNumberChange={
                    setTrackingNumber
                }
                onTrackingUrlChange={
                    setTrackingUrl
                }
                onDeliveryNotesChange={
                    setDeliveryNotes
                }
                onShippedAtChange={
                    setShippedAt
                }
                onOutForDeliveryAtChange={
                    setOutForDeliveryAt
                }
                onDeliveredAtChange={
                    setDeliveredAt
                }
                onSaveShipment={
                    handleSaveShipment
                }
                shipmentSaving={
                    shipmentSaving
                }
                shipmentHasChanges={
                    shipmentHasChanges
                }
            />
        </div>
    );
}