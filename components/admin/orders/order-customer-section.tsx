"use client";

import { OrderRow } from "@/lib/orders/orders-types";
import {
    Mail,
    Phone,
    User,
} from "lucide-react";



interface OrderCustomerSectionProps {
    order: OrderRow;
}

export default function OrderCustomerSection({
    order,
}: OrderCustomerSectionProps) {
    return (
        <section className="rounded-lg border bg-background">
            <div className="border-b px-4 py-3">
                <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />

                    <h3 className="text-sm font-semibold">
                        Customer
                    </h3>
                </div>
            </div>

            <div className="grid gap-4 p-4 sm:grid-cols-2">
                <div>
                    <p className="text-xs font-medium text-muted-foreground">
                        Name
                    </p>

                    <p className="mt-1 text-sm font-medium">
                        {order.customer_name || "Not provided"}
                    </p>
                </div>

                <div>
                    <p className="text-xs font-medium text-muted-foreground">
                        Phone
                    </p>

                    <div className="mt-1 flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5 text-muted-foreground" />

                        <p className="text-sm">
                            {order.customer_phone || "Not provided"}
                        </p>
                    </div>
                </div>

                {/* 
                  The current OrderRow does not contain customer email.
                  We intentionally do not invent or query additional data here.
                */}
                <div className="sm:col-span-2">
                    <div className="flex items-center gap-2 rounded-md bg-muted/40 px-3 py-2.5">
                        <Mail className="h-4 w-4 text-muted-foreground" />

                        <p className="text-xs text-muted-foreground">
                            Customer email is not included in the
                            current order data.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}