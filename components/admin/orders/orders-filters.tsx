"use client";

import {
    CalendarDays,
    RotateCcw,
    Search,
    SlidersHorizontal,
} from "lucide-react";

import {
    ORDER_STATUSES,
    PAYMENT_METHODS,
    PAYMENT_STATUSES,
    paymentMethodLabels,
    paymentStatusLabels,
    statusLabels,
} from "@/lib/orders/orders-constants";

import type {
    OrderFilters,
    SortOrder,
} from "@/lib/orders/orders-types";

interface OrdersFiltersProps {
    filters: OrderFilters;
    sortOrder: SortOrder;

    onFiltersChange: (
        filters: OrderFilters
    ) => void;

    onSortOrderChange: (
        sortOrder: SortOrder
    ) => void;

    onReset: () => void;
}

export default function OrdersFilters({
    filters,
    sortOrder,
    onFiltersChange,
    onSortOrderChange,
    onReset,
}: OrdersFiltersProps) {
    const updateFilter = <K extends keyof OrderFilters>(
        key: K,
        value: OrderFilters[K]
    ) => {
        onFiltersChange({
            ...filters,
            [key]: value,
        });
    };

    const hasActiveFilters =
        filters.search.trim() !== "" ||
        filters.status !== "ALL" ||
        filters.paymentStatus !== "ALL" ||
        filters.paymentMethod !== "ALL" ||
        filters.dateFrom !== "" ||
        filters.dateTo !== "";

    return (
        <div className="rounded-xl border bg-card p-4 shadow-sm">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                    <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />

                    <div>
                        <h2 className="text-sm font-semibold">
                            Filters
                        </h2>

                        <p className="text-xs text-muted-foreground">
                            Search and filter orders
                        </p>
                    </div>
                </div>

                {hasActiveFilters && (
                    <button
                        type="button"
                        onClick={onReset}
                        className="inline-flex w-fit items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition-colors hover:bg-muted"
                    >
                        <RotateCcw className="h-4 w-4" />
                        Reset
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                {/* Search */}
                <div className="xl:col-span-2">
                    <label
                        htmlFor="orders-search"
                        className="mb-1.5 block text-xs font-medium text-muted-foreground"
                    >
                        Search
                    </label>

                    <div className="relative">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                        <input
                            id="orders-search"
                            type="text"
                            value={filters.search}
                            onChange={(event) =>
                                updateFilter(
                                    "search",
                                    event.target.value
                                )
                            }
                            placeholder="Order number, customer, phone, product..."
                            className="h-10 w-full rounded-md border bg-background pl-9 pr-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-1 focus:ring-ring"
                        />
                    </div>
                </div>

                {/* Order status */}
                <div>
                    <label
                        htmlFor="orders-status"
                        className="mb-1.5 block text-xs font-medium text-muted-foreground"
                    >
                        Order Status
                    </label>

                    <select
                        id="orders-status"
                        value={filters.status}
                        onChange={(event) =>
                            updateFilter(
                                "status",
                                event.target.value
                            )
                        }
                        className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none transition-colors focus:border-ring focus:ring-1 focus:ring-ring"
                    >
                        <option value="ALL">
                            All statuses
                        </option>

                        {ORDER_STATUSES.map((status) => (
                            <option
                                key={status}
                                value={status}
                            >
                                {statusLabels[status] ?? status}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Payment status */}
                <div>
                    <label
                        htmlFor="orders-payment-status"
                        className="mb-1.5 block text-xs font-medium text-muted-foreground"
                    >
                        Payment Status
                    </label>

                    <select
                        id="orders-payment-status"
                        value={filters.paymentStatus}
                        onChange={(event) =>
                            updateFilter(
                                "paymentStatus",
                                event.target.value
                            )
                        }
                        className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none transition-colors focus:border-ring focus:ring-1 focus:ring-ring"
                    >
                        <option value="ALL">
                            All payment statuses
                        </option>

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

                {/* Payment method */}
                <div>
                    <label
                        htmlFor="orders-payment-method"
                        className="mb-1.5 block text-xs font-medium text-muted-foreground"
                    >
                        Payment Method
                    </label>

                    <select
                        id="orders-payment-method"
                        value={filters.paymentMethod}
                        onChange={(event) =>
                            updateFilter(
                                "paymentMethod",
                                event.target.value
                            )
                        }
                        className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none transition-colors focus:border-ring focus:ring-1 focus:ring-ring"
                    >
                        <option value="ALL">
                            All payment methods
                        </option>

                        {PAYMENT_METHODS.map(
                            (method) => (
                                <option
                                    key={method}
                                    value={method}
                                >
                                    {paymentMethodLabels[
                                        method
                                    ] ?? method}
                                </option>
                            )
                        )}
                    </select>
                </div>

                {/* Sort */}
                <div>
                    <label
                        htmlFor="orders-sort"
                        className="mb-1.5 block text-xs font-medium text-muted-foreground"
                    >
                        Sort
                    </label>

                    <select
                        id="orders-sort"
                        value={sortOrder}
                        onChange={(event) =>
                            onSortOrderChange(
                                event.target.value as SortOrder
                            )
                        }
                        className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none transition-colors focus:border-ring focus:ring-1 focus:ring-ring"
                    >
                        <option value="newest">
                            Newest first
                        </option>

                        <option value="oldest">
                            Oldest first
                        </option>
                    </select>
                </div>
            </div>

            {/* Date filters */}
            <div className="mt-4 border-t pt-4">
                <div className="mb-3 flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-muted-foreground" />

                    <span className="text-xs font-medium text-muted-foreground">
                        Order Date
                    </span>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                        <label
                            htmlFor="orders-date-from"
                            className="mb-1.5 block text-xs font-medium text-muted-foreground"
                        >
                            From
                        </label>

                        <input
                            id="orders-date-from"
                            type="date"
                            value={filters.dateFrom}
                            onChange={(event) =>
                                updateFilter(
                                    "dateFrom",
                                    event.target.value
                                )
                            }
                            className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none transition-colors focus:border-ring focus:ring-1 focus:ring-ring"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="orders-date-to"
                            className="mb-1.5 block text-xs font-medium text-muted-foreground"
                        >
                            To
                        </label>

                        <input
                            id="orders-date-to"
                            type="date"
                            value={filters.dateTo}
                            onChange={(event) =>
                                updateFilter(
                                    "dateTo",
                                    event.target.value
                                )
                            }
                            className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none transition-colors focus:border-ring focus:ring-1 focus:ring-ring"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}