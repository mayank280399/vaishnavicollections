"use client";

import { OrderSummary } from "@/lib/orders/orders-types";
import { formatCurrency } from "@/lib/orders/orders-utils";
import {
    IndianRupee,
    ShoppingBag,
    Package,
    Clock3,
} from "lucide-react";



interface OrdersSummaryProps {
    summary: OrderSummary;
}

export default function OrdersSummary({
    summary,
}: OrdersSummaryProps) {
    const cards = [
        {
            label: "Total Order Value",
            value: formatCurrency(summary.totalValue),
            icon: IndianRupee,
            description: `${summary.orderCount} order${
                summary.orderCount === 1 ? "" : "s"
            }`,
        },
        {
            label: "Orders",
            value: summary.orderCount.toLocaleString("en-IN"),
            icon: ShoppingBag,
            description: `${summary.itemCount} item${
                summary.itemCount === 1 ? "" : "s"
            }`,
        },
        {
            label: "Average Order",
            value: formatCurrency(summary.average),
            icon: Package,
            description: "Per order",
        },
        {
            label: "Pending Orders",
            value: summary.pendingCount.toLocaleString("en-IN"),
            icon: Clock3,
            description: "Awaiting processing",
        },
    ];

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {cards.map((card) => {
                const Icon = card.icon;

                return (
                    <div
                        key={card.label}
                        className="rounded-xl border bg-card p-4 shadow-sm"
                    >
                        <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                                <p className="text-sm text-muted-foreground">
                                    {card.label}
                                </p>

                                <p className="mt-1 truncate text-xl font-semibold tracking-tight">
                                    {card.value}
                                </p>

                                <p className="mt-1 text-xs text-muted-foreground">
                                    {card.description}
                                </p>
                            </div>

                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                                <Icon className="h-5 w-5 text-muted-foreground" />
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}