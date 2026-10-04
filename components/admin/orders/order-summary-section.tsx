"use client";

import { Receipt } from "lucide-react";

import type { OrderRow } from "@/lib/orders/orders-types";
import { formatCurrency } from "@/lib/orders/orders-utils";

interface OrderSummarySectionProps {
    order: OrderRow;
}

export default function OrderSummarySection({
    order,
}: OrderSummarySectionProps) {
    return (
        <section className="rounded-lg border bg-background">
            <div className="border-b px-4 py-3">
                <div className="flex items-center gap-2">
                    <Receipt className="h-4 w-4 text-muted-foreground" />

                    <h3 className="text-sm font-semibold">
                        Order Summary
                    </h3>
                </div>
            </div>

            <div className="space-y-3 p-4">
                <div className="flex items-center justify-between gap-4 text-sm">
                    <span className="text-muted-foreground">
                        Subtotal
                    </span>

                    <span className="font-medium">
                        {formatCurrency(order.subtotal)}
                    </span>
                </div>

                <div className="flex items-center justify-between gap-4 text-sm">
                    <span className="text-muted-foreground">
                        Shipping
                    </span>

                    <span className="font-medium">
                        {formatCurrency(
                            order.shipping_amount
                        )}
                    </span>
                </div>

                {order.discount_amount > 0 && (
                    <div className="flex items-center justify-between gap-4 text-sm">
                        <span className="text-muted-foreground">
                            Discount
                        </span>

                        <span className="font-medium text-green-600">
                            -{" "}
                            {formatCurrency(
                                order.discount_amount
                            )}
                        </span>
                    </div>
                )}

                <div className="border-t pt-3">
                    <div className="flex items-center justify-between gap-4">
                        <span className="font-semibold">
                            Total
                        </span>

                        <span className="text-lg font-bold">
                            {formatCurrency(
                                order.total_amount
                            )}
                        </span>
                    </div>
                </div>
            </div>

            {order.notes && (
                <div className="border-t p-4">
                    <p className="text-xs font-medium text-muted-foreground">
                        Order Notes
                    </p>

                    <p className="mt-1 whitespace-pre-wrap text-sm">
                        {order.notes}
                    </p>
                </div>
            )}
        </section>
    );
}