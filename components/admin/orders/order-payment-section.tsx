"use client";

import {
    CreditCard,
    IndianRupee,
} from "lucide-react";

// import {
//     paymentMethodLabels,
//     paymentStatusLabels,
// } from "@/lib/orders/orders-constants";

import type { OrderRow } from "@/lib/orders/orders-types";

import {
    formatCurrency,
    getPaymentStatusClass,
} from "@/lib/orders/orders-utils";
import { paymentMethodLabels, paymentStatusLabels } from "@/lib/orders/orders-constants";

interface OrderPaymentSectionProps {
    order: OrderRow;
}

export default function OrderPaymentSection({
    order,
}: OrderPaymentSectionProps) {
    return (
        <section className="rounded-lg border bg-background">
            <div className="border-b px-4 py-3">
                <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />

                    <h3 className="text-sm font-semibold">
                        Payment
                    </h3>
                </div>
            </div>

            <div className="grid gap-4 p-4 sm:grid-cols-3">
                <div>
                    <p className="text-xs font-medium text-muted-foreground">
                        Payment Method
                    </p>

                    <p className="mt-1 text-sm font-medium">
                        {order.payment_method
                            ? paymentMethodLabels[
                                  order.payment_method
                              ] ?? order.payment_method
                            : "Not specified"}
                    </p>
                </div>

                <div>
                    <p className="text-xs font-medium text-muted-foreground">
                        Payment Status
                    </p>

                    <span
                        className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getPaymentStatusClass(
                            order.payment_status
                        )}`}
                    >
                        {paymentStatusLabels[
                            order.payment_status
                        ] ?? order.payment_status}
                    </span>
                </div>

                <div>
                    <p className="text-xs font-medium text-muted-foreground">
                        Amount
                    </p>

                    <div className="mt-1 flex items-center gap-1">
                        <IndianRupee className="h-3.5 w-3.5 text-muted-foreground" />

                        <span className="text-sm font-semibold">
                            {formatCurrency(
                                order.total_amount
                            )}
                        </span>
                    </div>
                </div>
            </div>
        </section>
    );
}