"use client";

import {
    X,
} from "lucide-react";

import type {
    OrderRow,
    Shipment,
} from "@/lib/orders/orders-types";

import OrderAddressSection from "./order-address-section";
import OrderCustomerSection from "./order-customer-section";
import OrderItemsSection from "./order-items-section";
import OrderPaymentSection from "./order-payment-section";
import OrderShipmentSection from "./order-shipment-section";
import OrderStatusSection from "./order-status-section";
import OrderSummarySection from "./order-summary-section";

interface OrderDetailsDialogProps {
    open: boolean;
    order: OrderRow | null;

    onClose: () => void;

    editStatus: string;
    editPaymentStatus: string;

    onStatusChange: (value: string) => void;
    onPaymentStatusChange: (value: string) => void;

    onSaveOrder: () => void;

    orderSaving: boolean;
    orderHasChanges: boolean;

    shipment: Shipment | null;
    shipmentLoading: boolean;

    deliveryPartner: string;
    trackingNumber: string;
    trackingUrl: string;
    deliveryNotes: string;

    shippedAt: string | null;
    outForDeliveryAt: string | null;
    deliveredAt: string | null;

    onDeliveryPartnerChange: (value: string) => void;
    onTrackingNumberChange: (value: string) => void;
    onTrackingUrlChange: (value: string) => void;
    onDeliveryNotesChange: (value: string) => void;

    onShippedAtChange: (value: string | null) => void;
    onOutForDeliveryAtChange: (
        value: string | null
    ) => void;
    onDeliveredAtChange: (value: string | null) => void;

    onSaveShipment: () => void;

    shipmentSaving: boolean;
    shipmentHasChanges: boolean;
}

export default function OrderDetailsDialog({
    open,
    order,
    onClose,

    editStatus,
    editPaymentStatus,

    onStatusChange,
    onPaymentStatusChange,

    onSaveOrder,

    orderSaving,
    orderHasChanges,

    shipment,
    shipmentLoading,

    deliveryPartner,
    trackingNumber,
    trackingUrl,
    deliveryNotes,

    shippedAt,
    outForDeliveryAt,
    deliveredAt,

    onDeliveryPartnerChange,
    onTrackingNumberChange,
    onTrackingUrlChange,
    onDeliveryNotesChange,

    onShippedAtChange,
    onOutForDeliveryAtChange,
    onDeliveredAtChange,

    onSaveShipment,

    shipmentSaving,
    shipmentHasChanges,
}: OrderDetailsDialogProps) {
    if (!open || !order) {
        return null;
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-6"
            role="dialog"
            aria-modal="true"
            aria-labelledby="order-details-title"
        >
            <div className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-xl border bg-background shadow-2xl">
                {/* Header */}
                <div className="flex shrink-0 items-center justify-between gap-4 border-b px-4 py-4 sm:px-6">
                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                            <h2
                                id="order-details-title"
                                className="truncate text-lg font-semibold"
                            >
                                {order.order_number}
                            </h2>

                            <span className="rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground">
                                Order details
                            </span>
                        </div>

                        <p className="mt-1 text-xs text-muted-foreground">
                            Review customer, payment, delivery and
                            shipment information.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border hover:bg-muted"
                        aria-label="Close order details"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* Content */}
                <div className="min-h-0 flex-1 overflow-y-auto">
                    <div className="space-y-4 p-4 sm:p-6">
                        <OrderStatusSection
                            editStatus={editStatus}
                            editPaymentStatus={
                                editPaymentStatus
                            }
                            onStatusChange={onStatusChange}
                            onPaymentStatusChange={
                                onPaymentStatusChange
                            }
                            onSave={onSaveOrder}
                            saving={orderSaving}
                            hasChanges={orderHasChanges}
                        />

                        <OrderCustomerSection
                            order={order}
                        />

                        <OrderItemsSection
                            order={order}
                        />

                        <OrderAddressSection
                            order={order}
                        />

                        <OrderShipmentSection
                            shipment={shipment}
                            loading={shipmentLoading}
                            deliveryPartner={deliveryPartner}
                            trackingNumber={trackingNumber}
                            trackingUrl={trackingUrl}
                            deliveryNotes={deliveryNotes}
                            shippedAt={shippedAt}
                            outForDeliveryAt={
                                outForDeliveryAt
                            }
                            deliveredAt={deliveredAt}
                            onDeliveryPartnerChange={
                                onDeliveryPartnerChange
                            }
                            onTrackingNumberChange={
                                onTrackingNumberChange
                            }
                            onTrackingUrlChange={
                                onTrackingUrlChange
                            }
                            onDeliveryNotesChange={
                                onDeliveryNotesChange
                            }
                            onShippedAtChange={
                                onShippedAtChange
                            }
                            onOutForDeliveryAtChange={
                                onOutForDeliveryAtChange
                            }
                            onDeliveredAtChange={
                                onDeliveredAtChange
                            }
                            onSave={onSaveShipment}
                            saving={shipmentSaving}
                            hasChanges={
                                shipmentHasChanges
                            }
                        />

                        <OrderPaymentSection
                            order={order}
                        />

                        <OrderSummarySection
                            order={order}
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="flex shrink-0 items-center justify-end border-t bg-muted/20 px-4 py-3 sm:px-6">
                    <button
                        type="button"
                        onClick={onClose}
                        className="inline-flex h-9 items-center justify-center rounded-md border bg-background px-4 text-sm font-medium hover:bg-muted"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}