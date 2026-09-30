"use client";

import Image from "next/image";
import { Package } from "lucide-react";

import type { OrderRow } from "@/lib/orders/orders-types";
import { formatCurrency } from "@/lib/orders/orders-utils";

interface OrderItemsSectionProps {
    order: OrderRow;
}

export default function OrderItemsSection({
    order,
}: OrderItemsSectionProps) {
    return (
        <section className="rounded-lg border bg-background">
            <div className="border-b px-4 py-3">
                <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-muted-foreground" />

                    <h3 className="text-sm font-semibold">
                        Order Items
                    </h3>

                    <span className="text-xs text-muted-foreground">
                        ({order.items.length})
                    </span>
                </div>
            </div>

            <div className="divide-y">
                {order.items.length === 0 ? (
                    <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                        No items found for this order.
                    </div>
                ) : (
                    order.items.map((item) => (
                        <div
                            key={item.id}
                            className="flex gap-3 p-4"
                        >
                            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md border bg-muted">
                                {item.product_image ? (
                                    <Image
                                        src={item.product_image}
                                        alt={item.product_name}
                                        fill
                                        sizes="64px"
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center">
                                        <Package className="h-6 w-6 text-muted-foreground" />
                                    </div>
                                )}
                            </div>

                            <div className="min-w-0 flex-1">
                                <p className="font-medium">
                                    {item.product_name}
                                </p>

                                {item.product_sku && (
                                    <p className="mt-0.5 text-xs text-muted-foreground">
                                        SKU: {item.product_sku}
                                    </p>
                                )}

                                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                                    <span>
                                        Qty: {item.quantity}
                                    </span>

                                    <span>
                                        Unit:{" "}
                                        {formatCurrency(
                                            item.unit_price
                                        )}
                                    </span>
                                </div>
                            </div>

                            <div className="shrink-0 text-right">
                                <p className="font-semibold">
                                    {formatCurrency(
                                        item.total_price
                                    )}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </section>
    );
}