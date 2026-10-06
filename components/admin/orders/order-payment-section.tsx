"use client";

import {
    AlertCircle,
    CheckCircle2,
    CreditCard,
    IndianRupee,
} from "lucide-react";

import type { OrderRow } from "@/lib/orders/orders-types";

import {
    formatCurrency,
    getPaymentStatusClass,
} from "@/lib/orders/orders-utils";

import {
    paymentMethodLabels,
    paymentStatusLabels,
} from "@/lib/orders/orders-constants";

interface OrderPaymentSectionProps {
    order: OrderRow;

    editPaymentStatus: string;
    editAmountPaid: string;

    onPaymentStatusChange: (
        value: string
    ) => void;

    onAmountPaidChange: (
        value: string
    ) => void;

    onSave: () => void;

    saving: boolean;
    hasChanges: boolean;
}

export default function OrderPaymentSection({
    order,

    editPaymentStatus,
    editAmountPaid,

    onPaymentStatusChange,
    onAmountPaidChange,

    onSave,

    saving,
    hasChanges,
}: OrderPaymentSectionProps) {
    const isPartialPayment =
        order.payment_plan === "PARTIAL";

    const paymentPlanLabel = isPartialPayment
        ? "Partial UPI"
        : "Full UPI";

    const totalAmount = Number(
        order.total_amount ?? 0
    );

    const currentAmountPaid = Number(
        order.amount_paid ?? 0
    );

    const currentAmountDue = Number(
        order.amount_due ?? 0
    );

    const editedAmountPaid =
        editAmountPaid.trim() === ""
            ? 0
            : Number(editAmountPaid);

    const editedAmountIsValid =
        Number.isFinite(editedAmountPaid) &&
        editedAmountPaid >= 0 &&
        editedAmountPaid <= totalAmount;

    const editedAmountDue = Math.max(
        totalAmount - editedAmountPaid,
        0
    );

    const isEditedPaymentFullyPaid =
        editedAmountPaid === totalAmount &&
        totalAmount > 0;

    const isEditedPaymentPartiallyPaid =
        editedAmountPaid > 0 &&
        editedAmountPaid < totalAmount;

    const isPaymentPending =
        editPaymentStatus === "PENDING";

    const isPaymentPartiallyPaid =
        editPaymentStatus ===
        "PARTIALLY_PAID";

    const isPaymentPaid =
        editPaymentStatus === "PAID";

    const showAmountEditor =
        isPaymentPending ||
        isPaymentPartiallyPaid ||
        isPaymentPaid;

    function handleAmountChange(
        value: string
    ) {
        // Allow the field to be temporarily empty
        // while the admin is typing.
        if (value === "") {
            onAmountPaidChange("");
            return;
        }

        // Only allow numeric values with an optional
        // decimal portion.
        if (!/^\d*\.?\d*$/.test(value)) {
            return;
        }

        onAmountPaidChange(value);
    }

    function handlePaymentStatusChange(
        value: string
    ) {
        onPaymentStatusChange(value);

        /*
         * Keep the amount field sensible when the
         * admin changes the payment status.
         *
         * PAID -> full order amount
         * PENDING/FAILED -> zero
         *
         * PARTIALLY_PAID keeps the amount currently
         * entered so the admin can verify it.
         */
        if (value === "PAID") {
            onAmountPaidChange(
                totalAmount.toFixed(2)
            );
        } else if (
            value === "PENDING" ||
            value === "FAILED"
        ) {
            onAmountPaidChange("0");
        }
    }

    return (
        <section className="rounded-lg border bg-background">
            {/* Header */}
            <div className="border-b px-4 py-3">
                <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />

                    <h3 className="text-sm font-semibold">
                        Payment
                    </h3>
                </div>
            </div>

            <div className="space-y-5 p-4">
                {/* Payment information */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {/* Payment Method */}
                    <div>
                        <p className="text-xs font-medium text-muted-foreground">
                            Payment Method
                        </p>

                        <p className="mt-1 text-sm font-medium">
                            {order.payment_method
                                ? paymentMethodLabels[
                                      order.payment_method
                                  ] ??
                                  order.payment_method
                                : "Not specified"}
                        </p>
                    </div>

                    {/* Payment Plan */}
                    <div>
                        <p className="text-xs font-medium text-muted-foreground">
                            Payment Plan
                        </p>

                        <span
                            className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                                isPartialPayment
                                    ? "bg-amber-100 text-amber-800"
                                    : "bg-blue-100 text-blue-800"
                            }`}
                        >
                            {paymentPlanLabel}
                        </span>
                    </div>

                    {/* Current Payment Status */}
                    <div>
                        <p className="text-xs font-medium text-muted-foreground">
                            Current Payment Status
                        </p>

                        <span
                            className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getPaymentStatusClass(
                                order.payment_status
                            )}`}
                        >
                            {paymentStatusLabels[
                                order.payment_status
                            ] ??
                                order.payment_status}
                        </span>
                    </div>

                    {/* Order Total */}
                    <div>
                        <p className="text-xs font-medium text-muted-foreground">
                            Order Total
                        </p>

                        <div className="mt-1 flex items-center gap-1">
                            <IndianRupee className="h-3.5 w-3.5 text-muted-foreground" />

                            <span className="text-sm font-semibold">
                                {formatCurrency(
                                    totalAmount
                                )}
                            </span>
                        </div>
                    </div>

                    {/* Current Amount Paid */}
                    <div>
                        <p className="text-xs font-medium text-muted-foreground">
                            Amount Paid
                        </p>

                        <div className="mt-1 flex items-center gap-1">
                            <IndianRupee className="h-3.5 w-3.5 text-muted-foreground" />

                            <span className="text-sm font-semibold">
                                {formatCurrency(
                                    currentAmountPaid
                                )}
                            </span>
                        </div>
                    </div>

                    {/* Current Amount Due */}
                    <div>
                        <p className="text-xs font-medium text-muted-foreground">
                            Amount Due
                        </p>

                        <div className="mt-1 flex items-center gap-1">
                            <IndianRupee className="h-3.5 w-3.5 text-muted-foreground" />

                            <span
                                className={`text-sm font-semibold ${
                                    currentAmountDue >
                                    0
                                        ? "text-amber-700"
                                        : "text-emerald-700"
                                }`}
                            >
                                {formatCurrency(
                                    currentAmountDue
                                )}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Editable payment verification */}
                <div className="rounded-lg border bg-muted/20 p-4">
                    <div className="flex flex-col gap-1">
                        <h4 className="text-sm font-semibold">
                            Payment Verification
                        </h4>

                        <p className="text-xs leading-5 text-muted-foreground">
                            Verify the actual amount received
                            before marking the payment as
                            paid or partially paid.
                        </p>
                    </div>

                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                        {/* Payment Status */}
                        <div>
                            <label
                                htmlFor="edit-payment-status"
                                className="text-xs font-medium text-muted-foreground"
                            >
                                Payment Status
                            </label>

                            <select
                                id="edit-payment-status"
                                value={
                                    editPaymentStatus
                                }
                                onChange={(event) =>
                                    handlePaymentStatusChange(
                                        event.target.value
                                    )
                                }
                                disabled={saving}
                                className="mt-1 flex h-10 w-full rounded-md border bg-background px-3 text-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                <option value="PENDING">
                                    Pending
                                </option>

                                <option value="PARTIALLY_PAID">
                                    Partially Paid
                                </option>

                                <option value="PAID">
                                    Paid
                                </option>

                                <option value="FAILED">
                                    Failed
                                </option>

                                <option value="REFUNDED">
                                    Refunded
                                </option>
                            </select>
                        </div>

                        {/* Amount Paid */}
                        {showAmountEditor ? (
                            <div>
                                <label
                                    htmlFor="edit-amount-paid"
                                    className="text-xs font-medium text-muted-foreground"
                                >
                                    Verified Amount Paid
                                </label>

                                <div className="relative mt-1">
                                    <IndianRupee className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                                    <input
                                        id="edit-amount-paid"
                                        type="text"
                                        inputMode="decimal"
                                        value={
                                            editAmountPaid
                                        }
                                        onChange={(event) =>
                                            handleAmountChange(
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
                                        disabled={saving}
                                        placeholder="0"
                                        className="h-10 w-full rounded-md border bg-background pl-9 pr-3 text-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-60"
                                    />
                                </div>

                                {!editedAmountIsValid ? (
                                    <p className="mt-1.5 flex items-center gap-1 text-xs text-red-600">
                                        <AlertCircle className="h-3.5 w-3.5 shrink-0" />

                                        Amount must be between
                                        ₹0 and{" "}
                                        {formatCurrency(
                                            totalAmount
                                        )}
                                        .
                                    </p>
                                ) : null}
                            </div>
                        ) : null}
                    </div>

                    {/* Calculated verification summary */}
                    {showAmountEditor &&
                    editedAmountIsValid ? (
                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                            <div className="rounded-md border bg-background px-3 py-2.5">
                                <p className="text-[11px] font-medium text-muted-foreground">
                                    Verified Amount
                                </p>

                                <p className="mt-0.5 text-sm font-semibold text-emerald-700">
                                    {formatCurrency(
                                        editedAmountPaid
                                    )}
                                </p>
                            </div>

                            <div className="rounded-md border bg-background px-3 py-2.5">
                                <p className="text-[11px] font-medium text-muted-foreground">
                                    Remaining Balance
                                </p>

                                <p
                                    className={`mt-0.5 text-sm font-semibold ${
                                        editedAmountDue >
                                        0
                                            ? "text-amber-700"
                                            : "text-emerald-700"
                                    }`}
                                >
                                    {formatCurrency(
                                        editedAmountDue
                                    )}
                                </p>
                            </div>
                        </div>
                    ) : null}

                    {/* Validation messages */}
                    {isPaymentPaid &&
                    editedAmountIsValid &&
                    !isEditedPaymentFullyPaid ? (
                        <div className="mt-3 flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs text-amber-800">
                            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />

                            <p>
                                A payment marked as{" "}
                                <strong>Paid</strong> must
                                have the full order amount
                                verified.
                            </p>
                        </div>
                    ) : null}

                    {isPaymentPartiallyPaid &&
                    editedAmountIsValid &&
                    !isEditedPaymentPartiallyPaid ? (
                        <div className="mt-3 flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs text-amber-800">
                            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />

                            <p>
                                A partially paid order must
                                have an amount greater than
                                ₹0 and less than the full
                                order total.
                            </p>
                        </div>
                    ) : null}

                    {isPaymentPaid &&
                    editedAmountIsValid &&
                    isEditedPaymentFullyPaid ? (
                        <div className="mt-3 flex items-start gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-xs text-emerald-800">
                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />

                            <p>
                                Full payment amount verified.
                                Saving this will mark the
                                payment as paid.
                            </p>
                        </div>
                    ) : null}

                    {isPaymentPartiallyPaid &&
                    editedAmountIsValid &&
                    isEditedPaymentPartiallyPaid ? (
                        <div className="mt-3 flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs text-amber-800">
                            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />

                            <p>
                                Verify the customer's actual
                                UPI payment before saving.
                                The remaining balance will be
                                calculated automatically.
                            </p>
                        </div>
                    ) : null}

                    {/* Save */}
                    <div className="mt-4 flex justify-end">
                        <button
                            type="button"
                            onClick={onSave}
                            disabled={
                                saving ||
                                !hasChanges ||
                                !editedAmountIsValid ||
                                (isPaymentPaid &&
                                    !isEditedPaymentFullyPaid) ||
                                (isPaymentPartiallyPaid &&
                                    !isEditedPaymentPartiallyPaid)
                            }
                            className="inline-flex h-9 items-center justify-center rounded-md bg-[#0f1f3d] px-4 text-sm font-semibold text-white transition hover:bg-[#172b52] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {saving
                                ? "Saving..."
                                : "Save Payment"}
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}