"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronDown,
  DollarSign,
  FileText,
  Loader2,
  Pencil,
  RotateCcw,
  Search,
  ShoppingCart,
  Trash2,
} from "lucide-react";

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

  // Filters
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [sortOrder, setSortOrder] = useState<
    "newest" | "oldest" | "highest" | "lowest"
  >("newest");

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

  /* -----------------------------------------
     Categories
  ----------------------------------------- */

  const categories = useMemo(() => {
    const values = sales.flatMap((sale) =>
      sale.items.map((item) => item.category_name)
    );

    return [...new Set(values)].sort();
  }, [sales]);

  /* -----------------------------------------
     Statuses
  ----------------------------------------- */

  const statuses = useMemo(() => {
    const values = sales
      .map((sale) => sale.status)
      .filter(Boolean) as string[];

    return [...new Set(values)].sort();
  }, [sales]);

  /* -----------------------------------------
     Filtering + Sorting
  ----------------------------------------- */

  const filteredSales = useMemo(() => {
    let result = [...sales];

    const searchValue = search.trim().toLowerCase();

    // Search
    if (searchValue) {
      result = result.filter((sale) => {
        const invoiceMatch = sale.invoice_number
          .toLowerCase()
          .includes(searchValue);

        const itemMatch = sale.items.some((item) =>
          item.product_name.toLowerCase().includes(searchValue)
        );

        const categoryMatch = sale.items.some((item) =>
          item.category_name.toLowerCase().includes(searchValue)
        );

        return invoiceMatch || itemMatch || categoryMatch;
      });
    }

    // Category
    if (categoryFilter !== "all") {
      result = result.filter((sale) =>
        sale.items.some(
          (item) => item.category_name === categoryFilter
        )
      );
    }

    // Payment
    if (paymentFilter !== "all") {
      result = result.filter(
        (sale) => sale.payment_method === paymentFilter
      );
    }

    // Status
    if (statusFilter !== "all") {
      result = result.filter(
        (sale) => sale.status === statusFilter
      );
    }

    // Date From
    if (dateFrom) {
      result = result.filter((sale) => {
        const saleDate = new Date(sale.purchased_at)
          .toISOString()
          .split("T")[0];

        return saleDate >= dateFrom;
      });
    }

    // Date To
    if (dateTo) {
      result = result.filter((sale) => {
        const saleDate = new Date(sale.purchased_at)
          .toISOString()
          .split("T")[0];

        return saleDate <= dateTo;
      });
    }

    // Sorting
    result.sort((a, b) => {
      if (sortOrder === "highest") {
        return b.total_amount - a.total_amount;
      }

      if (sortOrder === "lowest") {
        return a.total_amount - b.total_amount;
      }

      const dateA = new Date(a.purchased_at).getTime();
      const dateB = new Date(b.purchased_at).getTime();

      return sortOrder === "newest"
        ? dateB - dateA
        : dateA - dateB;
    });

    return result;
  }, [
    sales,
    search,
    categoryFilter,
    paymentFilter,
    statusFilter,
    dateFrom,
    dateTo,
    sortOrder,
  ]);

  /* -----------------------------------------
     Summary
  ----------------------------------------- */

  const summary = useMemo(() => {
    const totalAmount = filteredSales.reduce(
      (sum, sale) => sum + sale.total_amount,
      0
    );

    const average =
      filteredSales.length > 0
        ? totalAmount / filteredSales.length
        : 0;

    const totalItems = filteredSales.reduce(
      (sum, sale) =>
        sum +
        sale.items.reduce(
          (itemSum, item) => itemSum + item.quantity,
          0
        ),
      0
    );

    return {
      totalAmount,
      saleCount: filteredSales.length,
      average,
      totalItems,
    };
  }, [filteredSales]);

  /* -----------------------------------------
     Helpers
  ----------------------------------------- */

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

  function formatPaymentMethod(value: string | null) {
    if (!value) return "—";

    const labels: Record<string, string> = {
      CASH: "Cash",
      UPI: "UPI",
      CARD: "Card",
      BANK_TRANSFER: "Bank Transfer",
      OTHER: "Other",
    };

    return labels[value] ?? value;
  }

  function formatStatus(value: string | null) {
    if (!value) return "—";

    return value
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }

  function resetFilters() {
    setSearch("");
    setCategoryFilter("all");
    setPaymentFilter("all");
    setStatusFilter("all");
    setDateFrom("");
    setDateTo("");
    setSortOrder("newest");
  }

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
    setEditingSale(sale);
  }

  const hasActiveFilters =
    search !== "" ||
    categoryFilter !== "all" ||
    paymentFilter !== "all" ||
    statusFilter !== "all" ||
    dateFrom !== "" ||
    dateTo !== "";

  /* -----------------------------------------
     Loading
  ----------------------------------------- */

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  /* -----------------------------------------
     UI
  ----------------------------------------- */

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Sales
          </h1>

          <p className="text-sm text-muted-foreground">
            View and manage all sales
          </p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rounded-xl border bg-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Total Sales
              </p>

              <p className="mt-1 text-xl font-semibold">
                {money.format(summary.totalAmount)}
              </p>
            </div>

            <div className="rounded-lg bg-green-50 p-2 text-green-600">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Transactions
              </p>

              <p className="mt-1 text-xl font-semibold">
                {summary.saleCount}
              </p>
            </div>

            <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
              <FileText className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Average Sale
              </p>

              <p className="mt-1 text-xl font-semibold">
                {money.format(summary.average)}
              </p>
            </div>

            <div className="rounded-lg bg-purple-50 p-2 text-purple-600">
              <ShoppingCart className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Items Sold
              </p>

              <p className="mt-1 text-xl font-semibold">
                {summary.totalItems}
              </p>
            </div>

            <div className="rounded-lg bg-orange-50 p-2 text-orange-600">
              <ShoppingCart className="h-5 w-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-xl border bg-card p-4">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-semibold">Filters</h2>

            <p className="text-xs text-muted-foreground">
              Filter sales by date, category, payment and more
            </p>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex w-fit items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="h-4 w-4" />
              Reset filters
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {/* Search */}
          <div className="relative sm:col-span-2 lg:col-span-2">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search invoice, item or category..."
              className="h-10 w-full rounded-md border bg-background pl-9 pr-3 text-sm outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Category */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-10 rounded-md border bg-background px-3 text-sm outline-none focus:border-primary"
          >
            <option value="all">All Categories</option>

            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          {/* Payment */}
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="h-10 rounded-md border bg-background px-3 text-sm outline-none focus:border-primary"
          >
            <option value="all">All Payment Methods</option>
            <option value="CASH">Cash</option>
            <option value="UPI">UPI</option>
            <option value="CARD">Card</option>
            <option value="BANK_TRANSFER">
              Bank Transfer
            </option>
            <option value="OTHER">Other</option>
          </select>

          {/* Status */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 rounded-md border bg-background px-3 text-sm outline-none focus:border-primary"
          >
            <option value="all">All Statuses</option>

            {statuses.map((status) => (
              <option key={status} value={status}>
                {formatStatus(status)}
              </option>
            ))}
          </select>

          {/* Sort */}
          <select
            value={sortOrder}
            onChange={(e) =>
              setSortOrder(
                e.target.value as
                  | "newest"
                  | "oldest"
                  | "highest"
                  | "lowest"
              )
            }
            className="h-10 rounded-md border bg-background px-3 text-sm outline-none focus:border-primary"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="highest">Highest amount</option>
            <option value="lowest">Lowest amount</option>
          </select>

          {/* From Date */}
          <div className="relative">
            <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="h-10 w-full rounded-md border bg-background pl-9 pr-3 text-sm outline-none focus:border-primary"
              aria-label="From date"
            />
          </div>

          {/* To Date */}
          <div className="relative">
            <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="h-10 w-full rounded-md border bg-background pl-9 pr-3 text-sm outline-none focus:border-primary"
              aria-label="To date"
            />
          </div>
        </div>

        {/* Filter result + Add Sale */}
        <div className="mt-4 flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Showing{" "}
            <span className="font-medium text-foreground">
              {filteredSales.length}
            </span>{" "}
            of{" "}
            <span className="font-medium text-foreground">
              {sales.length}
            </span>{" "}
            sales
          </p>

          <SaleDialog
            showTrigger={true}
            onSaved={loadSales}
          />
        </div>
      </div>

      {/* Edit Sale Dialog */}
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

      {/* Table */}
      <div className="overflow-hidden rounded-xl border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left font-medium">
                  Invoice
                </th>

                <th className="px-4 py-3 text-left font-medium">
                  Date
                </th>

                <th className="px-4 py-3 text-left font-medium">
                  Category
                </th>

                <th className="px-4 py-3 text-left font-medium">
                  Item
                </th>

                <th className="px-4 py-3 text-left font-medium">
                  Payment
                </th>

                <th className="px-4 py-3 text-left font-medium">
                  Status
                </th>

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
                    colSpan={8}
                    className="px-4 py-14 text-center"
                  >
                    <div className="flex flex-col items-center gap-3">
                      <div className="rounded-full bg-muted p-3">
                        <Search className="h-5 w-5 text-muted-foreground" />
                      </div>

                      <div>
                        <p className="font-medium">
                          No sales found
                        </p>

                        <p className="mt-1 text-sm text-muted-foreground">
                          Try changing or resetting your filters.
                        </p>
                      </div>

                      {hasActiveFilters && (
                        <button
                          type="button"
                          onClick={resetFilters}
                          className="text-sm font-medium text-primary hover:underline"
                        >
                          Clear filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredSales.map((sale) => {
                  const saleCategories = [
                    ...new Set(
                      sale.items.map(
                        (item) => item.category_name
                      )
                    ),
                  ];

                  const items = sale.items.map(
                    (item) =>
                      `${item.product_name}${
                        item.quantity > 1
                          ? ` × ${item.quantity}`
                          : ""
                      }`
                  );

                  return (
                    <tr
                      key={sale.id}
                      className="border-b last:border-0 hover:bg-muted/30"
                    >
                      <td className="px-4 py-3 font-medium">
                        {sale.invoice_number}
                      </td>

                      <td className="whitespace-nowrap px-4 py-3">
                        {formatDate(sale.purchased_at)}
                      </td>

                      <td className="px-4 py-3">
                        {saleCategories.join(", ") || "—"}
                      </td>

                      <td className="max-w-[260px] px-4 py-3">
                        <div
                          className="truncate"
                          title={items.join(", ")}
                        >
                          {items.join(", ") || "—"}
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        {formatPaymentMethod(
                          sale.payment_method
                        )}
                      </td>

                      <td className="px-4 py-3">
                        {sale.status ? (
                          <span className="inline-flex rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
                            {formatStatus(sale.status)}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>

                      <td className="px-4 py-3 text-right font-semibold">
                        {money.format(sale.total_amount)}
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleEdit(sale)}
                            className="inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-xs hover:bg-muted"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(sale)
                            }
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