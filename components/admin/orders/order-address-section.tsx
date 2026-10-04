"use client";

import { MapPin } from "lucide-react";

import type { OrderRow } from "@/lib/orders/orders-types";

interface OrderAddressSectionProps {
    order: OrderRow;
}

export default function OrderAddressSection({
    order,
}: OrderAddressSectionProps) {
    return (
        <section className="rounded-lg border bg-background">
            <div className="border-b px-4 py-3">
                <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />

                    <h3 className="text-sm font-semibold">
                        Delivery Address
                    </h3>
                </div>
            </div>

            <div className="p-4">
                <div className="rounded-md bg-muted/40 p-3 text-sm leading-6">
                    <p>{order.customer_name}</p>

                    <p>{order.shipping_address_line1}</p>

                    {order.shipping_address_line2 && (
                        <p>{order.shipping_address_line2}</p>
                    )}

                    <p>
                        {order.shipping_city},{" "}
                        {order.shipping_state}
                    </p>

                    <p>
                        {order.shipping_postal_code}
                    </p>

                    <p>{order.shipping_country}</p>

                    {order.customer_phone && (
                        <p className="mt-2 border-t pt-2 text-muted-foreground">
                            Phone: {order.customer_phone}
                        </p>
                    )}
                </div>
            </div>
        </section>
    );
}