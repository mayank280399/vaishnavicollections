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
  CheckCircle2,
  CreditCard,
  Package,
  Plus,
  ReceiptText,
  ShoppingCart,
  WalletCards,
  Loader2,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

type TransactionType = "sale" | "purchase" | "expense";

type Category = {
  id: string;
  name: string;
  parent_id: string | null;
  active: boolean;
};

type Product = {
  id: string;
  category_id: string | null;
  name: string;
  selling_price: number | string | null;
  cost_price: number | string | null;
  stock_quantity: number | string | null;
  online_price: number | string | null;
  online_enabled: boolean;
};

type Variant = {
  id: string;
  product_id: string;
  name: string;
  variant_value: string | null;
  selling_price: number | string | null;
  cost_price: number | string | null;
  stock_quantity: number | string | null;
  active: boolean;
};

type Customer = {
  id: string;
  display_name: string;
  phone: string | null;
  total_orders: number | null;
  total_spent: number | string | null;
  lifetime_profit: number | string | null;
  first_purchase_at: string | null;
  last_purchase_at: string | null;
};

const PAYMENT_METHODS = [
  { value: "CASH", label: "Cash" },
  { value: "UPI", label: "UPI" },
  { value: "CARD", label: "Card" },
  { value: "BANK_TRANSFER", label: "Bank Transfer" },
  { value: "OTHER", label: "Other" },
];

const EXPENSE_CATEGORIES = [
  "Shop & Utilities",
  "Marketing & Branding",
  "Packaging",
  "Transport",
  "Maintenance",
  "Rent",
  "Salary",
  "Other",
];

const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});

const today = () => new Date().toISOString().slice(0, 10);

function number(value: number | string | null | undefined) {
  return Number(value ?? 0) || 0;
}

function makeReference(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 7)
    .toUpperCase()}`;
}

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
        {required ? <span className="ml-1 text-destructive">*</span> : null}
      </Label>
      {children}
    </div>
  );
}

const inputClass =
  "h-11 w-full rounded-xl border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-50";

function Section({
  title,
  description,
  icon,
  children,
}: {
  title: string;
  description?: string;
  icon: React.ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border bg-card p-4 shadow-sm sm:p-5">
      <div className="mb-4 flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          {icon}
        </div>
        <div>
          <h3 className="text-sm font-semibold">{title}</h3>
          {description ? (
            <p className="mt-0.5 text-xs text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>
      </div>
      {children}
    </section>
  );
}

export function AddTransactionDialog() {
  const supabase = useMemo(() => createClient(), []);

  const [open, setOpen] = useState(false);
  const [transactionType, setTransactionType] =
    useState<TransactionType>("sale");

  const [date, setDate] = useState(today());
  const [paymentMethod, setPaymentMethod] = useState("CASH");

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);

  const [categoryId, setCategoryId] = useState("");
  const [subcategoryId, setSubcategoryId] = useState("");
  const [productId, setProductId] = useState("");
  const [variantId, setVariantId] = useState("");
  const [customerId, setCustomerId] = useState("");

  const [quantity, setQuantity] = useState("1");
  const [sellingPrice, setSellingPrice] = useState("");
  const [unitCost, setUnitCost] = useState("");

  const [expenseCategory, setExpenseCategory] = useState("");
  const [description, setDescription] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");

  const [loadingData, setLoadingData] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const topLevelCategories = useMemo(
    () => categories.filter((category) => !category.parent_id),
    [categories]
  );

  const subcategories = useMemo(
    () =>
      categories.filter(
        (category) => category.parent_id === categoryId
      ),
    [categories, categoryId]
  );

  const selectedProduct = products.find((p) => p.id === productId);

  const productVariants = useMemo(
    () => variants.filter((v) => v.product_id === productId && v.active),
    [variants, productId]
  );

  const selectedVariant = productVariants.find((v) => v.id === variantId);

  const filteredProducts = useMemo(
    () =>
      subcategoryId
        ? products.filter((p) => p.category_id === subcategoryId)
        : [],
    [products, subcategoryId]
  );

  const saleTotal =
    Math.max(0, number(sellingPrice) * Math.max(1, number(quantity)));

  const purchaseTotal =
    Math.max(0, number(unitCost) * Math.max(1, number(quantity)));

  useEffect(() => {
    if (!open) return;

    let cancelled = false;

    async function loadData() {
      setLoadingData(true);
      setError("");

      const [categoryResult, productResult, variantResult, customerResult] =
        await Promise.all([
          supabase
            .from("product_categories")
            .select("id,name,parent_id,active")
            .eq("active", true)
            .order("name"),
          supabase
            .from("products")
            .select(
              "id,category_id,name,selling_price,cost_price,stock_quantity,online_price,online_enabled"
            )
            .order("name"),
          supabase
            .from("product_variants")
            .select(
              "id,product_id,name,variant_value,selling_price,cost_price,stock_quantity,active"
            )
            .eq("active", true)
            .order("name"),
          supabase
            .from("customers")
            .select(
              "id,display_name,phone,total_orders,total_spent,lifetime_profit,first_purchase_at,last_purchase_at"
            )
            .order("display_name"),
        ]);

      if (cancelled) return;

      if (categoryResult.error) {
        setError(categoryResult.error.message);
      } else {
        setCategories(categoryResult.data ?? []);
      }

      if (productResult.error) {
        setError(productResult.error.message);
      } else {
        setProducts(productResult.data ?? []);
      }

      if (variantResult.error) {
        setError(variantResult.error.message);
      } else {
        setVariants(variantResult.data ?? []);
      }

      if (customerResult.error) {
        setError(customerResult.error.message);
      } else {
        setCustomers(customerResult.data ?? []);

        const walkIn = (customerResult.data ?? []).find((customer) =>
          /walk.?in/i.test(customer.display_name)
        );

        if (walkIn && !customerId) {
          setCustomerId(walkIn.id);
        }
      }

      setLoadingData(false);
    }

    void loadData();

    return () => {
      cancelled = true;
    };
  }, [open, supabase]);

  useEffect(() => {
    setVariantId("");

    if (!productId) {
      setSellingPrice("");
      setUnitCost("");
      return;
    }

    const baseSellingPrice =
      selectedProduct?.selling_price ??
      selectedProduct?.online_price ??
      "";

    const baseCost = selectedProduct?.cost_price ?? "";

    setSellingPrice(baseSellingPrice === null ? "" : String(baseSellingPrice));
    setUnitCost(baseCost === null ? "" : String(baseCost));
  }, [productId, selectedProduct]);

  useEffect(() => {
    if (!selectedVariant) return;

    if (selectedVariant.selling_price !== null) {
      setSellingPrice(String(selectedVariant.selling_price));
    }

    if (selectedVariant.cost_price !== null) {
      setUnitCost(String(selectedVariant.cost_price));
    }
  }, [selectedVariant]);

  function resetForm() {
    setTransactionType("sale");
    setDate(today());
    setPaymentMethod("CASH");
    setCategoryId("");
    setSubcategoryId("");
    setProductId("");
    setVariantId("");
    setCustomerId("");
    setQuantity("1");
    setSellingPrice("");
    setUnitCost("");
    setExpenseCategory("");
    setDescription("");
    setExpenseAmount("");
    setMessage("");
    setError("");
  }

  function changeType(type: TransactionType) {
    setTransactionType(type);
    setMessage("");
    setError("");
    setCategoryId("");
    setSubcategoryId("");
    setProductId("");
    setVariantId("");
    setQuantity("1");
    setSellingPrice("");
    setUnitCost("");
    setExpenseCategory("");
    setDescription("");
    setExpenseAmount("");
    setPaymentMethod("CASH");
  }

  function handleCategoryChange(value: string) {
    setCategoryId(value);
    setSubcategoryId("");
    setProductId("");
    setVariantId("");
    setSellingPrice("");
    setUnitCost("");
  }

  function handleSubcategoryChange(value: string) {
    setSubcategoryId(value);
    setProductId("");
    setVariantId("");
    setSellingPrice("");
    setUnitCost("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
debugger;
    setSaving(true);
    setError("");
    setMessage("");

    try {
      if (transactionType === "sale") {
        if (!customerId) throw new Error("Please select a customer.");
        if (!productId) throw new Error("Please select a product.");
        if (number(quantity) <= 0) throw new Error("Quantity must be at least 1.");
        if (number(sellingPrice) < 0)
          throw new Error("Selling price cannot be negative.");

        const qty = number(quantity);
        const price = number(sellingPrice);
        const total = price * qty;

        // const availableStock = number(
        //   selectedVariant?.stock_quantity ?? selectedProduct?.stock_quantity
        // );

        // if (qty > availableStock) {
        //   throw new Error(
        //     `Only ${availableStock} item${availableStock === 1 ? "" : "s"} available in stock.`
        //   );
        // }

        // Cost is intentionally NOT entered by the admin.
        // The current product/variant cost is stored automatically in the
        // sale snapshot. Purchase-driven inventory costing can replace this
        // with FIFO/lot costing later without changing the UI.
        const cost = number(
          selectedVariant?.cost_price ?? selectedProduct?.cost_price
        );
        const lineCost = cost * qty;
        const profit = total - lineCost;

        const invoiceNumber = makeReference("INV");

        const { data: sale, error: saleError } = await supabase
          .from("sales")
          .insert({
            customer_id: customerId,
            invoice_number: invoiceNumber,
            subtotal: total,
            discount_amount: 0,
            reward_discount: 0,
            tax_amount: 0,
            shipping_amount: 0,
            total_amount: total,
            cost_amount: lineCost,
            gross_profit: profit,
            payment_method: paymentMethod,
            status: "COMPLETED",
            source: "PHYSICAL_SHOP",
            purchased_at: new Date(`${date}T12:00:00`).toISOString(),
          })
          .select("id")
          .single();

        if (saleError || !sale) {
          throw new Error(saleError?.message ?? "Unable to create sale.");
        }

        const { error: itemError } = await supabase
          .from("sale_items")
          .insert({
            sale_id: sale.id,
            product_id: productId,
            variant_id: variantId || null,
            quantity: qty,
            unit_price: price,
            discount: 0,
            cost_price: cost,
            line_total: total,
            line_cost: lineCost,
            line_profit: profit,
            points_earned: 0,
          });

        if (itemError) {
          await supabase.from("sales").delete().eq("id", sale.id);
          throw new Error(itemError.message);
        }

        if (variantId) {
          const currentStock = number(selectedVariant?.stock_quantity);
          const { error: stockError } = await supabase
            .from("product_variants")
            .update({
              stock_quantity: currentStock - qty,
              updated_at: new Date().toISOString(),
            })
            .eq("id", variantId);
        //Temp Comment:  Going to uncomment this, when we enter new product via application.
       //   if (stockError) throw new Error(stockError.message);
        } else if (selectedProduct) {
          const currentStock = number(selectedProduct.stock_quantity);
          const { error: stockError } = await supabase
            .from("products")
            .update({
              stock_quantity: currentStock - qty,
              updated_at: new Date().toISOString(),
            })
            .eq("id", productId);
        // Temp Comment:  Going to uncomment this, when we enter new product via application.
       //   if (stockError) throw new Error(stockError.message);
        }

        const customer = customers.find((c) => c.id === customerId);

        if (customer) {
          const purchaseTimestamp = new Date(
            `${date}T12:00:00`
          ).toISOString();

          const existingOrders = number(customer.total_orders);
          const existingSpent = number(customer.total_spent);
          const existingProfit = number(customer.lifetime_profit);

          const { error: customerError } = await supabase
            .from("customers")
            .update({
              total_orders: existingOrders + 1,
              total_spent: existingSpent + total,
              lifetime_profit: existingProfit + profit,
              first_purchase_at:
                customer.first_purchase_at ?? purchaseTimestamp,
              last_purchase_at: purchaseTimestamp,
              updated_at: new Date().toISOString(),
            })
            .eq("id", customerId);

          // Customer summary is a denormalized convenience field. Do not
          // block the sale if an RLS policy prevents updating it.
          if (customerError) {
            console.warn("Customer summary was not updated:", customerError);
          }
        }

        setMessage(`Sale saved • ${invoiceNumber}`);
      }

      if (transactionType === "purchase") {
        if (!productId) throw new Error("Please select a product.");
        if (number(quantity) <= 0) throw new Error("Quantity must be at least 1.");
        if (number(unitCost) < 0)
          throw new Error("Unit cost cannot be negative.");

        const qty = number(quantity);
        const cost = number(unitCost);
        const total = cost * qty;
        const invoiceNumber = makeReference("PUR");

        const { data: purchase, error: purchaseError } = await supabase
          .from("purchases")
          .insert({
            supplier_name: null,
            invoice_number: invoiceNumber,
            subtotal: total,
            discount_amount: 0,
            tax_amount: 0,
            shipping_amount: 0,
            total_amount: total,
            payment_method: paymentMethod,
            status: "COMPLETED",
            purchased_at: new Date(`${date}T12:00:00`).toISOString(),
          })
          .select("id")
          .single();

        if (purchaseError || !purchase) {
          throw new Error(
            purchaseError?.message ?? "Unable to create purchase."
          );
        }

        const { error: itemError } = await supabase
          .from("purchase_items")
          .insert({
            purchase_id: purchase.id,
            product_id: productId,
            variant_id: variantId || null,
            quantity: qty,
            unit_cost: cost,
            discount: 0,
            line_total: total,
          });

        if (itemError) {
          await supabase.from("purchases").delete().eq("id", purchase.id);
          throw new Error(itemError.message);
        }

        if (variantId) {
          const currentStock = number(selectedVariant?.stock_quantity);
          const { error: stockError } = await supabase
            .from("product_variants")
            .update({
              stock_quantity: currentStock + qty,
              cost_price: cost,
              updated_at: new Date().toISOString(),
            })
            .eq("id", variantId);
    // Temp Comment:  Going to uncomment this, when we enter new product via application.
   //       if (stockError) throw new Error(stockError.message);
        } else {
          const currentStock = number(selectedProduct?.stock_quantity);
          const { error: stockError } = await supabase
            .from("products")
            .update({
              stock_quantity: currentStock + qty,
              cost_price: cost,
              updated_at: new Date().toISOString(),
            })
            .eq("id", productId);

          if (stockError) throw new Error(stockError.message);
        }

        setMessage(`Purchase saved • ${invoiceNumber}`);
      }

      if (transactionType === "expense") {
        if (!expenseCategory) throw new Error("Please select an expense category.");
        if (!description.trim()) throw new Error("Please enter a description.");
        if (number(expenseAmount) <= 0)
          throw new Error("Expense amount must be greater than zero.");

        const expenseNumber = makeReference("EXP");

        const { error: expenseError } = await supabase
          .from("expenses")
          .insert({
            expense_number: expenseNumber,
            expense_date: date,
            category: expenseCategory,
            subcategory: null,
            description: description.trim(),
            amount: number(expenseAmount),
            payment_method: paymentMethod,
          });

        if (expenseError) throw new Error(expenseError.message);

        setMessage(`Expense saved • ${expenseNumber}`);
      }
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Something went wrong while saving."
      );
    } finally {
      setSaving(false);
    }
  }

  const typeItems = [
    {
      value: "sale" as const,
      label: "Sale",
      icon: ReceiptText,
      helper: "Record customer revenue",
    },
    {
      value: "purchase" as const,
      label: "Purchase",
      icon: ShoppingCart,
      helper: "Add inventory",
    },
    {
      value: "expense" as const,
      label: "Expense",
      icon: WalletCards,
      helper: "Record shop spending",
    },
  ];

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) resetForm();
      }}
    >
      <Button type="button" onClick={() => setOpen(true)}   className="col-start-2 row-start-1 shrink-0">
        <Plus className="mr-2 h-4 w-4" />
        Add
      </Button>

      <DialogContent
        className="
          w-[min(96vw,1400px)]
          !max-w-[1400px]
          bg-white
          max-w-[calc(100vw-2rem)]
          max-h-[94vh]
          min-h-[min(720px,90vh)]
          overflow-hidden
          gap-0
          rounded-2xl
          border
          p-0
          shadow-2xl
          sm:rounded-3xl
        "
      >
        <DialogHeader className="border-b bg-gradient-to-br from-background via-background to-primary/[0.04] px-5 py-5 sm:px-7 sm:py-6">
          <div className="flex items-start gap-3 pr-8">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
              <ReceiptText className="h-5 w-5" />
            </div>

            <div className="min-w-0">
              <DialogTitle className="text-xl font-bold tracking-tight sm:text-2xl">
                Add Transaction
              </DialogTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                Record sales, purchases and shop expenses quickly.
              </p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-1.5 rounded-2xl bg-muted/70 p-1.5">
            {typeItems.map((item) => {
              const Icon = item.icon;
              const active = transactionType === item.value;

              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => changeType(item.value)}
                  className={`group flex min-h-12 items-center justify-center gap-2 rounded-xl px-2 py-2 text-sm font-medium transition-all sm:min-h-14 ${
                    active
                      ? "bg-background text-foreground shadow-sm ring-1 ring-border"
                      : "text-muted-foreground hover:bg-background/70 hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </DialogHeader>

        <div className="max-h-[calc(94vh-190px)] overflow-y-auto">
          <form
              onSubmit={handleSubmit}
              className="mx-auto w-full max-w-[1280px] p-4 sm:p-6 lg:p-8"
            >
            {loadingData ? (
              <div className="flex min-h-72 items-center justify-center">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading products and customers...
                </div>
              </div>
            ) : (
              <div className="space-y-4 sm:space-y-5">
                {message ? (
                  <div className="flex items-center gap-2 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-400">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    {message}
                  </div>
                ) : null}

                {error ? (
                  <div className="rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive text-white bg-red-600 font-bold">
                    {error}
                  </div>
                ) : null}

                <Section
                  title="Transaction details"
                  description="Only the information needed for this transaction."
                  icon={<CalendarDays className="h-4 w-4" />}
                >
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Field label="Date" required>
                      <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className={inputClass}
                        required
                      />
                    </Field>

                    {transactionType === "sale" ? (
                      <Field label="Customer" required>
                        <select
                          value={customerId}
                          onChange={(e) => setCustomerId(e.target.value)}
                          className={inputClass}
                          required
                        >
                          <option value="">Select customer</option>
                          {customers.map((customer) => (
                            <option key={customer.id} value={customer.id}>
                              {customer.display_name}
                              {customer.phone ? ` • ${customer.phone}` : ""}
                            </option>
                          ))}
                        </select>
                      </Field>
                    ) : (
                      <Field label="Payment Method" required>
                        <select
                          value={paymentMethod}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className={inputClass}
                          required
                        >
                          {PAYMENT_METHODS.map((method) => (
                            <option key={method.value} value={method.value}>
                              {method.label}
                            </option>
                          ))}
                        </select>
                      </Field>
                    )}
                  </div>
                </Section>

                {transactionType !== "expense" ? (
                  <>
                    <Section
                      title={transactionType === "sale" ? "What was sold?" : "What was purchased?"}
                      description="Choose the category and product. Variant appears only when available."
                      icon={<Package className="h-4 w-4" />}
                    >
                      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                        <Field label="Category" required>
                          <select
                            value={categoryId}
                            onChange={(e) => handleCategoryChange(e.target.value)}
                            className={inputClass}
                            required
                          >
                            <option value="">Select category</option>
                            {topLevelCategories.map((category) => (
                              <option key={category.id} value={category.id}>
                                {category.name}
                              </option>
                            ))}
                          </select>
                        </Field>

                        <Field label="Subcategory" required>
                          <select
                            value={subcategoryId}
                            onChange={(e) =>
                              handleSubcategoryChange(e.target.value)
                            }
                            disabled={!categoryId || subcategories.length === 0}
                            className={inputClass}
                            required
                          >
                            <option value="">
                              {!categoryId
                                ? "Select category first"
                                : subcategories.length
                                  ? "Select subcategory"
                                  : "No subcategories"}
                            </option>
                            {subcategories.map((subcategory) => (
                              <option
                                key={subcategory.id}
                                value={subcategory.id}
                              >
                                {subcategory.name}
                              </option>
                            ))}
                          </select>
                        </Field>

                        <Field label="Product" required>
                          <select
                            value={productId}
                            onChange={(e) => setProductId(e.target.value)}
                            disabled={!subcategoryId}
                            className={inputClass}
                            required
                          >
                            <option value="">
                              {!subcategoryId
                                ? "Select subcategory first"
                                : filteredProducts.length
                                  ? "Select product"
                                  : "No products in this subcategory"}
                            </option>
                            {filteredProducts.map((product) => (
                              <option key={product.id} value={product.id}>
                                {product.name}
                              </option>
                            ))}
                          </select>
                        </Field>

                        {productVariants.length > 0 ? (
                          <Field label="Variant">
                            <select
                              value={variantId}
                              onChange={(e) => setVariantId(e.target.value)}
                              className={inputClass}
                            >
                              <option value="">No variant</option>
                              {productVariants.map((variant) => (
                                <option key={variant.id} value={variant.id}>
                                  {variant.name}
                                  {variant.variant_value
                                    ? ` • ${variant.variant_value}`
                                    : ""}
                                </option>
                              ))}
                            </select>
                          </Field>
                        ) : null}

                        <Field label="Quantity" required>
                          <input
                            type="number"
                            min="1"
                            step="1"
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            className={inputClass}
                            required
                          />
                        </Field>
                      </div>
                    </Section>

                    <Section
                      title={transactionType === "sale" ? "Pricing" : "Purchase cost"}
                      description={
                        transactionType === "sale"
                          ? "Selling price is filled automatically and can be adjusted for this sale."
                          : "Enter the actual unit cost paid to the supplier."
                      }
                      icon={
                        transactionType === "sale" ? (
                          <CreditCard className="h-4 w-4" />
                        ) : (
                          <ShoppingCart className="h-4 w-4" />
                        )
                      }
                    >
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <Field
                          label={transactionType === "sale" ? "Selling Price" : "Unit Cost"}
                          required
                        >
                          <div className="relative">
                            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-muted-foreground">
                              ₹
                            </span>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={
                                transactionType === "sale"
                                  ? sellingPrice
                                  : unitCost
                              }
                              onChange={(e) =>
                                transactionType === "sale"
                                  ? setSellingPrice(e.target.value)
                                  : setUnitCost(e.target.value)
                              }
                              placeholder="0.00"
                              className={`${inputClass} pl-8`}
                              required
                            />
                          </div>
                        </Field>

                        <div className="rounded-2xl border bg-muted/40 p-4">
                          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                            {transactionType === "sale"
                              ? "Sale Total"
                              : "Purchase Total"}
                          </p>
                          <p className="mt-1 text-2xl font-bold tracking-tight">
                            {currency.format(
                              transactionType === "sale"
                                ? saleTotal
                                : purchaseTotal
                            )}
                          </p>
                          {transactionType === "sale" ? (
                            <p className="mt-1 text-xs text-muted-foreground">
                              Cost is handled automatically — no cost entry required.
                            </p>
                          ) : (
                            <p className="mt-1 text-xs text-muted-foreground">
                              Stock will increase automatically after saving.
                            </p>
                          )}
                        </div>
                      </div>
                    </Section>

                    <Section
                      title="Payment"
                      description="Choose how the money was received or paid."
                      icon={<WalletCards className="h-4 w-4" />}
                    >
                      <Field label="Payment Method" required>
                        <select
                          value={paymentMethod}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className={inputClass}
                          required
                        >
                          {PAYMENT_METHODS.map((method) => (
                            <option key={method.value} value={method.value}>
                              {method.label}
                            </option>
                          ))}
                        </select>
                      </Field>
                    </Section>
                  </>
                ) : (
                  <>
                    <Section
                      title="Expense details"
                      description="Keep shop expenses quick and easy to record."
                      icon={<WalletCards className="h-4 w-4" />}
                    >
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <Field label="Expense Category" required>
                          <select
                            value={expenseCategory}
                            onChange={(e) => setExpenseCategory(e.target.value)}
                            className={inputClass}
                            required
                          >
                            <option value="">Select category</option>
                            {EXPENSE_CATEGORIES.map((category) => (
                              <option key={category} value={category}>
                                {category}
                              </option>
                            ))}
                          </select>
                        </Field>

                        <Field label="Amount" required>
                          <div className="relative">
                            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-muted-foreground">
                              ₹
                            </span>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={expenseAmount}
                              onChange={(e) => setExpenseAmount(e.target.value)}
                              placeholder="0.00"
                              className={`${inputClass} pl-8`}
                              required
                            />
                          </div>
                        </Field>

                        <div className="md:col-span-2">
                          <Field label="Description" required>
                            <input
                              type="text"
                              value={description}
                              onChange={(e) => setDescription(e.target.value)}
                              placeholder="e.g. Electricity bill, visiting cards..."
                              className={inputClass}
                              required
                            />
                          </Field>
                        </div>

                        <div className="md:col-span-2">
                          <Field label="Payment Method" required>
                            <select
                              value={paymentMethod}
                              onChange={(e) => setPaymentMethod(e.target.value)}
                              className={inputClass}
                              required
                            >
                              {PAYMENT_METHODS.map((method) => (
                                <option key={method.value} value={method.value}>
                                  {method.label}
                                </option>
                              ))}
                            </select>
                          </Field>
                        </div>
                      </div>
                    </Section>
                  </>
                )}

                <div className="flex flex-col-reverse gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    className="h-11 rounded-xl sm:min-w-28"
                    onClick={() => {
                      setOpen(false);
                      resetForm();
                    }}
                    disabled={saving}
                  >
                    Cancel
                  </Button>

                  <Button
                    type="submit"
                    className="h-11 rounded-xl px-6 shadow-sm sm:min-w-40"
                    disabled={saving || loadingData}
                  >
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        {transactionType === "sale"
                          ? "Save Sale"
                          : transactionType === "purchase"
                            ? "Save Purchase"
                            : "Save Expense"}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
