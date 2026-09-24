"use client";

import { useEffect, useMemo, useState } from "react";

import {
  CalendarDays,
  Loader2,
  Pencil,
  RefreshCw,
  RotateCcw,
  Search,
  ShoppingCart,
  Trash2,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  PurchaseDialog,
  type Purchase,
  type PurchaseItem,
} from "@/components/admin/purchases/purchase-dialog";

type PurchaseRow = Purchase & {
  items: PurchaseItem[];
};

const PAYMENT_METHODS = [
  ["CASH", "Cash"],
  ["UPI", "UPI"],
  ["CARD", "Card"],
  ["BANK_TRANSFER", "Bank Transfer"],
  ["OTHER", "Other"],
] as const;

function paymentLabel(
  value: string | null
) {
  const found = PAYMENT_METHODS.find(
    ([code]) => code === value
  );

  return found?.[1] ?? value ?? "—";
}

const money = new Intl.NumberFormat(
  "en-IN",
  {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }
);

function formatDate(value: string) {
  return new Intl.DateTimeFormat(
    "en-IN",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  ).format(new Date(value));
}

export default function PurchasesTable() {
  const supabase = useMemo(
    () => createClient(),
    []
  );

  const [purchases, setPurchases] =
    useState<PurchaseRow[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [search, setSearch] =
    useState("");

  const [paymentFilter, setPaymentFilter] =
    useState("all");

  const [statusFilter, setStatusFilter] =
    useState("all");

  const [dateFrom, setDateFrom] =
    useState("");

  const [dateTo, setDateTo] =
    useState("");

  const [sortOrder, setSortOrder] =
    useState<
      | "newest"
      | "oldest"
      | "highest"
      | "lowest"
    >("newest");

  const [editingPurchase, setEditingPurchase] =
    useState<PurchaseRow | null>(null);

  const [dialogOpen, setDialogOpen] =
    useState(false);

  const [deletingId, setDeletingId] =
    useState<string | null>(null);

  /*
   * --------------------------------------------------
   * LOAD PURCHASES
   * --------------------------------------------------
   */

  async function loadPurchases() {
    setLoading(true);
    setError(null);

    const {
      data,
      error: queryError,
    } = await supabase
      .from("purchases")
      .select(`
        id,
        supplier_name,
        invoice_number,
        subtotal,
        discount_amount,
        tax_amount,
        shipping_amount,
        total_amount,
        payment_method,
        status,
        purchased_at,
        created_by,
        created_at,
        updated_at,
        purchase_items (
          id,
          purchase_id,
          product_id,
          variant_id,
          quantity,
          unit_cost,
          discount,
          line_total,
          created_at,
          products (
            name,
            sku
          ),
          product_variants (
            name,
            sku,
            variant_value
          )
        )
      `)
      .order("purchased_at", {
        ascending: false,
      });

    if (queryError) {
      console.error(
        "Purchase load error:",
        queryError
      );

      setError(queryError.message);
      setLoading(false);
      return;
    }

    const formatted: PurchaseRow[] =
      (data ?? []).map((purchase: any) => ({
        id: purchase.id,

        supplier_name:
          purchase.supplier_name,

        invoice_number:
          purchase.invoice_number,

        subtotal:
          Number(purchase.subtotal ?? 0),

        discount_amount:
          Number(
            purchase.discount_amount ?? 0
          ),

        tax_amount:
          Number(
            purchase.tax_amount ?? 0
          ),

        shipping_amount:
          Number(
            purchase.shipping_amount ?? 0
          ),

        total_amount:
          Number(
            purchase.total_amount ?? 0
          ),

        payment_method:
          purchase.payment_method,

        status:
          purchase.status,

        purchased_at:
          purchase.purchased_at,

        created_by:
          purchase.created_by,

        created_at:
          purchase.created_at,

        updated_at:
          purchase.updated_at,

        items: (
          purchase.purchase_items ?? []
        ).map((item: any) => ({
          id: item.id,

          purchase_id:
            item.purchase_id,

          product_id:
            item.product_id,

          variant_id:
            item.variant_id,

          quantity:
            Number(item.quantity ?? 0),

          unit_cost:
            Number(item.unit_cost ?? 0),

          discount:
            Number(item.discount ?? 0),

          line_total:
            Number(item.line_total ?? 0),

          created_at:
            item.created_at,

          product_name:
            item.products?.name ??
            "Unknown product",

          product_sku:
            item.products?.sku ??
            null,

          variant_name:
            item.product_variants?.name ??
            null,

          variant_sku:
            item.product_variants?.sku ??
            null,
        })),
      }));

    setPurchases(formatted);
    setLoading(false);
  }

  useEffect(() => {
    loadPurchases();
  }, []);

  /*
   * --------------------------------------------------
   * STATUS OPTIONS
   * --------------------------------------------------
   */

  const statuses = useMemo(() => {
    return [
      ...new Set(
        purchases
          .map(
            (purchase) =>
              purchase.status
          )
          .filter(Boolean)
      ),
    ].sort();
  }, [purchases]);

  /*
   * --------------------------------------------------
   * FILTERED PURCHASES
   * --------------------------------------------------
   */

  const filteredPurchases = useMemo(() => {
    let result = [...purchases];

    const searchValue =
      search.trim().toLowerCase();

    if (searchValue) {
      result = result.filter(
        (purchase) => {
          const itemText =
            purchase.items
              .map(
                (item) =>
                  `${item.product_name} ${
                    item.product_sku ?? ""
                  } ${
                    item.variant_name ?? ""
                  } ${
                    item.variant_sku ?? ""
                  }`
              )
              .join(" ")
              .toLowerCase();

          return (
            (
              purchase.invoice_number ??
              ""
            )
              .toLowerCase()
              .includes(searchValue) ||
            (
              purchase.supplier_name ??
              ""
            )
              .toLowerCase()
              .includes(searchValue) ||
            itemText.includes(searchValue)
          );
        }
      );
    }

    if (paymentFilter !== "all") {
      result = result.filter(
        (purchase) =>
          purchase.payment_method ===
          paymentFilter
      );
    }

    if (statusFilter !== "all") {
      result = result.filter(
        (purchase) =>
          purchase.status ===
          statusFilter
      );
    }

    if (dateFrom) {
      const from = new Date(
        `${dateFrom}T00:00:00`
      ).getTime();

      result = result.filter(
        (purchase) =>
          new Date(
            purchase.purchased_at
          ).getTime() >= from
      );
    }

    if (dateTo) {
      const to = new Date(
        `${dateTo}T23:59:59`
      ).getTime();

      result = result.filter(
        (purchase) =>
          new Date(
            purchase.purchased_at
          ).getTime() <= to
      );
    }

    result.sort((a, b) => {
      if (
        sortOrder === "highest"
      ) {
        return (
          b.total_amount -
          a.total_amount
        );
      }

      if (
        sortOrder === "lowest"
      ) {
        return (
          a.total_amount -
          b.total_amount
        );
      }

      const dateA = new Date(
        a.purchased_at
      ).getTime();

      const dateB = new Date(
        b.purchased_at
      ).getTime();

      return sortOrder === "newest"
        ? dateB - dateA
        : dateA - dateB;
    });

    return result;
  }, [
    purchases,
    search,
    paymentFilter,
    statusFilter,
    dateFrom,
    dateTo,
    sortOrder,
  ]);

  /*
   * --------------------------------------------------
   * SUMMARY
   * --------------------------------------------------
   */

  const summary = useMemo(() => {
    const total =
      filteredPurchases.reduce(
        (sum, purchase) =>
          sum +
          purchase.total_amount,
        0
      );

    const items =
      filteredPurchases.reduce(
        (sum, purchase) =>
          sum +
          purchase.items.reduce(
            (itemSum, item) =>
              itemSum +
              Number(
                item.quantity
              ),
            0
          ),
        0
      );

    return {
      total,
      records:
        filteredPurchases.length,
      average:
        filteredPurchases.length
          ? total /
            filteredPurchases.length
          : 0,
      items,
    };
  }, [filteredPurchases]);

  /*
   * --------------------------------------------------
   * RESET FILTERS
   * --------------------------------------------------
   */

  function resetFilters() {
    setSearch("");
    setPaymentFilter("all");
    setStatusFilter("all");
    setDateFrom("");
    setDateTo("");
    setSortOrder("newest");
  }

  /*
   * --------------------------------------------------
   * DELETE PURCHASE
   * --------------------------------------------------
   */

  async function deletePurchase(
    purchase: PurchaseRow
  ) {
    const confirmed =
      window.confirm(
        `Delete ${
          purchase.invoice_number ??
          "this purchase"
        }? This will also reverse the stock received from this purchase.`
      );

    if (!confirmed) {
      return;
    }

    setDeletingId(purchase.id);
    setError(null);

    try {
      /*
       * Reverse stock first.
       */

      for (const item of purchase.items) {
        if (item.variant_id) {
          const {
            data: variant,
            error: variantError,
          } = await supabase
            .from(
              "product_variants"
            )
            .select(
              "id,stock_quantity"
            )
            .eq(
              "id",
              item.variant_id
            )
            .single();

          if (variantError) {
            throw variantError;
          }

          const newStock =
            Number(
              variant.stock_quantity ??
                0
            ) -
            Number(item.quantity);

          if (newStock < 0) {
            throw new Error(
              `Cannot delete ${purchase.invoice_number ?? "purchase"} because stock for the selected variant would become negative.`
            );
          }

          const {
            error: updateError,
          } = await supabase
            .from(
              "product_variants"
            )
            .update({
              stock_quantity:
                newStock,

              updated_at:
                new Date().toISOString(),
            })
            .eq(
              "id",
              item.variant_id
            );

          if (updateError) {
            throw updateError;
          }
        } else {
          const {
            data: product,
            error: productError,
          } = await supabase
            .from("products")
            .select(
              "id,stock_quantity"
            )
            .eq(
              "id",
              item.product_id
            )
            .single();

          if (productError) {
            throw productError;
          }

          const newStock =
            Number(
              product.stock_quantity ??
                0
            ) -
            Number(item.quantity);

          if (newStock < 0) {
            throw new Error(
              `Cannot delete ${purchase.invoice_number ?? "purchase"} because product stock would become negative.`
            );
          }

          const {
            error: updateError,
          } = await supabase
            .from("products")
            .update({
              stock_quantity:
                newStock,

              updated_at:
                new Date().toISOString(),
            })
            .eq(
              "id",
              item.product_id
            );

          if (updateError) {
            throw updateError;
          }
        }
      }

      /*
       * Delete purchase items.
       */

      const {
        error: itemDeleteError,
      } = await supabase
        .from("purchase_items")
        .delete()
        .eq(
          "purchase_id",
          purchase.id
        );

      if (itemDeleteError) {
        throw itemDeleteError;
      }

      /*
       * Delete purchase header.
       */

      const {
        error: purchaseDeleteError,
      } = await supabase
        .from("purchases")
        .delete()
        .eq(
          "id",
          purchase.id
        );

      if (purchaseDeleteError) {
        throw purchaseDeleteError;
      }

      setPurchases(
        (current) =>
          current.filter(
            (item) =>
              item.id !==
              purchase.id
          )
      );
    } catch (err) {
      console.error(
        "Delete purchase error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete purchase."
      );

      await loadPurchases();
    } finally {
      setDeletingId(null);
    }
  }

  /*
   * --------------------------------------------------
   * EDIT
   * --------------------------------------------------
   */

  function openEdit(
    purchase: PurchaseRow
  ) {
    setEditingPurchase(purchase);
    setDialogOpen(true);
  }

  function openAdd() {
    setEditingPurchase(null);
    setDialogOpen(true);
  }

  /*
   * --------------------------------------------------
   * LOADING
   * --------------------------------------------------
   */

  if (loading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center">
        <Loader2 className="h-7 w-7 animate-spin text-brand-gold" />
      </div>
    );
  }

  /*
   * --------------------------------------------------
   * UI
   * --------------------------------------------------
   */

  return (
    <div className="w-full space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Header */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-6 w-6 text-brand-gold" />

            <h1 className="text-2xl font-bold tracking-tight">
              Purchases
            </h1>
          </div>

          <p className="mt-1 text-sm text-muted-foreground">
            Track supplier purchases,
            stock received, and purchase
            costs.
          </p>
        </div>

        <PurchaseDialog
          showTrigger
          open={dialogOpen}
          onOpenChange={(open) => {
            setDialogOpen(open);

            if (!open) {
              setEditingPurchase(
                null
              );
            }
          }}
          editPurchase={
            editingPurchase
          }
          onSaved={loadPurchases}
        />
      </div>

      {/* Error */}

      {error ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      {/* Summary */}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <SummaryCard
          label="Purchase Amount"
          value={money.format(
            summary.total
          )}
        />

        <SummaryCard
          label="Purchase Records"
          value={summary.records.toLocaleString(
            "en-IN"
          )}
        />

        <SummaryCard
          label="Average Purchase"
          value={money.format(
            summary.average
          )}
        />

        <SummaryCard
          label="Items Purchased"
          value={summary.items.toLocaleString(
            "en-IN"
          )}
        />
      </div>

      {/* Filters */}

      <div className="rounded-2xl border bg-card p-4 shadow-sm">
        <div className="grid gap-3 lg:grid-cols-[minmax(240px,1fr)_180px_180px_150px_150px_auto]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

            <Input
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search invoice, supplier, product..."
              className="h-10 pl-9"
            />
          </div>

          <select
            value={paymentFilter}
            onChange={(event) =>
              setPaymentFilter(
                event.target.value
              )
            }
            className="h-10 rounded-md border bg-background px-3 text-sm"
          >
            <option value="all">
              All payments
            </option>

            {PAYMENT_METHODS.map(
              ([value, label]) => (
                <option
                  key={value}
                  value={value}
                >
                  {label}
                </option>
              )
            )}
          </select>

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target.value
              )
            }
            className="h-10 rounded-md border bg-background px-3 text-sm"
          >
            <option value="all">
              All statuses
            </option>

            {statuses.map(
              (status) => (
                <option
                  key={status}
                  value={status}
                >
                  {status}
                </option>
              )
            )}
          </select>

          <div className="relative">
            <CalendarDays className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

            <Input
              type="date"
              value={dateFrom}
              onChange={(event) =>
                setDateFrom(
                  event.target.value
                )
              }
              className="h-10 pl-9"
            />
          </div>

          <div className="relative">
            <CalendarDays className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

            <Input
              type="date"
              value={dateTo}
              onChange={(event) =>
                setDateTo(
                  event.target.value
                )
              }
              className="h-10 pl-9"
            />
          </div>

          <Button
            variant="outline"
            className="h-10 gap-2"
            onClick={resetFilters}
          >
            <RotateCcw className="h-4 w-4" />

            Reset
          </Button>
        </div>

        <div className="mt-3 flex flex-col gap-3 border-t pt-3 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-sm text-muted-foreground">
            {filteredPurchases.length}{" "}
            purchase record(s)
          </span>

          <label className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">
              Sort
            </span>

            <select
              value={sortOrder}
              onChange={(event) =>
                setSortOrder(
                  event.target.value as
                    | "newest"
                    | "oldest"
                    | "highest"
                    | "lowest"
                )
              }
              className="h-9 rounded-md border bg-background px-3"
            >
              <option value="newest">
                Newest
              </option>

              <option value="oldest">
                Oldest
              </option>

              <option value="highest">
                Highest amount
              </option>

              <option value="lowest">
                Lowest amount
              </option>
            </select>
          </label>
        </div>
      </div>

      {/* Purchase History */}

      <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h2 className="font-semibold">
            Purchase History
          </h2>

          <Button
            variant="ghost"
            size="sm"
            onClick={loadPurchases}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />

            Refresh
          </Button>
        </div>

        {filteredPurchases.length ===
        0 ? (
          <div className="flex min-h-[280px] flex-col items-center justify-center px-6 text-center">
            <ShoppingCart className="mb-3 h-10 w-10 text-muted-foreground/50" />

            <h3 className="font-semibold">
              No purchases found
            </h3>

            <p className="mt-1 text-sm text-muted-foreground">
              Add a purchase or change
              your filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px] text-sm">
              <thead className="bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">
                    Invoice
                  </th>

                  <th className="px-4 py-3">
                    Date
                  </th>

                  <th className="px-4 py-3">
                    Supplier
                  </th>

                  <th className="px-4 py-3">
                    Items
                  </th>

                  <th className="px-4 py-3">
                    Payment
                  </th>

                  <th className="px-4 py-3">
                    Status
                  </th>

                  <th className="px-4 py-3 text-right">
                    Amount
                  </th>

                  <th className="px-4 py-3 text-right">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {filteredPurchases.map(
                  (purchase) => (
                    <tr
                      key={purchase.id}
                      className="align-top hover:bg-muted/20"
                    >
                      <td className="px-4 py-4 font-medium">
                        {purchase.invoice_number ||
                          "—"}
                      </td>

                      <td className="whitespace-nowrap px-4 py-4">
                        {formatDate(
                          purchase.purchased_at
                        )}
                      </td>

                      <td className="px-4 py-4">
                        {purchase.supplier_name ||
                          "—"}
                      </td>

                      <td className="max-w-[360px] px-4 py-4">
                        <div className="space-y-1">
                          {purchase.items
                            .slice(0, 3)
                            .map(
                              (item) => (
                                <div
                                  key={
                                    item.id
                                  }
                                  className="truncate"
                                >
                                  {
                                    item.product_name
                                  }

                                  {item.variant_name
                                    ? ` · ${item.variant_name}`
                                    : ""}

                                  {" × "}

                                  {item.quantity}
                                </div>
                              )
                            )}

                          {purchase.items
                            .length >
                          3 ? (
                            <div className="text-xs text-muted-foreground">
                              +
                              {purchase
                                .items
                                .length -
                                3}{" "}
                              more item(s)
                            </div>
                          ) : null}
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        {paymentLabel(
                          purchase.payment_method
                        )}
                      </td>

                      <td className="px-4 py-4">
                        <span className="inline-flex rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
                          {purchase.status}
                        </span>
                      </td>

                      <td className="px-4 py-4 text-right font-semibold">
                        {money.format(
                          purchase.total_amount
                        )}
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Edit purchase"
                            onClick={() =>
                              openEdit(
                                purchase
                              )
                            }
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            title="Delete purchase"
                            disabled={
                              deletingId ===
                              purchase.id
                            }
                            onClick={() =>
                              deletePurchase(
                                purchase
                              )
                            }
                          >
                            {deletingId ===
                            purchase.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4 text-destructive" />
                            )}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border bg-card p-4 shadow-sm">
      <p className="text-xs font-medium text-muted-foreground">
        {label}
      </p>

      <p className="mt-1 text-xl font-bold tracking-tight sm:text-2xl">
        {value}
      </p>
    </div>
  );
}