"use client";

import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";

import {
  CalendarDays,
  FileText,
  Loader2,
  Plus,
  Receipt,
  Wallet,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Category = {
  id: string;
  name: string;
  parent_id: string | null;
  active: boolean;
  category_type: string;
};

export type Expense = {
  id: string;
  expense_number: string;
  expense_date: string;
  category: string | null;
  subcategory: string | null;
  description: string | null;
  amount: number | string | null;
  payment_method: string | null;
  notes: string | null;
};

type ExpenseDialogProps = {
  showTrigger?: boolean;

  editExpense?: Expense | null;

  open?: boolean;

  onOpenChange?: (open: boolean) => void;

  onSaved?: () => void;
};

const PAYMENT_METHODS = [
  {
    value: "CASH",
    label: "Cash",
  },
  {
    value: "UPI",
    label: "UPI",
  },
  {
    value: "CARD",
    label: "Card",
  },
  {
    value: "BANK_TRANSFER",
    label: "Bank Transfer",
  },
  {
    value: "OTHER",
    label: "Other",
  },
];

const today = () => {
  return new Date().toISOString().slice(0, 10);
};

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">
        {label}

        {required ? (
          <span className="ml-1 text-destructive">*</span>
        ) : null}
      </Label>

      {children}
    </div>
  );
}

const inputClass =
  "h-11 w-full rounded-xl border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-60";

export function ExpenseDialog({
  showTrigger = false,
  editExpense = null,
  open: controlledOpen,
  onOpenChange,
  onSaved,
}: ExpenseDialogProps) {
  const supabase = useMemo(() => createClient(), []);

  const isEditMode = Boolean(editExpense);

  const isControlled = controlledOpen !== undefined;

  const [internalOpen, setInternalOpen] = useState(false);

  const open = controlledOpen ?? internalOpen;

  const [saving, setSaving] = useState(false);

  const [loadingData, setLoadingData] = useState(false);

  const [loadingExpenseNumber, setLoadingExpenseNumber] =
    useState(false);

  const [error, setError] = useState("");

  const [message, setMessage] = useState("");

  // --------------------------------------------------
  // FORM STATE
  // --------------------------------------------------

  const [expenseNumber, setExpenseNumber] = useState("");

  const [expenseDate, setExpenseDate] = useState(today());

  const [categoryId, setCategoryId] = useState("");

  const [subcategoryId, setSubcategoryId] = useState("");

  const [description, setDescription] = useState("");

  const [amount, setAmount] = useState("");

  const [paymentMethod, setPaymentMethod] = useState("CASH");

  const [notes, setNotes] = useState("");

  // --------------------------------------------------
  // CATEGORY DATA
  // --------------------------------------------------

  const [categories, setCategories] = useState<Category[]>([]);

  const expenseCategories = useMemo(() => {
    return categories.filter(
      (category) =>
        category.category_type === "EXPENSE" &&
        category.parent_id === null &&
        category.active
    );
  }, [categories]);

  const subcategories = useMemo(() => {
    if (!categoryId) {
      return [];
    }

    return categories.filter(
      (category) =>
        category.category_type === "EXPENSE" &&
        category.parent_id === categoryId &&
        category.active
    );
  }, [categories, categoryId]);

  // --------------------------------------------------
  // RESET
  // --------------------------------------------------

  function resetForm() {
    setExpenseNumber("");
    setExpenseDate(today());
    setCategoryId("");
    setSubcategoryId("");
    setDescription("");
    setAmount("");
    setPaymentMethod("CASH");
    setNotes("");
    setError("");
    setMessage("");
  }

  // --------------------------------------------------
  // OPEN / CLOSE
  // --------------------------------------------------

  function handleOpenChange(value: boolean) {
    if (!isControlled) {
      setInternalOpen(value);
    }

    onOpenChange?.(value);

    if (!value) {
      resetForm();
    }
  }

  // --------------------------------------------------
  // LOAD EXPENSE CATEGORIES
  // --------------------------------------------------

  useEffect(() => {
    if (!open) {
      return;
    }

    let cancelled = false;

    async function loadCategories() {
      setLoadingData(true);
      setError("");

      const { data, error: categoryError } = await supabase
        .from("product_categories")
        .select(
          "id,name,parent_id,active,category_type"
        )
        .eq("category_type", "EXPENSE")
        .eq("active", true)
        .order("name");

      if (cancelled) {
        return;
      }

      if (categoryError) {
        console.error(
          "Expense category load error:",
          categoryError
        );

        setError(
          `Unable to load expense categories: ${categoryError.message}`
        );

        setCategories([]);
      } else {
        setCategories((data ?? []) as Category[]);
      }

      setLoadingData(false);
    }

    loadCategories();

    return () => {
      cancelled = true;
    };
  }, [open, supabase]);

  // --------------------------------------------------
  // FIND NEXT TXN NUMBER
  //
  // Looks across all transaction tables so that
  // TXN numbers remain globally unique.
  //
  // Example:
  // TXN-105 -> TXN-106
  // --------------------------------------------------

  useEffect(() => {
    if (!open || isEditMode) {
      return;
    }

    let cancelled = false;

    async function loadNextExpenseNumber() {
      setLoadingExpenseNumber(true);
      setError("");

      try {
        const [
          salesResult,
          purchasesResult,
          expensesResult,
        ] = await Promise.all([
          supabase
            .from("sales")
            .select("invoice_number"),

          supabase
            .from("purchases")
            .select("invoice_number"),

          supabase
            .from("expenses")
            .select("expense_number"),
        ]);

        if (cancelled) {
          return;
        }

        if (salesResult.error) {
          throw new Error(
            `Unable to read sales numbers: ${salesResult.error.message}`
          );
        }

        if (purchasesResult.error) {
          throw new Error(
            `Unable to read purchase numbers: ${purchasesResult.error.message}`
          );
        }

        if (expensesResult.error) {
          throw new Error(
            `Unable to read expense numbers: ${expensesResult.error.message}`
          );
        }

        const numbers: number[] = [];

        for (const row of salesResult.data ?? []) {
          const value = row.invoice_number;

          if (!value) {
            continue;
          }

          const match = String(value).match(
            /^TXN-(\d+)$/
          );

          if (match) {
            numbers.push(Number(match[1]));
          }
        }

        for (const row of purchasesResult.data ?? []) {
          const value = row.invoice_number;

          if (!value) {
            continue;
          }

          const match = String(value).match(
            /^TXN-(\d+)$/
          );

          if (match) {
            numbers.push(Number(match[1]));
          }
        }

        for (const row of expensesResult.data ?? []) {
          const value = row.expense_number;

          if (!value) {
            continue;
          }

          const match = String(value).match(
            /^TXN-(\d+)$/
          );

          if (match) {
            numbers.push(Number(match[1]));
          }
        }

        const highestNumber =
          numbers.length > 0
            ? Math.max(...numbers)
            : 0;

        const nextNumber = highestNumber + 1;

        setExpenseNumber(
          `TXN-${String(nextNumber).padStart(3, "0")}`
        );
      } catch (err) {
        console.error(
          "Expense number error:",
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : "Unable to generate expense number."
        );
      } finally {
        if (!cancelled) {
          setLoadingExpenseNumber(false);
        }
      }
    }

    loadNextExpenseNumber();

    return () => {
      cancelled = true;
    };
  }, [open, isEditMode, supabase]);

  // --------------------------------------------------
  // POPULATE EDIT FORM
  // --------------------------------------------------

  useEffect(() => {
    if (!open) {
      return;
    }

    if (!editExpense) {
      // For Add mode, only set defaults if the form
      // has not already been initialized.
      setExpenseDate(today());
      setPaymentMethod("CASH");
      return;
    }

    setExpenseNumber(
      editExpense.expense_number ?? ""
    );

    setExpenseDate(
      editExpense.expense_date ?? today()
    );

    setDescription(
      editExpense.description ?? ""
    );

    setAmount(
      editExpense.amount !== null &&
        editExpense.amount !== undefined
        ? String(editExpense.amount)
        : ""
    );

    setPaymentMethod(
      editExpense.payment_method ?? "CASH"
    );

    setNotes(editExpense.notes ?? "");

    // Category IDs are resolved after categories
    // have been loaded.
  }, [open, editExpense]);

  // --------------------------------------------------
  // MAP EDIT CATEGORY NAMES TO DB IDS
  // --------------------------------------------------

  useEffect(() => {
    if (!open || !editExpense) {
      return;
    }

    if (categories.length === 0) {
      return;
    }

    const category = categories.find(
      (item) =>
        item.parent_id === null &&
        item.category_type === "EXPENSE" &&
        item.name === editExpense.category
    );

    if (!category) {
      setCategoryId("");
      setSubcategoryId("");
      return;
    }

    setCategoryId(category.id);

    const subcategory = categories.find(
      (item) =>
        item.parent_id === category.id &&
        item.category_type === "EXPENSE" &&
        item.name === editExpense.subcategory
    );

    setSubcategoryId(
      subcategory?.id ?? ""
    );
  }, [
    open,
    editExpense,
    categories,
  ]);

  // --------------------------------------------------
  // CATEGORY CHANGE
  // --------------------------------------------------

  function handleCategoryChange(
    value: string
  ) {
    setCategoryId(value);

    // Changing category must clear the old
    // subcategory.
    setSubcategoryId("");
  }

  // --------------------------------------------------
  // SAVE / UPDATE
  // --------------------------------------------------

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setSaving(true);
    setError("");
    setMessage("");

    try {
      // ----------------------------------------------
      // VALIDATION
      // ----------------------------------------------

      if (!expenseNumber.trim()) {
        throw new Error(
          "Expense number could not be generated."
        );
      }

      if (!expenseDate) {
        throw new Error(
          "Please select an expense date."
        );
      }

      if (!categoryId) {
        throw new Error(
          "Please select an expense category."
        );
      }

      if (!subcategoryId) {
        throw new Error(
          "Please select an expense subcategory."
        );
      }

      const numericAmount = Number(amount);

      if (
        amount.trim() === "" ||
        !Number.isFinite(numericAmount) ||
        numericAmount <= 0
      ) {
        throw new Error(
          "Expense amount must be greater than zero."
        );
      }

      const selectedCategory =
        expenseCategories.find(
          (category) =>
            category.id === categoryId
        );

      const selectedSubcategory =
        subcategories.find(
          (subcategory) =>
            subcategory.id ===
            subcategoryId
        );

      if (!selectedCategory) {
        throw new Error(
          "Selected expense category is invalid."
        );
      }

      if (!selectedSubcategory) {
        throw new Error(
          "Selected expense subcategory is invalid."
        );
      }

      // ----------------------------------------------
      // PAYLOAD
      // ----------------------------------------------

      const payload = {
        expense_number:
          expenseNumber.trim(),

        expense_date: expenseDate,

        category:
          selectedCategory.name,

        subcategory:
          selectedSubcategory.name,

        description:
          description.trim() || null,

        amount: numericAmount,

        payment_method:
          paymentMethod || null,

        notes:
          notes.trim() || null,
      };

      // ----------------------------------------------
      // ----------------------------------------------
      // UPDATE EXISTING EXPENSE
      // ----------------------------------------------
if (isEditMode && editExpense) {
  const { data: updatedExpense, error: updateError } =
    await supabase
      .from("expenses")
      .update({
        ...payload,
        updated_at: new Date().toISOString(),
      })
      .eq("id", editExpense.id)
      .select(
        "id,expense_number,expense_date,category,subcategory,description,amount,payment_method,notes"
      );

  if (updateError) {
    console.error("Expense update error:", updateError);

    throw new Error(
      `Unable to update expense: ${updateError.message}`
    );
  }

  if (!updatedExpense || updatedExpense.length === 0) {
    throw new Error(
      "Expense was not updated. No matching record was returned."
    );
  }

  console.log("Updated expense:", updatedExpense[0]);

  setMessage(`${expenseNumber} updated successfully.`);
}
      // INSERT NEW EXPENSE
      // ----------------------------------------------

      else {
        const { data, error: insertError } =
          await supabase
            .from("expenses")
            .insert(payload)
            .select(
              "id,expense_number,expense_date,category,subcategory,description,amount,payment_method,notes"
            )
            .single();

        if (insertError) {
          console.error(
            "Expense insert error:",
            insertError
          );

          throw new Error(
            `Unable to save expense: ${insertError.message}`
          );
        }

        if (!data) {
          throw new Error(
            "Expense was saved but no record was returned."
          );
        }

        setMessage(
          `${expenseNumber} saved successfully.`
        );
      }

      // Refresh ExpenseTable only after the DB
      // operation and verification succeeded.
      onSaved?.();

      // Close after successful save.
      handleOpenChange(false);
    } catch (submitError) {
      console.error(
        "Expense save/update error:",
        submitError
      );

      setError(
        submitError instanceof Error
          ? submitError.message
          : "Something went wrong while saving the expense."
      );
    } finally {
      setSaving(false);
    }
  }

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <Dialog
      open={open}
      onOpenChange={handleOpenChange}
    >
      {!isEditMode && showTrigger ? (
        <Button
          type="button"
          onClick={() =>
            handleOpenChange(true)
          }
          className="gap-2 rounded-xl"
        >
          <Plus className="h-4 w-4" />
          Add Expense
        </Button>
      ) : null}

      <DialogContent
        className="
          w-[min(96vw,720px)]
          max-w-[calc(100vw-2rem)]
          max-h-[94vh]
          overflow-y-auto
          rounded-2xl
          p-0
          sm:rounded-3xl
          bg-white
        "
      >
        <DialogHeader
          className="
            border-b
            bg-gradient-to-br
            from-background
            via-background
            to-primary/[0.04]
            px-5
            py-5
            sm:px-7
            sm:py-6
          "
        >
          <div className="flex items-start gap-3 pr-8">
            <div
              className="
                flex
                h-11
                w-11
                shrink-0
                items-center
                justify-center
                rounded-2xl
                bg-primary
                text-primary-foreground
                shadow-sm 
              "
            >
              {isEditMode ? (
                <FileText className="h-5 w-5" />
              ) : (
                <Wallet className="h-5 w-5" />
              )}
            </div>

            <div>
              <DialogTitle className="text-lg">
                {isEditMode
                  ? "Edit Expense"
                  : "Add Expense"}
              </DialogTitle>

              <p className="mt-1 text-sm text-muted-foreground">
                {isEditMode
                  ? "Update the expense details below."
                  : "Record a new shop expense."}
              </p>
            </div>
          </div>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 p-5 sm:p-7"
        >
          {/* --------------------------------------- */}
          {/* EXPENSE NUMBER + DATE */}
          {/* --------------------------------------- */}

          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Expense Number"
              required
            >
              <Input
                value={expenseNumber}
                readOnly
                disabled
                placeholder={
                  loadingExpenseNumber
                    ? "Generating..."
                    : "TXN-000"
                }
                className={inputClass}
              />

              {!isEditMode &&
              loadingExpenseNumber ? (
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Finding next transaction number...
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Automatically generated from the latest transaction.
                </p>
              )}
            </Field>

            <Field
              label="Expense Date"
              required
            >
              <div className="relative">
                <CalendarDays
                  className="
                    pointer-events-none
                    absolute
                    left-3
                    top-1/2
                    h-4
                    w-4
                    -translate-y-1/2
                    text-muted-foreground
                  "
                />

                <Input
                  type="date"
                  value={expenseDate}
                  onChange={(event) =>
                    setExpenseDate(
                      event.target.value
                    )
                  }
                  className={`${inputClass} pl-10`}
                  required
                />
              </div>
            </Field>
          </div>

          {/* --------------------------------------- */}
          {/* CATEGORY */}
          {/* --------------------------------------- */}

          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Category"
              required
            >
              <select
                value={categoryId}
                onChange={(event) =>
                  handleCategoryChange(
                    event.target.value
                  )
                }
                disabled={loadingData}
                className={inputClass}
                required
              >
                <option value="">
                  {loadingData
                    ? "Loading categories..."
                    : "Select category"}
                </option>

                {expenseCategories.map(
                  (category) => (
                    <option
                      key={category.id}
                      value={category.id}
                    >
                      {category.name}
                    </option>
                  )
                )}
              </select>
            </Field>

            <Field
              label="Subcategory"
              required
            >
              <select
                value={subcategoryId}
                onChange={(event) =>
                  setSubcategoryId(
                    event.target.value
                  )
                }
                disabled={
                  !categoryId ||
                  loadingData
                }
                className={inputClass}
                required
              >
                <option value="">
                  {!categoryId
                    ? "Select category first"
                    : subcategories.length === 0
                    ? "No subcategories"
                    : "Select subcategory"}
                </option>

                {subcategories.map(
                  (subcategory) => (
                    <option
                      key={subcategory.id}
                      value={subcategory.id}
                    >
                      {subcategory.name}
                    </option>
                  )
                )}
              </select>
            </Field>
          </div>

          {/* --------------------------------------- */}
          {/* DESCRIPTION + AMOUNT */}
          {/* --------------------------------------- */}

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Description">
              <Input
                value={description}
                onChange={(event) =>
                  setDescription(
                    event.target.value
                  )
                }
                placeholder="e.g. Electricity Bill"
                className={inputClass}
              />
            </Field>

            <Field
              label="Amount"
              required
            >
              <Input
                type="number"
                min="0.01"
                step="0.01"
                value={amount}
                onChange={(event) =>
                  setAmount(
                    event.target.value
                  )
                }
                placeholder="0.00"
                className={inputClass}
                required
              />
            </Field>
          </div>

          {/* --------------------------------------- */}
          {/* PAYMENT METHOD */}
          {/* --------------------------------------- */}

          <Field label="Payment Method">
            <select
              value={paymentMethod}
              onChange={(event) =>
                setPaymentMethod(
                  event.target.value
                )
              }
              className={inputClass}
            >
              {PAYMENT_METHODS.map(
                (method) => (
                  <option
                    key={method.value}
                    value={method.value}
                  >
                    {method.label}
                  </option>
                )
              )}
            </select>
          </Field>

          {/* --------------------------------------- */}
          {/* NOTES */}
          {/* --------------------------------------- */}

          <Field label="Notes">
            <textarea
              value={notes}
              onChange={(event) =>
                setNotes(
                  event.target.value
                )
              }
              placeholder="Optional notes..."
              rows={3}
              className="
                w-full
                rounded-xl
                border
                bg-background
                px-3
                py-2.5
                text-sm
                outline-none
                transition
                focus:border-primary
                focus:ring-2
                focus:ring-primary/10
              "
            />
          </Field>

          {/* --------------------------------------- */}
          {/* ERROR */}
          {/* --------------------------------------- */}

          {error ? (
            <div
              className="
                rounded-xl
                border
                border-destructive/20
                bg-destructive/5
                px-4
                py-3
                text-sm
                text-destructive
              "
            >
              {error}
            </div>
          ) : null}

          {/* --------------------------------------- */}
          {/* SUCCESS */}
          {/* --------------------------------------- */}

          {message ? (
            <div
              className="
                rounded-xl
                border
                border-green-500/20
                bg-green-500/5
                px-4
                py-3
                text-sm
                text-green-700
              "
            >
              {message}
            </div>
          ) : null}

          {/* --------------------------------------- */}
          {/* ACTIONS */}
          {/* --------------------------------------- */}

          <div
            className="
              flex
              flex-col-reverse
              gap-3
              border-t
              pt-5
              sm:flex-row
              sm:justify-end
            "
          >
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                handleOpenChange(false)
              }
              disabled={saving}
              className="rounded-xl"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={
                saving ||
                loadingData ||
                loadingExpenseNumber ||
                !expenseNumber
              }
              className="gap-2 rounded-xl"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {isEditMode
                    ? "Updating..."
                    : "Saving..."}
                </>
              ) : (
                <>
                  <Receipt className="h-4 w-4" />

                  {isEditMode
                    ? "Update Expense"
                    : "Save Expense"}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}