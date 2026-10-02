"use client";

import {
    CheckCircle2,
    Loader2,
    RefreshCw,
} from "lucide-react";

import {
    ORDER_STATUSES,
    PAYMENT_STATUSES,
    paymentStatusLabels,
    statusLabels,
} from "@/lib/orders/orders-constants";

interface OrderStatusSectionProps {
    editStatus: string;
    editPaymentStatus: string;

    onStatusChange: (value: string) => void;
    onPaymentStatusChange: (value: string) => void;

    onSave: () => void;

    saving: boolean;
    hasChanges: boolean;
}

export default function OrderStatusSection({
    editStatus,
    editPaymentStatus,
    onStatusChange,
    onPaymentStatusChange,
    onSave,
    saving,
    hasChanges,
}: OrderStatusSectionProps) {
    return (
        <section className="rounded-lg border bg-background">
            <div className="border-b px-4 py-3">
                <div className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4 text-muted-foreground" />

                    <h3 className="text-sm font-semibold">
                        Order Status
                    </h3>
                </div>
            </div>

            <div className="space-y-4 p-4">
                <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                        <label
                            htmlFor="edit-order-status"
                            className="mb-1.5 block text-xs font-medium text-muted-foreground"
                        >
                            Order Status
                        </label>

                        <select
                            id="edit-order-status"
                            value={editStatus}
                            onChange={(event) =>
                                onStatusChange(
                                    event.target.value
                                )
                            }
                            className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring"
                        >
                            {ORDER_STATUSES.map((status) => (
                                <option
                                    key={status}
                                    value={status}
                                >
                                    {statusLabels[status] ??
                                        status}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label
                            htmlFor="edit-payment-status"
                            className="mb-1.5 block text-xs font-medium text-muted-foreground"
                        >
                            Payment Status
                        </label>

                        <select
                            id="edit-payment-status"
                            value={editPaymentStatus}
                            onChange={(event) =>
                                onPaymentStatusChange(
                                    event.target.value
                                )
                            }
                            className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring"
                        >
                            {PAYMENT_STATUSES.map(
                                (status) => (
                                    <option
                                        key={status}
                                        value={status}
                                    >
                                        {paymentStatusLabels[
                                            status
                                        ] ?? status}
                                    </option>
                                )
                            )}
                        </select>
                    </div>
                </div>

                {hasChanges && (
                    <div className="flex flex-col gap-3 rounded-md border border-amber-200 bg-amber-50 p-3 dark:border-amber-900/50 dark:bg-amber-950/20 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-xs text-amber-700 dark:text-amber-300">
                            You have unsaved order changes.
                        </p>

                        <button
                            type="button"
                            onClick={onSave}
                            disabled={saving}
                            className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:pointer-events-none disabled:opacity-50"
                        >
                            {saving ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <CheckCircle2 className="h-4 w-4" />
                            )}

                            {saving
                                ? "Saving..."
                                : "Save Changes"}
                        </button>
                    </div>
                )}
            </div>
        </section>
    );
}