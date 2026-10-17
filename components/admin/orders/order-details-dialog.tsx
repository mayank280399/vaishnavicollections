
"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertCircle, Clock3, RotateCcw, Wallet, X } from "lucide-react";

import { createClient } from "@/lib/supabase/client";

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

type AnyRow = Record<string, any>;

interface OrderDetailsDialogProps {
    open: boolean;
    order: OrderRow | null;

    onClose: () => void;

    editStatus: string;
    editPaymentStatus: string;
    editAmountPaid: string;

    onStatusChange: (value: string) => void;
    onPaymentStatusChange: (value: string) => void;
    onAmountPaidChange: (value: string) => void;

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
    onOutForDeliveryAtChange: (value: string | null) => void;
    onDeliveredAtChange: (value: string | null) => void;

    onSaveShipment: () => void;

    shipmentSaving: boolean;
    shipmentHasChanges: boolean;
}

const RESERVED_REFUND_STATUSES = [
    "PENDING",
    "PROCESSING",
    "COMPLETED",
];

const CURRENCY_FORMATTER = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
});

function formatCurrency(value: unknown) {
    const amount = Number(value ?? 0);

    return CURRENCY_FORMATTER.format(
        Number.isFinite(amount) ? amount : 0,
    );
}

function formatDate(value: unknown) {
    if (typeof value !== "string" || !value) {
        return "Not recorded";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "Not recorded";
    }

    return new Intl.DateTimeFormat("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(date);
}

function getText(
    row: AnyRow,
    keys: string[],
    fallback = "",
): string {
    for (const key of keys) {
        const value = row[key];

        if (
            value !== null &&
            value !== undefined &&
            String(value).trim() !== ""
        ) {
            return String(value);
        }
    }

    return fallback;
}

function getRefundAmount(refund: AnyRow) {
    return Number(
        refund.amount ??
        refund.refund_amount ??
        refund.amount_to_refund ??
        0,
    );
}

function getRefundStatus(refund: AnyRow) {
    return getText(refund, ["status"], "UNKNOWN").toUpperCase();
}

function getStatusClasses(status: string) {
    switch (status.toUpperCase()) {
        case "COMPLETED":
        case "APPROVED":
        case "RECEIVED":
        case "INSPECTED":
            return "border-emerald-200 bg-emerald-50 text-emerald-800";

        case "REJECTED":
        case "FAILED":
        case "CANCELLED":
            return "border-red-200 bg-red-50 text-red-800";

        case "PENDING":
        case "REQUESTED":
        case "UNDER_REVIEW":
        case "PROCESSING":
        case "REFUND_PENDING":
            return "border-amber-200 bg-amber-50 text-amber-800";

        default:
            return "border-border bg-muted text-muted-foreground";
    }
}

function StatusBadge({ status }: { status: string }) {
    return (
        <span
            className={`inline-flex max-w-full items-center rounded-full border px-2.5 py-1 text-xs font-medium ${getStatusClasses(status)}`}
        >
            {status.replaceAll("_", " ")}
        </span>
    );
}

function ReturnRefundSection({
    open,
    order,
}: {
    open: boolean;
    order: OrderRow;
}) {
    const supabase = useMemo(() => createClient(), []);

    const [requests, setRequests] = useState<AnyRow[]>([]);
    const [refunds, setRefunds] = useState<AnyRow[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!open || !order.id) {
            return;
        }

        let cancelled = false;

        async function loadReturnRefundData() {
            setLoading(true);
            setError(null);
            setRequests([]);
            setRefunds([]);

            try {
                const {
                    data: requestData,
                    error: requestError,
                } = await supabase
                    .from("return_requests")
                    .select("*")
                    .eq("order_id", order.id)
                    .order("created_at", { ascending: false });

                if (requestError) {
                    throw new Error(requestError.message);
                }

                const loadedRequests = (requestData ?? []) as AnyRow[];

                if (cancelled) {
                    return;
                }

                setRequests(loadedRequests);

                if (loadedRequests.length === 0) {
                    setRefunds([]);
                    return;
                }

                const requestIds = [
                    ...new Set(
                        loadedRequests
                            .map((request) => request.id)
                            .filter(
                                (id): id is string =>
                                    typeof id === "string" &&
                                    id.length > 0,
                            ),
                    ),
                ];

                if (requestIds.length === 0) {
                    setRefunds([]);
                    return;
                }

                const {
                    data: refundData,
                    error: refundError,
                } = await supabase
                    .from("refunds")
                    .select("*")
                    .in("return_request_id", requestIds)
                    .order("created_at", { ascending: false });

                if (refundError) {
                    throw new Error(refundError.message);
                }

                if (!cancelled) {
                    setRefunds((refundData ?? []) as AnyRow[]);
                }
            } catch (err) {
                if (!cancelled) {
                    setError(
                        err instanceof Error
                            ? err.message
                            : "Could not load return and refund details.",
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        void loadReturnRefundData();

        return () => {
            cancelled = true;
        };
    }, [open, order.id, supabase]);

    const refundsByRequestId = useMemo(() => {
        const grouped = new Map<string, AnyRow[]>();

        for (const refund of refunds) {
            const requestId = refund.return_request_id;

            if (typeof requestId !== "string") {
                continue;
            }

            const existing = grouped.get(requestId) ?? [];
            existing.push(refund);
            grouped.set(requestId, existing);
        }

        return grouped;
    }, [refunds]);

    const refundTotals = useMemo(() => {
        let completed = 0;
        let reserved = 0;

        for (const refund of refunds) {
            const amount = getRefundAmount(refund);
            const status = getRefundStatus(refund);

            if (status === "COMPLETED") {
                completed += amount;
            }

            if (RESERVED_REFUND_STATUSES.includes(status)) {
                reserved += amount;
            }
        }

        return {
            completed,
            pending: Math.max(0, reserved - completed),
        };
    }, [refunds]);

    const totalAmount = Number(order.total_amount ?? 0);
    const paidAmount = Number(order.amount_paid ?? 0);

    if (loading) {
        return (
            <section className="rounded-xl border p-4 sm:p-5">
                <div className="flex items-center gap-2">
                    <RotateCcw className="h-4 w-4 text-muted-foreground" />
                    <h3 className="text-sm font-semibold">
                        Return & Refund Details
                    </h3>
                </div>

                <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock3 className="h-4 w-4 animate-pulse" />
                    Loading return and refund records...
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <section className="rounded-xl border border-red-200 p-4 sm:p-5">
                <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <h3 className="text-sm font-semibold">
                        Return & Refund Details
                    </h3>
                </div>

                <p className="mt-3 text-sm text-red-700">
                    Could not load return/refund information: {error}
                </p>

                <p className="mt-2 text-xs text-muted-foreground">
                    No conclusion about whether this order was returned can be
                    made until the records load successfully. Check Supabase
                    permissions and try reopening the dialog.
                </p>
            </section>
        );
    }

    return (
        <section className="overflow-hidden rounded-xl border">
            <div className="flex items-start justify-between gap-3 border-b bg-muted/20 px-4 py-4 sm:px-5">
                <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border bg-background">
                        <RotateCcw className="h-4 w-4" />
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold">
                            Return & Refund Details
                        </h3>
                        <p className="mt-1 text-xs text-muted-foreground">
                            Return and refund records linked to this order.
                        </p>
                    </div>
                </div>

                <span className="shrink-0 rounded-full border bg-background px-2.5 py-1 text-xs text-muted-foreground">
                    {requests.length}{" "}
                    {requests.length === 1 ? "request" : "requests"}
                </span>
            </div>

            <div className="space-y-4 p-4 sm:p-5">
                {requests.length === 0 ? (
                    <div className="rounded-lg border border-dashed p-4">
                        <div className="flex items-start gap-3">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                                <RotateCcw className="h-4 w-4 text-muted-foreground" />
                            </div>

                            <div>
                                <p className="text-sm font-medium">
                                    Not returned
                                </p>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    No return request is recorded for this
                                    order.
                                </p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {requests.map((request, index) => {
                            const requestRefunds =
                                refundsByRequestId.get(request.id) ?? [];

                            const requestStatus = getText(
                                request,
                                ["status"],
                                "UNKNOWN",
                            ).toUpperCase();

                            const reason = getText(
                                request,
                                ["reason", "return_reason", "customer_reason"],
                                "No reason recorded",
                            );

                            const requestDate = getText(
                                request,
                                ["created_at", "requested_at"],
                            );

                            const staffNotes = getText(
                                request,
                                ["staff_notes", "review_notes", "admin_notes"],
                            );

                            const requestRefunded = requestRefunds
                                .filter(
                                    (refund) =>
                                        getRefundStatus(refund) === "COMPLETED",
                                )
                                .reduce(
                                    (sum, refund) =>
                                        sum + getRefundAmount(refund),
                                    0,
                                );

                            return (
                                <article
                                    key={request.id ?? index}
                                    className="rounded-lg border p-4"
                                >
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <div>
                                            <p className="text-sm font-semibold">
                                                Return request{" "}
                                                {requests.length > 1
                                                    ? `#${index + 1}`
                                                    : ""}
                                            </p>
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                Requested:{" "}
                                                {formatDate(requestDate)}
                                            </p>
                                        </div>

                                        <StatusBadge status={requestStatus} />
                                    </div>

                                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                        <InfoField
                                            label="Return reason"
                                            value={reason}
                                        />

                                        <InfoField
                                            label="Last updated"
                                            value={formatDate(
                                                request.updated_at ??
                                                request.reviewed_at ??
                                                request.received_at,
                                            )}
                                        />

                                        <InfoField
                                            label="Refund completed for this request"
                                            value={formatCurrency(requestRefunded)}
                                        />

                                        <InfoField
                                            label="Refund records"
                                            value={String(requestRefunds.length)}
                                        />
                                    </div>

                                    {staffNotes && (
                                        <div className="mt-3 rounded-md bg-muted/40 p-3">
                                            <p className="text-xs font-medium text-muted-foreground">
                                                Staff notes
                                            </p>
                                            <p className="mt-1 whitespace-pre-wrap text-sm">
                                                {staffNotes}
                                            </p>
                                        </div>
                                    )}

                                    {requestRefunds.length > 0 && (
                                        <div className="mt-4">
                                            <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                                Refund transactions
                                            </h4>

                                            <div className="mt-2 space-y-2">
                                                {requestRefunds.map(
                                                    (refund, refundIndex) => {
                                                        const refundStatus =
                                                            getRefundStatus(refund);

                                                        return (
                                                            <div
                                                                key={
                                                                    refund.id ??
                                                                    refundIndex
                                                                }
                                                                className="rounded-lg border bg-muted/10 p-3"
                                                            >
                                                                <div className="flex flex-wrap items-center justify-between gap-2">
                                                                    <span className="text-sm font-semibold">
                                                                        {formatCurrency(
                                                                            getRefundAmount(
                                                                                refund,
                                                                            ),
                                                                        )}
                                                                    </span>

                                                                    <StatusBadge
                                                                        status={
                                                                            refundStatus
                                                                        }
                                                                    />
                                                                </div>

                                                                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                                                                    <InfoField
                                                                        label="Refund method"
                                                                        value={getText(
                                                                            refund,
                                                                            [
                                                                                "refund_method",
                                                                                "method",
                                                                            ],
                                                                            "Not recorded",
                                                                        )}
                                                                    />

                                                                    <InfoField
                                                                        label="Created"
                                                                        value={formatDate(
                                                                            refund.created_at,
                                                                        )}
                                                                    />

                                                                    <InfoField
                                                                        label="Payment reference"
                                                                        value={getText(
                                                                            refund,
                                                                            [
                                                                                "payment_reference",
                                                                                "transaction_reference",
                                                                                "refund_reference",
                                                                                "reference_number",
                                                                            ],
                                                                            "Not recorded",
                                                                        )}
                                                                    />

                                                                    <InfoField
                                                                        label="Completed"
                                                                        value={formatDate(
                                                                            refund.completed_at ??
                                                                            refund.refunded_at,
                                                                        )}
                                                                    />
                                                                </div>
                                                            </div>
                                                        );
                                                    },
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </article>
                            );
                        })}
                    </div>
                )}

                <div className="grid gap-3 sm:grid-cols-3">
                    <MetricCard
                        icon={<Wallet className="h-4 w-4" />}
                        label="Order total"
                        value={formatCurrency(totalAmount)}
                    />

                    <MetricCard
                        icon={<Wallet className="h-4 w-4" />}
                        label="Verified amount paid"
                        value={formatCurrency(paidAmount)}
                    />

                    <MetricCard
                        icon={<RotateCcw className="h-4 w-4" />}
                        label="Refunds completed"
                        value={formatCurrency(refundTotals.completed)}
                    />
                </div>

                {refundTotals.pending > 0 && (
                    <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                        <Clock3 className="mt-0.5 h-4 w-4 shrink-0" />
                        <div>
                            <p className="font-medium">
                                Refunds awaiting completion
                            </p>
                            <p className="mt-1">
                                {formatCurrency(refundTotals.pending)} is
                                recorded as pending or processing. It is not
                                counted as money already refunded.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}

function InfoField({
    label,
    value,
}: {
    label: string;
    value: string;
}) {
    return (
        <div className="min-w-0">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="mt-1 break-words text-sm font-medium">
                {value || "Not recorded"}
            </p>
        </div>
    );
}

function MetricCard({
    icon,
    label,
    value,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
}) {
    return (
        <div className="rounded-lg border p-3">
            <div className="flex items-center gap-2 text-muted-foreground">
                {icon}
                <span className="text-xs">{label}</span>
            </div>
            <p className="mt-2 text-base font-semibold">{value}</p>
        </div>
    );
}

export default function OrderDetailsDialog({
    open,
    order,
    onClose,

    editStatus,
    editPaymentStatus,
    editAmountPaid,

    onStatusChange,
    onPaymentStatusChange,
    onAmountPaidChange,

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
                            Review customer, payment, delivery, return and
                            refund information.
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
                            editPaymentStatus={editPaymentStatus}
                            onStatusChange={onStatusChange}
                            onPaymentStatusChange={onPaymentStatusChange}
                            onSave={onSaveOrder}
                            saving={orderSaving}
                            hasChanges={orderHasChanges}
                        />

                        <OrderCustomerSection order={order} />

                        <OrderItemsSection order={order} />

                        <OrderAddressSection order={order} />

                        <OrderShipmentSection
                            shipment={shipment}
                            loading={shipmentLoading}
                            deliveryPartner={deliveryPartner}
                            trackingNumber={trackingNumber}
                            trackingUrl={trackingUrl}
                            deliveryNotes={deliveryNotes}
                            shippedAt={shippedAt}
                            outForDeliveryAt={outForDeliveryAt}
                            deliveredAt={deliveredAt}
                            onDeliveryPartnerChange={onDeliveryPartnerChange}
                            onTrackingNumberChange={onTrackingNumberChange}
                            onTrackingUrlChange={onTrackingUrlChange}
                            onDeliveryNotesChange={onDeliveryNotesChange}
                            onShippedAtChange={onShippedAtChange}
                            onOutForDeliveryAtChange={onOutForDeliveryAtChange}
                            onDeliveredAtChange={onDeliveredAtChange}
                            onSave={onSaveShipment}
                            saving={shipmentSaving}
                            hasChanges={shipmentHasChanges}
                        />

                        <OrderPaymentSection
                            order={order}
                            editPaymentStatus={editPaymentStatus}
                            editAmountPaid={editAmountPaid}
                            onPaymentStatusChange={onPaymentStatusChange}
                            onAmountPaidChange={onAmountPaidChange}
                            onSave={onSaveOrder}
                            saving={orderSaving}
                            hasChanges={orderHasChanges}
                        />

                        {/* Real Supabase return/refund records for this order */}
                        <ReturnRefundSection
                            open={open}
                            order={order}
                        />

                        <OrderSummarySection order={order} />
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
   