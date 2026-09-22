"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Pencil, Trash2 } from "lucide-react";
import { SaleDialog } from "@/components/admin/sales/sale-dialog";
import { createClient } from "@/lib/supabase/client";

type SaleRow = {
    id: string;
    invoice_number: string;
    purchased_at: string;
    total_amount: number;
    payment_method: string | null;
    status: string | null;
    items: {
        product_name: string;
        category_name: string;
        quantity: number;
    }[];
};

export default function SalesTable() {
    const supabase = createClient();
    const [editingSale, setEditingSale] = useState<SaleRow | null>(null);
    const [sales, setSales] = useState<SaleRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [categoryFilter, setCategoryFilter] = useState("all");
    const [paymentFilter, setPaymentFilter] = useState("all");
    const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");

    useEffect(() => {
        loadSales();
    }, []);

    async function loadSales() {
        setLoading(true);
        setError(null);

        const { data, error } = await supabase
            .from("sales")
            .select(`
        id,
        invoice_number,
        purchased_at,
        total_amount,
        payment_method,
        status,
        sale_items (
          quantity,
          products (
            name,
            product_categories (
              name
            )
          )
        )
      `)
            .order("purchased_at", { ascending: false });

        if (error) {
            console.error("Error loading sales:", error);
            setError(error.message);
            setLoading(false);
            return;
        }

        const formatted: SaleRow[] = (data ?? []).map((sale: any) => ({
            id: sale.id,
            invoice_number: sale.invoice_number,
            purchased_at: sale.purchased_at,
            total_amount: Number(sale.total_amount ?? 0),
            payment_method: sale.payment_method,
            status: sale.status,
            items: (sale.sale_items ?? []).map((item: any) => ({
                product_name: item.products?.name ?? "Unknown item",
                category_name:
                    item.products?.product_categories?.name ?? "Uncategorized",
                quantity: Number(item.quantity ?? 0),
            })),
        }));

        setSales(formatted);
        setLoading(false);
    }

    const categories = useMemo(() => {
        const values = sales.flatMap((sale) =>
            sale.items.map((item) => item.category_name)
        );

        return [...new Set(values)].sort();
    }, [sales]);

    const filteredSales = useMemo(() => {
        let result = [...sales];

        if (categoryFilter !== "all") {
            result = result.filter((sale) =>
                sale.items.some((item) => item.category_name === categoryFilter)
            );
        }

        if (paymentFilter !== "all") {
            result = result.filter(
                (sale) => sale.payment_method === paymentFilter
            );
        }

        result.sort((a, b) => {
            const dateA = new Date(a.purchased_at).getTime();
            const dateB = new Date(b.purchased_at).getTime();

            return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
        });

        return result;
    }, [sales, categoryFilter, paymentFilter, sortOrder]);

    async function handleDelete(sale: SaleRow) {
        const confirmed = window.confirm(
            `Delete ${sale.invoice_number}? This will also delete its sale items.`
        );

        if (!confirmed) return;

        const { error } = await supabase
            .from("sales")
            .delete()
            .eq("id", sale.id);

        if (error) {
            console.error("Delete sale error:", error);
            alert(error.message);
            return;
        }

        setSales((current) =>
            current.filter((item) => item.id !== sale.id)
        );
    }

    function handleEdit(sale: SaleRow) {
        console.log("Edit sale:", sale);

        // We will connect the Edit dialog here next.
    }

    const money = new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    });

    function formatDate(value: string) {
        return new Intl.DateTimeFormat("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
        }).format(new Date(value));
    }

    if (loading) {
        return (
            <div className="flex min-h-[300px] items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6 p-6">
            <div>
                <h1 className="text-2xl font-semibold">Sales</h1>
                <p className="text-sm text-muted-foreground">
                    View and manage all sales
                </p>
            </div>

            {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
                    {error}
                </div>
            )}

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
                <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="h-10 rounded-md border bg-background px-3 text-sm"
                >
                    <option value="all">All Categories</option>

                    {categories.map((category) => (
                        <option key={category} value={category}>
                            {category}
                        </option>
                    ))}
                </select>

                <select
                    value={paymentFilter}
                    onChange={(e) => setPaymentFilter(e.target.value)}
                    className="h-10 rounded-md border bg-background px-3 text-sm"
                >
                    <option value="all">All Payment Methods</option>
                    <option value="CASH">Cash</option>
                    <option value="UPI">UPI</option>
                    <option value="CARD">Card</option>
                    <option value="BANK_TRANSFER">Bank Transfer</option>
                    <option value="OTHER">Other</option>
                </select>

                <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value as "newest" | "oldest")}
                    className="h-10 rounded-md border bg-background px-3 text-sm"
                >
                    <option value="newest">Newest first</option>
                    <option value="oldest">Oldest first</option>
                </select>

                {/* ADD SALE */}
                <SaleDialog
                    showTrigger={true}
                    onSaved={loadSales}
                />

                {/* EDIT SALE */}
                <SaleDialog
                 showTrigger={false}
                    editSale={
                        editingSale
                            ? {
                                id: editingSale.id,
                                invoice_number: editingSale.invoice_number,
                            }
                            : null
                    }
                    open={!!editingSale}
                    onOpenChange={(open) => {
                        if (!open) {
                            setEditingSale(null);
                        }
                    }}
                    onSaved={() => {
                        setEditingSale(null);
                        loadSales();
                    }}
                />
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-lg border">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="border-b bg-muted/50">
                            <tr>
                                <th className="px-4 py-3 text-left font-medium">ID</th>
                                <th className="px-4 py-3 text-left font-medium">Date</th>
                                <th className="px-4 py-3 text-left font-medium">
                                    Category
                                </th>
                                <th className="px-4 py-3 text-left font-medium">Item</th>
                                <th className="px-4 py-3 text-right font-medium">
                                    Amount
                                </th>
                                <th className="px-4 py-3 text-right font-medium">
                                    Actions
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredSales.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="px-4 py-12 text-center text-muted-foreground"
                                    >
                                        No sales found.
                                    </td>
                                </tr>
                            ) : (
                                filteredSales.map((sale) => {
                                    const categories = [
                                        ...new Set(
                                            sale.items.map((item) => item.category_name)
                                        ),
                                    ];

                                    const items = sale.items.map(
                                        (item) => item.product_name
                                    );

                                    return (
                                        <tr
                                            key={sale.id}
                                            className="border-b last:border-0 hover:bg-muted/30"
                                        >
                                            <td className="px-4 py-3 font-medium">
                                                {sale.invoice_number}
                                            </td>

                                            <td className="px-4 py-3 whitespace-nowrap">
                                                {formatDate(sale.purchased_at)}
                                            </td>

                                            <td className="px-4 py-3">
                                                {categories.join(", ") || "—"}
                                            </td>

                                            <td className="px-4 py-3">
                                                {items.join(", ") || "—"}
                                            </td>

                                            <td className="px-4 py-3 text-right font-semibold">
                                                {money.format(sale.total_amount)}
                                            </td>

                                            <td className="px-4 py-3">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => setEditingSale(sale)}
                                                        className="inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-xs hover:bg-muted"
                                                    >
                                                        <Pencil className="h-3.5 w-3.5" />
                                                        Edit
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() => handleDelete(sale)}
                                                        className="inline-flex items-center gap-1 rounded-md border border-red-200 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}