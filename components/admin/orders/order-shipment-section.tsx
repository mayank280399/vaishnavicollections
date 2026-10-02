"use client";

import { Shipment } from "@/lib/orders/orders-types";
import { formatOptionalDate } from "@/lib/orders/orders-utils";
import {
    CheckCircle2,
    ExternalLink,
    Loader2,
    PackageCheck,
    Truck,
} from "lucide-react";

// import type { Shipment } from "@/lib/orders/orders-types";
// import { formatOptionalDate } from "@/lib/orders/orders-utils";

interface OrderShipmentSectionProps {
    shipment: Shipment | null;

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

    onSave: () => void;

    saving: boolean;
    loading: boolean;
    hasChanges: boolean;
}

export default function OrderShipmentSection({
    shipment,

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

    onSave,

    saving,
    loading,
    hasChanges,
}: OrderShipmentSectionProps) {
    return (
        <section className="rounded-lg border bg-background">
            <div className="border-b px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <Truck className="h-4 w-4 text-muted-foreground" />

                        <div>
                            <h3 className="text-sm font-semibold">
                                Shipment & Delivery
                            </h3>

                            <p className="text-xs text-muted-foreground">
                                Track courier dispatch and delivery
                            </p>
                        </div>
                    </div>

                    {shipment && (
                        <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700 dark:bg-green-950/40 dark:text-green-300">
                            Shipment created
                        </span>
                    )}
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center gap-2 px-4 py-10 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading shipment...
                </div>
            ) : (
                <div className="space-y-5 p-4">
                    {/* Courier information */}
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label
                                htmlFor="shipment-delivery-partner"
                                className="mb-1.5 block text-xs font-medium text-muted-foreground"
                            >
                                Delivery Partner
                            </label>

                            <input
                                id="shipment-delivery-partner"
                                type="text"
                                value={deliveryPartner}
                                onChange={(event) =>
                                    onDeliveryPartnerChange(
                                        event.target.value
                                    )
                                }
                                placeholder="e.g. Delhivery, Blue Dart"
                                className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-1 focus:ring-ring"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="shipment-tracking-number"
                                className="mb-1.5 block text-xs font-medium text-muted-foreground"
                            >
                                Tracking / AWB Number
                            </label>

                            <input
                                id="shipment-tracking-number"
                                type="text"
                                value={trackingNumber}
                                onChange={(event) =>
                                    onTrackingNumberChange(
                                        event.target.value
                                    )
                                }
                                placeholder="Enter AWB or tracking number"
                                className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-1 focus:ring-ring"
                            />
                        </div>
                    </div>

                    {/* Tracking URL */}
                    <div>
                        <label
                            htmlFor="shipment-tracking-url"
                            className="mb-1.5 block text-xs font-medium text-muted-foreground"
                        >
                            Tracking URL
                        </label>

                        <div className="flex gap-2">
                            <input
                                id="shipment-tracking-url"
                                type="url"
                                value={trackingUrl}
                                onChange={(event) =>
                                    onTrackingUrlChange(
                                        event.target.value
                                    )
                                }
                                placeholder="https://..."
                                className="h-10 min-w-0 flex-1 rounded-md border bg-background px-3 text-sm outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-1 focus:ring-ring"
                            />

                            {trackingUrl.trim() && (
                                <a
                                    href={trackingUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex h-10 shrink-0 items-center gap-2 rounded-md border px-3 text-sm font-medium hover:bg-muted"
                                >
                                    <ExternalLink className="h-4 w-4" />

                                    <span className="hidden sm:inline">
                                        Open
                                    </span>
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Timeline */}
                    <div className="rounded-lg border bg-muted/20 p-4">
                        <div className="mb-4 flex items-center gap-2">
                            <PackageCheck className="h-4 w-4 text-muted-foreground" />

                            <h4 className="text-sm font-semibold">
                                Delivery Timeline
                            </h4>
                        </div>

                        <div className="space-y-4">
                            <ShipmentTimelineItem
                                title="Shipped"
                                date={shippedAt}
                                active={Boolean(shippedAt)}
                            />

                            <ShipmentTimelineItem
                                title="Out for Delivery"
                                date={outForDeliveryAt}
                                active={Boolean(
                                    outForDeliveryAt
                                )}
                            />

                            <ShipmentTimelineItem
                                title="Delivered"
                                date={deliveredAt}
                                active={Boolean(deliveredAt)}
                                last
                            />
                        </div>
                    </div>

                    {/* Manual timestamp controls */}
                    <div className="grid gap-4 sm:grid-cols-3">
                        <ShipmentDateInput
                            id="shipment-shipped-at"
                            label="Shipped At"
                            value={toDateTimeLocal(shippedAt)}
                            onChange={(value) =>
                                onShippedAtChange(
                                    value
                                        ? new Date(
                                              value
                                          ).toISOString()
                                        : null
                                )
                            }
                        />

                        <ShipmentDateInput
                            id="shipment-out-for-delivery-at"
                            label="Out for Delivery At"
                            value={toDateTimeLocal(
                                outForDeliveryAt
                            )}
                            onChange={(value) =>
                                onOutForDeliveryAtChange(
                                    value
                                        ? new Date(
                                              value
                                          ).toISOString()
                                        : null
                                )
                            }
                        />

                        <ShipmentDateInput
                            id="shipment-delivered-at"
                            label="Delivered At"
                            value={toDateTimeLocal(
                                deliveredAt
                            )}
                            onChange={(value) =>
                                onDeliveredAtChange(
                                    value
                                        ? new Date(
                                              value
                                          ).toISOString()
                                        : null
                                )
                            }
                        />
                    </div>

                    {/* Notes */}
                    <div>
                        <label
                            htmlFor="shipment-delivery-notes"
                            className="mb-1.5 block text-xs font-medium text-muted-foreground"
                        >
                            Delivery Notes
                        </label>

                        <textarea
                            id="shipment-delivery-notes"
                            value={deliveryNotes}
                            onChange={(event) =>
                                onDeliveryNotesChange(
                                    event.target.value
                                )
                            }
                            rows={3}
                            placeholder="Add courier or delivery notes..."
                            className="w-full resize-y rounded-md border bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-1 focus:ring-ring"
                        />
                    </div>

                    {/* Save */}
                    {hasChanges && (
                        <div className="flex flex-col gap-3 rounded-md border border-amber-200 bg-amber-50 p-3 dark:border-amber-900/50 dark:bg-amber-950/20 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-xs text-amber-700 dark:text-amber-300">
                                You have unsaved shipment changes.
                            </p>

                            <button
                                type="button"
                                onClick={onSave}
                                disabled={saving}
                                className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:pointer-events-none disabled:opacity-50"
                            >
                                {saving ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <CheckCircle2 className="h-4 w-4" />
                                )}

                                {saving
                                    ? "Saving..."
                                    : "Save Shipment"}
                            </button>
                        </div>
                    )}
                </div>
            )}
        </section>
    );
}

interface ShipmentTimelineItemProps {
    title: string;
    date: string | null;
    active: boolean;
    last?: boolean;
}

function ShipmentTimelineItem({
    title,
    date,
    active,
    last = false,
}: ShipmentTimelineItemProps) {
    return (
        <div className="flex gap-3">
            <div className="flex flex-col items-center">
                <div
                    className={`flex h-7 w-7 items-center justify-center rounded-full border ${
                        active
                            ? "border-green-500 bg-green-50 text-green-600 dark:bg-green-950/40"
                            : "border-muted-foreground/30 bg-background text-muted-foreground"
                    }`}
                >
                    <div
                        className={`h-2.5 w-2.5 rounded-full ${
                            active
                                ? "bg-green-500"
                                : "bg-muted-foreground/30"
                        }`}
                    />
                </div>

                {!last && (
                    <div
                        className={`mt-1 min-h-6 w-px ${
                            active
                                ? "bg-green-300 dark:bg-green-800"
                                : "bg-border"
                        }`}
                    />
                )}
            </div>

            <div className="min-w-0 pb-3">
                <p className="text-sm font-medium">
                    {title}
                </p>

                <p className="mt-0.5 text-xs text-muted-foreground">
                    {date
                        ? formatOptionalDate(date)
                        : "Not recorded"}
                </p>
            </div>
        </div>
    );
}

interface ShipmentDateInputProps {
    id: string;
    label: string;
    value: string;
    onChange: (value: string) => void;
}

function ShipmentDateInput({
    id,
    label,
    value,
    onChange,
}: ShipmentDateInputProps) {
    return (
        <div>
            <label
                htmlFor={id}
                className="mb-1.5 block text-xs font-medium text-muted-foreground"
            >
                {label}
            </label>

            <input
                id={id}
                type="datetime-local"
                value={value}
                onChange={(event) =>
                    onChange(event.target.value)
                }
                className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring"
            />
        </div>
    );
}

function toDateTimeLocal(
    value: string | null
) {
    if (!value) {
        return "";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "";
    }

    const year = date.getFullYear();
    const month = String(
        date.getMonth() + 1
    ).padStart(2, "0");
    const day = String(
        date.getDate()
    ).padStart(2, "0");
    const hours = String(
        date.getHours()
    ).padStart(2, "0");
    const minutes = String(
        date.getMinutes()
    ).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}`;
}