"use client";

import { paymentMethodLabels, paymentStatusLabels, statusLabels } from "@/lib/orders/orders-constants";
import { OrderRow } from "@/lib/orders/orders-types";
import { formatCurrency, formatDate, getPaymentStatusClass, getStatusClass } from "@/lib/orders/orders-utils";
import { ChevronRight, Package } from "lucide-react";


interface OrdersTableViewProps {
    orders: OrderRow[];
    onOpenOrder: (order: OrderRow) => void;
}

export default function OrdersTableView({
    orders,
    onOpenOrder,
}: OrdersTableViewProps) {
    if (orders.length === 0) {
        return (
            <div className="rounded-xl border bg-card shadow-sm">
                <div className="flex min-h-[260px] flex-col items-center justify-center px-6 py-12 text-center">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                        <Package className="h-6 w-6 text-muted-foreground" />
                    </div>

                    <h3 className="text-sm font-semibold">
                        No orders found
                    </h3>

                    <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                        Try changing your search or filters
                        to find orders.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full min-w-[1050px] text-sm">
                    <thead className="border-b bg-muted/40">
                        <tr>
                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                                Order
                            </th>

                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                                Customer
                            </th>

                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                                Items
                            </th>

                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                                Total
                            </th>

                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                                Payment
                            </th>

                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                                Status
                            </th>

                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                                Date
                            </th>

                            <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                                <span className="sr-only">
                                    Actions
                                </span>
                            </th>
                        </tr>
                    </thead>

                    <tbody className="divide-y">
                        {orders.map((order) => (
                            <tr
                                key={order.id}
                                className="group transition-colors hover:bg-muted/30"
                            >
                                {/* Order */}
                                <td className="px-4 py-4 align-top">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            onOpenOrder(order)
                                        }
                                        className="text-left"
                                    >
                                        <div className="font-medium hover:underline">
                                            {order.order_number}
                                        </div>

                                        <div className="mt-1 text-xs text-muted-foreground">
                                            {order.id.slice(
                                                0,
                                                8
                                            )}
                                        </div>
                                    </button>
                                </td>

                                {/* Customer */}
                                <td className="px-4 py-4 align-top">
                                    <div className="max-w-[220px]">
                                        <p className="truncate font-medium">
                                            {order.customer_name ||
                                                "Guest"}
                                        </p>

                                        <p className="mt-1 truncate text-xs text-muted-foreground">
                                            {order.customer_phone ||
                                                "No phone"}
                                        </p>
                                    </div>
                                </td>

                                {/* Items */}
                                <td className="px-4 py-4 align-top">
                                    <div>
                                        <p className="font-medium">
                                            {order.items.length}{" "}
                                            {order.items.length ===
                                                1
                                                ? "item"
                                                : "items"}
                                        </p>

                                        <p className="mt-1 max-w-[200px] truncate text-xs text-muted-foreground">
                                            {order.items
                                                .map(
                                                    (
                                                        item
                                                    ) =>
                                                        `${item.product_name} × ${item.quantity}`
                                                )
                                                .join(
                                                    ", "
                                                )}
                                        </p>
                                    </div>
                                </td>

                                {/* Total */}
                                <td className="px-4 py-4 align-top">
                                    <p className="font-semibold">
                                        {formatCurrency(
                                            order.total_amount
                                        )}
                                    </p>

                                    {order.discount_amount >
                                        0 && (
                                            <p className="mt-1 text-xs text-green-600">
                                                Discount:{" "}
                                                {formatCurrency(order.discount_amount)}
                                            </p>
                                        )}
                                </td>

                                {/* Payment */}
                                <td className="px-4 py-4 align-top">
                                    <div className="space-y-1.5">
                                        <span
                                            className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getPaymentStatusClass(
                                                order.payment_status
                                            )}`}
                                        >
                                            {paymentStatusLabels[
                                                order
                                                    .payment_status
                                            ] ??
                                                order.payment_status}
                                        </span>

                                        <p className="text-xs text-muted-foreground">
                                            {order.payment_method
                                                ? paymentMethodLabels[
                                                order
                                                    .payment_method
                                                ] ??
                                                order.payment_method
                                                : "Not specified"}
                                        </p>
                                    </div>
                                </td>

                                {/* Status */}
                                <td className="px-4 py-4 align-top">
                                    <span
                                        className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${getStatusClass(
                                            order.status
                                        )}`}
                                    >
                                        {statusLabels[order.status] ?? order.status}
                                    </span>
                                </td>

                                {/* Date */}
                                <td className="px-4 py-4 align-top">
                                    <p className="whitespace-nowrap text-sm">
                                        {formatDate(
                                            order.created_at
                                        )}
                                    </p>
                                </td>

                                {/* Action */}
                                <td className="px-4 py-4 text-right align-top">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            onOpenOrder(order)
                                        }
                                        className="inline-flex h-9 w-9 items-center justify-center rounded-md border opacity-70 transition-all hover:bg-muted hover:opacity-100"
                                        aria-label={`View order ${order.order_number}`}
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile hint */}
            <div className="border-t px-4 py-2 text-center text-xs text-muted-foreground md:hidden">
                Swipe horizontally to view all order details.
            </div>
        </div>
    );
}