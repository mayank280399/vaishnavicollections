"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  DollarSign,
  FileText,
  Loader2,
  Pencil,
  Receipt,
  RotateCcw,
  Search,
  Trash2,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { ExpenseDialog } from "@/components/admin/expenses/expense-dialog";

type ExpenseRow = {
  id: string;
  expense_number: string;
  expense_date: string;
  category: string | null;
  subcategory: string | null;
  description: string | null;
  amount: number;
  payment_method: string | null;
  notes: string | null;
};

export default function ExpensesTable() {
  const supabase = createClient();

  const [expenses, setExpenses] = useState<ExpenseRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editingExpense, setEditingExpense] =
    useState<ExpenseRow | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [subcategoryFilter, setSubcategoryFilter] =
    useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");

  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [sortOrder, setSortOrder] = useState<
    "newest" | "oldest" | "highest" | "lowest"
  >("newest");

  useEffect(() => {
    loadExpenses();
  }, []);

  async function loadExpenses() {
    setLoading(true);
    setError(null);

    const { data, error } = await supabase
      .from("expenses")
      .select(`
        id,
        expense_number,
        expense_date,
        category,
        subcategory,
        description,
        amount,
        payment_method,
        notes
      `)
      .order("expense_date", { ascending: false });

    if (error) {
      console.error("Error loading expenses:", error);
      setError(error.message);
      setLoading(false);
      return;
    }

    const formatted: ExpenseRow[] = (data ?? []).map(
      (expense: any) => ({
        id: expense.id,
        expense_number: expense.expense_number,
        expense_date: expense.expense_date,
        category: expense.category,
        subcategory: expense.subcategory,
        description: expense.description,
        amount: Number(expense.amount ?? 0),
        payment_method: expense.payment_method,
        notes: expense.notes,
      })
    );

    setExpenses(formatted);
    setLoading(false);
  }

  /* -----------------------------------------
     Categories
  ----------------------------------------- */

  const categories = useMemo(() => {
    const values = expenses
      .map((expense) => expense.category)
      .filter(Boolean) as string[];

    return [...new Set(values)].sort();
  }, [expenses]);

  /* -----------------------------------------
     Subcategories
  ----------------------------------------- */

  const subcategories = useMemo(() => {
    const source =
      categoryFilter === "all"
        ? expenses
        : expenses.filter(
            (expense) =>
              expense.category === categoryFilter
          );

    const values = source
      .map((expense) => expense.subcategory)
      .filter(Boolean) as string[];

    return [...new Set(values)].sort();
  }, [expenses, categoryFilter]);

  /* -----------------------------------------
     Filter + Sort
  ----------------------------------------- */

  const filteredExpenses = useMemo(() => {
    let result = [...expenses];

    const searchValue = search.trim().toLowerCase();

    // Search
    if (searchValue) {
      result = result.filter((expense) => {
        return (
          expense.expense_number
            .toLowerCase()
            .includes(searchValue) ||
          expense.category
            ?.toLowerCase()
            .includes(searchValue) ||
          expense.subcategory
            ?.toLowerCase()
            .includes(searchValue) ||
          expense.description
            ?.toLowerCase()
            .includes(searchValue) ||
          expense.notes
            ?.toLowerCase()
            .includes(searchValue)
        );
      });
    }

    // Category
    if (categoryFilter !== "all") {
      result = result.filter(
        (expense) =>
          expense.category === categoryFilter
      );
    }

    // Subcategory
    if (subcategoryFilter !== "all") {
      result = result.filter(
        (expense) =>
          expense.subcategory === subcategoryFilter
      );
    }

    // Payment
    if (paymentFilter !== "all") {
      result = result.filter(
        (expense) =>
          expense.payment_method === paymentFilter
      );
    }

    // From date
    if (dateFrom) {
      result = result.filter(
        (expense) => expense.expense_date >= dateFrom
      );
    }

    // To date
    if (dateTo) {
      result = result.filter(
        (expense) => expense.expense_date <= dateTo
      );
    }

    // Sorting
    result.sort((a, b) => {
      if (sortOrder === "highest") {
        return b.amount - a.amount;
      }

      if (sortOrder === "lowest") {
        return a.amount - b.amount;
      }

      const dateA = new Date(a.expense_date).getTime();
      const dateB = new Date(b.expense_date).getTime();

      return sortOrder === "newest"
        ? dateB - dateA
        : dateA - dateB;
    });

    return result;
  }, [
    expenses,
    search,
    categoryFilter,
    subcategoryFilter,
    paymentFilter,
    dateFrom,
    dateTo,
    sortOrder,
  ]);

  /* -----------------------------------------
     Summary
  ----------------------------------------- */

  const summary = useMemo(() => {
    const totalAmount = filteredExpenses.reduce(
      (sum, expense) => sum + expense.amount,
      0
    );

    const average =
      filteredExpenses.length > 0
        ? totalAmount / filteredExpenses.length
        : 0;

    return {
      totalAmount,
      expenseCount: filteredExpenses.length,
      average,
    };
  }, [filteredExpenses]);

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

  function resetFilters() {
    setSearch("");
    setCategoryFilter("all");
    setSubcategoryFilter("all");
    setPaymentFilter("all");
    setDateFrom("");
    setDateTo("");
    setSortOrder("newest");
  }

  const hasActiveFilters =
    search !== "" ||
    categoryFilter !== "all" ||
    subcategoryFilter !== "all" ||
    paymentFilter !== "all" ||
    dateFrom !== "" ||
    dateTo !== "";

  /* -----------------------------------------
     Delete
  ----------------------------------------- */

  async function handleDelete(expense: ExpenseRow) {
    const confirmed = window.confirm(
      `Delete ${expense.expense_number}? This expense record will be permanently deleted.`
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("expenses")
      .delete()
      .eq("id", expense.id);

    if (error) {
      console.error("Delete expense error:", error);
      alert(error.message);
      return;
    }

    setExpenses((current) =>
      current.filter(
        (item) => item.id !== expense.id
      )
    );
  }

  function handleEdit(expense: ExpenseRow) {
    setEditingExpense(expense);
  }

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
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Expenses
        </h1>

        <p className="text-sm text-muted-foreground">
          View and manage all shop expenses
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">

        {/* Total */}
        <div className="rounded-xl border bg-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Total Expenses
              </p>

              <p className="mt-1 text-xl font-semibold">
                {money.format(summary.totalAmount)}
              </p>
            </div>

            <div className="rounded-lg bg-red-50 p-2 text-red-600">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* Count */}
        <div className="rounded-xl border bg-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Expense Records
              </p>

              <p className="mt-1 text-xl font-semibold">
                {summary.expenseCount}
              </p>
            </div>

            <div className="rounded-lg bg-orange-50 p-2 text-orange-600">
              <Receipt className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* Average */}
        <div className="rounded-xl border bg-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Average Expense
              </p>

              <p className="mt-1 text-xl font-semibold">
                {money.format(summary.average)}
              </p>
            </div>

            <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
              <FileText className="h-5 w-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-xl border bg-card p-4">

        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-semibold">
              Filters
            </h2>

            <p className="text-xs text-muted-foreground">
              Filter expenses by category, payment method and date
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
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search expense, category or description..."
              className="h-10 w-full rounded-md border bg-background pl-9 pr-3 text-sm outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Category */}
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setSubcategoryFilter("all");
            }}
            className="h-10 rounded-md border bg-background px-3 text-sm outline-none focus:border-primary"
          >
            <option value="all">
              All Categories
            </option>

            {categories.map((category) => (
              <option
                key={category}
                value={category}
              >
                {category}
              </option>
            ))}
          </select>

          {/* Subcategory */}
          <select
            value={subcategoryFilter}
            onChange={(e) =>
              setSubcategoryFilter(e.target.value)
            }
            className="h-10 rounded-md border bg-background px-3 text-sm outline-none focus:border-primary"
          >
            <option value="all">
              All Subcategories
            </option>

            {subcategories.map((subcategory) => (
              <option
                key={subcategory}
                value={subcategory}
              >
                {subcategory}
              </option>
            ))}
          </select>

          {/* Payment */}
          <select
            value={paymentFilter}
            onChange={(e) =>
              setPaymentFilter(e.target.value)
            }
            className="h-10 rounded-md border bg-background px-3 text-sm outline-none focus:border-primary"
          >
            <option value="all">
              All Payment Methods
            </option>

            <option value="CASH">Cash</option>
            <option value="UPI">UPI</option>
            <option value="CARD">Card</option>
            <option value="BANK_TRANSFER">
              Bank Transfer
            </option>
            <option value="OTHER">Other</option>
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
            <option value="newest">
              Newest first
            </option>

            <option value="oldest">
              Oldest first
            </option>

            <option value="highest">
              Highest amount
            </option>

            <option value="lowest">
              Lowest amount
            </option>
          </select>

          {/* From Date */}
          <div className="relative">
            <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

            <input
              type="date"
              value={dateFrom}
              onChange={(e) =>
                setDateFrom(e.target.value)
              }
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
              onChange={(e) =>
                setDateTo(e.target.value)
              }
              className="h-10 w-full rounded-md border bg-background pl-9 pr-3 text-sm outline-none focus:border-primary"
              aria-label="To date"
            />
          </div>
        </div>

        {/* Results + Add */}
        <div className="mt-4 flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">

          <p className="text-sm text-muted-foreground">
            Showing{" "}
            <span className="font-medium text-foreground">
              {filteredExpenses.length}
            </span>{" "}
            of{" "}
            <span className="font-medium text-foreground">
              {expenses.length}
            </span>{" "}
            expenses
          </p>

          <ExpenseDialog
            showTrigger={true}
            onSaved={loadExpenses}
          />
        </div>
      </div>

      {/* Edit Expense Dialog */}
      <ExpenseDialog
        showTrigger={false}
        editExpense={editingExpense}
        open={!!editingExpense}
        onOpenChange={(open) => {
          if (!open) {
            setEditingExpense(null);
          }
        }}
        onSaved={() => {
          setEditingExpense(null);
          loadExpenses();
        }}
      />

      {/* Table */}
      <div className="overflow-hidden rounded-xl border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px] text-sm">

            <thead className="border-b bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left font-medium">
                  Expense No.
                </th>

                <th className="px-4 py-3 text-left font-medium">
                  Date
                </th>

                <th className="px-4 py-3 text-left font-medium">
                  Category
                </th>

                <th className="px-4 py-3 text-left font-medium">
                  Subcategory
                </th>

                <th className="px-4 py-3 text-left font-medium">
                  Description
                </th>

                <th className="px-4 py-3 text-left font-medium">
                  Payment
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
              {filteredExpenses.length === 0 ? (
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
                          No expenses found
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
                filteredExpenses.map((expense) => (
                  <tr
                    key={expense.id}
                    className="border-b last:border-0 hover:bg-muted/30"
                  >
                    <td className="px-4 py-3 font-medium">
                      {expense.expense_number}
                    </td>

                    <td className="whitespace-nowrap px-4 py-3">
                      {formatDate(expense.expense_date)}
                    </td>

                    <td className="px-4 py-3">
                      {expense.category || "—"}
                    </td>

                    <td className="px-4 py-3">
                      {expense.subcategory || "—"}
                    </td>

                    <td
                      className="max-w-[240px] truncate px-4 py-3"
                      title={
                        expense.description ?? ""
                      }
                    >
                      {expense.description || "—"}
                    </td>

                    <td className="px-4 py-3">
                      {formatPaymentMethod(
                        expense.payment_method
                      )}
                    </td>

                    <td className="px-4 py-3 text-right font-semibold">
                      {money.format(expense.amount)}
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">

                        <button
                          type="button"
                          onClick={() =>
                            handleEdit(expense)
                          }
                          className="inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-xs hover:bg-muted"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(expense)
                          }
                          className="inline-flex items-center gap-1 rounded-md border border-red-200 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
                        </button>

                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>

          </table>
        </div>
      </div>
    </div>
  );
}