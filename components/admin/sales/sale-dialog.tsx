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
  Loader2,
  Package,
  Plus,
  ReceiptText,
  WalletCards,
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

type SaleDialogProps = {
  showTrigger?: boolean;
  editSale?: {
    id: string;
    invoice_number: string;
  } | null;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSaved?: () => void;
};

type StockChange = {
  productId: string;
  variantId: string | null;
  delta: number;
};

const PAYMENT_METHODS = [
  { value: "CASH", label: "Cash" },
  { value: "UPI", label: "UPI" },
  { value: "CARD", label: "Card" },
  { value: "BANK_TRANSFER", label: "Bank Transfer" },
  { value: "OTHER", label: "Other" },
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

function stockKey(productId: string, variantId: string | null) {
  return `${productId}:${variantId ?? ""}`;
}

function aggregateStockChanges(changes: StockChange[]) {
  const map = new Map<string, StockChange>();

  for (const change of changes) {
    if (!change.delta) continue;

    const key = stockKey(
      change.productId,
      change.variantId
    );

    const existing = map.get(key);

    if (existing) {
      existing.delta += change.delta;
    } else {
      map.set(key, { ...change });
    }
  }

  return Array.from(map.values()).filter(
    (change) => change.delta !== 0
  );
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
        {required ? (
          <span className="ml-1 text-destructive">*</span>
        ) : null}
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

export function SaleDialog({
  showTrigger = false,
  editSale = null,
  open: controlledOpen,
  onOpenChange,
  onSaved,
}: SaleDialogProps) {
  const supabase = useMemo(() => createClient(), []);

  const isEditMode = Boolean(editSale);
  const isControlled = controlledOpen !== undefined;

  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;

  function handleOpenChange(value: boolean) {
    if (!isControlled) {
      setInternalOpen(value);
    }

    onOpenChange?.(value);

    if (!value) {
      resetForm();
    }
  }

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

  const [loadingData, setLoadingData] = useState(false);
  const [loadingSale, setLoadingSale] = useState(false);
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

  const selectedProduct = products.find(
    (product) => product.id === productId
  );

  const productVariants = useMemo(
    () =>
      variants.filter(
        (variant) =>
          variant.product_id === productId && variant.active
      ),
    [variants, productId]
  );

  const selectedVariant = productVariants.find(
    (variant) => variant.id === variantId
  );

  const filteredProducts = useMemo(
    () =>
      subcategoryId
        ? products.filter(
            (product) => product.category_id === subcategoryId
          )
        : [],
    [products, subcategoryId]
  );

  const saleTotal =
    Math.max(0, number(sellingPrice)) *
    Math.max(1, number(quantity));

  /*
   * Get current stock for a product or variant.
   */
  async function getStock(
    productId: string,
    variantId: string | null
  ) {
    if (variantId) {
      const { data, error } = await supabase
        .from("product_variants")
        .select("id,stock_quantity")
        .eq("id", variantId)
        .single();

      if (error) throw error;

      return number(data?.stock_quantity);
    }

    const { data, error } = await supabase
      .from("products")
      .select("id,stock_quantity")
      .eq("id", productId)
      .single();

    if (error) throw error;

    return number(data?.stock_quantity);
  }

  /*
   * Apply a stock delta.
   *
   * Positive delta = stock comes back / is added.
   * Negative delta = stock is consumed / sold.
   */
  async function adjustStock(
    productId: string,
    variantId: string | null,
    delta: number
  ) {
    if (!delta) return;

    if (variantId) {
      const { data: variant, error: variantError } =
        await supabase
          .from("product_variants")
          .select("id,stock_quantity")
          .eq("id", variantId)
          .single();

      if (variantError) throw variantError;

      const currentStock = number(
        variant?.stock_quantity
      );

      const newStock = currentStock + delta;

      if (newStock < 0) {
        throw new Error(
          "Insufficient stock for the selected variant."
        );
      }

      const { error } = await supabase
        .from("product_variants")
        .update({
          stock_quantity: newStock,
          updated_at: new Date().toISOString(),
        })
        .eq("id", variantId);

      if (error) throw error;

      return;
    }

    const { data: product, error: productError } =
      await supabase
        .from("products")
        .select("id,stock_quantity")
        .eq("id", productId)
        .single();

    if (productError) throw productError;

    const currentStock = number(
      product?.stock_quantity
    );

    const newStock = currentStock + delta;

    if (newStock < 0) {
      throw new Error(
        "Insufficient stock for the selected product."
      );
    }

    const { error } = await supabase
      .from("products")
      .update({
        stock_quantity: newStock,
        updated_at: new Date().toISOString(),
      })
      .eq("id", productId);

    if (error) throw error;
  }

  /*
   * Validate every negative stock change before applying
   * any stock changes.
   *
   * This prevents a multi-change sale edit from partially
   * changing stock before discovering insufficient stock.
   */
  async function validateStockChanges(
    changes: StockChange[]
  ) {
    const aggregated = aggregateStockChanges(changes);

    for (const change of aggregated) {
      if (change.delta >= 0) continue;

      const currentStock = await getStock(
        change.productId,
        change.variantId
      );

      const resultingStock =
        currentStock + change.delta;

      if (resultingStock < 0) {
        const required = Math.abs(change.delta);

        throw new Error(
          `Insufficient stock. Available: ${currentStock}, required: ${required}.`
        );
      }
    }
  }

  /*
   * Apply stock changes and remember what was successfully
   * changed so the caller can roll them back if necessary.
   */
  async function applyStockChanges(
    changes: StockChange[]
  ) {
    const aggregated = aggregateStockChanges(changes);
    const applied: StockChange[] = [];

    try {
      for (const change of aggregated) {
        await adjustStock(
          change.productId,
          change.variantId,
          change.delta
        );

        applied.push(change);
      }

      return applied;
    } catch (error) {
      /*
       * Best-effort rollback for changes already applied.
       */
      for (const change of [...applied].reverse()) {
        try {
          await adjustStock(
            change.productId,
            change.variantId,
            -change.delta
          );
        } catch {
          // Do not hide the original error.
        }
      }

      throw error;
    }
  }

  /*
   * Load master data.
   */
  useEffect(() => {
    if (!open) return;

    let cancelled = false;

    async function loadData() {
      setLoadingData(true);
      setError("");

      const [
        categoryResult,
        productResult,
        variantResult,
        customerResult,
      ] = await Promise.all([
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

        if (!isEditMode && !customerId) {
          const walkIn = (
            customerResult.data ?? []
          ).find((customer) =>
            /walk.?in/i.test(customer.display_name)
          );

          if (walkIn) {
            setCustomerId(walkIn.id);
          }
        }
      }

      setLoadingData(false);
    }

    void loadData();

    return () => {
      cancelled = true;
    };
  }, [open, supabase, isEditMode]);

  /*
   * When editing, load the existing sale and its single sale item.
   */
  useEffect(() => {
    if (!open || !editSale?.id) return;

    let cancelled = false;

    async function loadSale() {
      setLoadingSale(true);
      setError("");
      setMessage("");

      const saleId = editSale?.id;

      if (!saleId) return;

      const { data, error: saleError } = await supabase
        .from("sales")
        .select(`
          id,
          customer_id,
          invoice_number,
          payment_method,
          purchased_at,
          sale_items (
            id,
            product_id,
            variant_id,
            quantity,
            unit_price
          )
        `)
        .eq("id", saleId)
        .single();

      if (cancelled) return;

      if (saleError || !data) {
        setError(
          saleError?.message ??
            "Unable to load this sale."
        );
        setLoadingSale(false);
        return;
      }

      if (data.sale_items?.length !== 1) {
        setError(
          "This sale contains multiple items. The current sales form supports editing one-item sales only."
        );
        setLoadingSale(false);
        return;
      }

      const item = data.sale_items[0];

      setDate(
        data.purchased_at
          ? new Date(data.purchased_at)
              .toISOString()
              .slice(0, 10)
          : today()
      );

      setPaymentMethod(data.payment_method ?? "CASH");
      setCustomerId(data.customer_id ?? "");
      setProductId(item.product_id ?? "");
      setVariantId(item.variant_id ?? "");
      setQuantity(String(item.quantity ?? 1));
      setSellingPrice(String(item.unit_price ?? 0));

      setLoadingSale(false);
    }

    void loadSale();

    return () => {
      cancelled = true;
    };
  }, [open, editSale?.id, supabase]);

  /*
   * Once product data is loaded, derive category/subcategory
   * from the selected product.
   */
  useEffect(() => {
    if (!productId || products.length === 0) return;

    const product = products.find(
      (item) => item.id === productId
    );

    if (!product?.category_id) return;

    const subcategory = categories.find(
      (category) => category.id === product.category_id
    );

    if (!subcategory) return;

    setSubcategoryId(subcategory.id);

    if (subcategory.parent_id) {
      setCategoryId(subcategory.parent_id);
    }
  }, [productId, products, categories]);

  /*
   * Set prices when selecting a product.
   */
  useEffect(() => {
    if (!productId || isEditMode) return;

    const baseSellingPrice =
      selectedProduct?.selling_price ??
      selectedProduct?.online_price ??
      "";

    setSellingPrice(
      baseSellingPrice === null
        ? ""
        : String(baseSellingPrice)
    );

    setVariantId("");
  }, [productId, selectedProduct, isEditMode]);

  /*
   * Variant changes the selling price.
   */
  useEffect(() => {
    if (!selectedVariant || isEditMode) return;

    if (selectedVariant.selling_price !== null) {
      setSellingPrice(
        String(selectedVariant.selling_price)
      );
    }
  }, [selectedVariant, isEditMode]);

  function resetForm() {
    setDate(today());
    setPaymentMethod("CASH");
    setCategoryId("");
    setSubcategoryId("");
    setProductId("");
    setVariantId("");
    setCustomerId("");
    setQuantity("1");
    setSellingPrice("");
    setMessage("");
    setError("");
    setLoadingSale(false);
  }

  function handleCategoryChange(value: string) {
    setCategoryId(value);
    setSubcategoryId("");
    setProductId("");
    setVariantId("");
    setSellingPrice("");
  }

  function handleSubcategoryChange(value: string) {
    setSubcategoryId(value);
    setProductId("");
    setVariantId("");
    setSellingPrice("");
  }

  async function handleAddSale() {
    if (!customerId) {
      throw new Error("Please select a customer.");
    }

    if (!productId) {
      throw new Error("Please select a product.");
    }

    if (number(quantity) <= 0) {
      throw new Error("Quantity must be at least 1.");
    }

    if (number(sellingPrice) < 0) {
      throw new Error(
        "Selling price cannot be negative."
      );
    }

    const qty = number(quantity);
    const price = number(sellingPrice);
    const total = price * qty;

    const cost = number(
      selectedVariant?.cost_price ??
        selectedProduct?.cost_price
    );

    const lineCost = cost * qty;
    const profit = total - lineCost;

    /*
     * A new completed sale consumes stock.
     */
    const stockChanges: StockChange[] = [
      {
        productId,
        variantId: variantId || null,
        delta: -qty,
      },
    ];

    /*
     * Validate stock before creating the sale.
     */
    await validateStockChanges(stockChanges);

    const invoiceNumber = `INV-${Date.now()}`;

    const purchasedAt = new Date(
      `${date}T12:00:00`
    ).toISOString();

    const { data: sale, error: saleError } =
      await supabase
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
          purchased_at: purchasedAt,
        })
        .select("id")
        .single();

    if (saleError || !sale) {
      throw new Error(
        saleError?.message ??
          "Unable to create sale."
      );
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
      await supabase
        .from("sales")
        .delete()
        .eq("id", sale.id);

      throw new Error(itemError.message);
    }

    /*
     * Now consume stock.
     *
     * Validation was already performed before the sale
     * was created. If the actual stock update fails,
     * remove the newly created sale.
     */
    try {
      await applyStockChanges(stockChanges);
    } catch (stockError) {
      await supabase
        .from("sale_items")
        .delete()
        .eq("sale_id", sale.id);

      await supabase
        .from("sales")
        .delete()
        .eq("id", sale.id);

      throw stockError;
    }

    setMessage(`Sale saved • ${invoiceNumber}`);
  }

  async function handleUpdateSale() {
    if (!editSale?.id) {
      throw new Error("Sale ID is missing.");
    }

    if (!customerId) {
      throw new Error("Please select a customer.");
    }

    if (!productId) {
      throw new Error("Please select a product.");
    }

    if (number(quantity) <= 0) {
      throw new Error("Quantity must be at least 1.");
    }

    if (number(sellingPrice) < 0) {
      throw new Error(
        "Selling price cannot be negative."
      );
    }

    /*
     * Load the existing sale/item so we can calculate
     * the exact stock difference.
     */
    const { data: existingSale, error: existingError } =
      await supabase
        .from("sales")
        .select(`
          id,
          customer_id,
          total_amount,
          cost_amount,
          gross_profit,
          payment_method,
          purchased_at,
          status,
          sale_items (
            id,
            product_id,
            variant_id,
            quantity,
            unit_price,
            cost_price
          )
        `)
        .eq("id", editSale.id)
        .single();

    if (existingError || !existingSale) {
      throw new Error(
        existingError?.message ??
          "Unable to load existing sale."
      );
    }

    if (existingSale.sale_items?.length !== 1) {
      throw new Error(
        "This sale contains multiple items and cannot be edited using this form yet."
      );
    }

    const oldItem = existingSale.sale_items[0];

    const qty = number(quantity);
    const price = number(sellingPrice);
    const total = price * qty;

    const cost = number(
      selectedVariant?.cost_price ??
        selectedProduct?.cost_price
    );

    const lineCost = cost * qty;
    const profit = total - lineCost;

    const purchasedAt = new Date(
      `${date}T12:00:00`
    ).toISOString();

    /*
     * Build the NET stock change.
     *
     * Old sale quantity is restored (+oldQty).
     * New sale quantity is consumed (-newQty).
     *
     * Examples:
     *
     * 5 -> 3 of same product:
     * +5 -3 = +2
     *
     * 5 -> 7 of same product:
     * +5 -7 = -2
     *
     * Product A 5 -> Product B 3:
     * A +5
     * B -3
     */
    const stockChanges: StockChange[] = [
      {
        productId: oldItem.product_id,
        variantId: oldItem.variant_id,
        delta: number(oldItem.quantity),
      },
      {
        productId,
        variantId: variantId || null,
        delta: -qty,
      },
    ];

    const aggregatedStockChanges =
      aggregateStockChanges(stockChanges);

    /*
     * Validate all negative changes BEFORE modifying
     * either stock or sale records.
     */
    await validateStockChanges(
      aggregatedStockChanges
    );

    /*
     * Apply stock first.
     *
     * This ensures that if the new sale needs additional
     * stock, that stock is actually available before the
     * sale record is changed.
     */
    const appliedStockChanges =
      await applyStockChanges(
        aggregatedStockChanges
      );

    /*
     * Update sale header.
     */
    const { error: saleUpdateError } = await supabase
      .from("sales")
      .update({
        customer_id: customerId,
        subtotal: total,
        discount_amount: 0,
        reward_discount: 0,
        tax_amount: 0,
        shipping_amount: 0,
        total_amount: total,
        cost_amount: lineCost,
        gross_profit: profit,
        payment_method: paymentMethod,
        purchased_at: purchasedAt,
        updated_at: new Date().toISOString(),
      })
      .eq("id", editSale.id);

    if (saleUpdateError) {
      /*
       * Sale update failed, so restore the exact stock
       * changes that were already applied.
       */
      for (const change of [
        ...appliedStockChanges,
      ].reverse()) {
        try {
          await adjustStock(
            change.productId,
            change.variantId,
            -change.delta
          );
        } catch {
          // Keep the original database error.
        }
      }

      throw new Error(saleUpdateError.message);
    }

    /*
     * Update existing sale item.
     */
    const { error: itemUpdateError } = await supabase
      .from("sale_items")
      .update({
        product_id: productId,
        variant_id: variantId || null,
        quantity: qty,
        unit_price: price,
        discount: 0,
        cost_price: cost,
        line_total: total,
        line_cost: lineCost,
        line_profit: profit,
      })
      .eq("id", oldItem.id);

    if (itemUpdateError) {
      /*
       * Roll the sale header and stock back if the
       * sale-item update fails.
       */
      try {
        await supabase
          .from("sales")
          .update({
            customer_id: existingSale.customer_id,
            total_amount: existingSale.total_amount,
            cost_amount: existingSale.cost_amount,
            gross_profit: existingSale.gross_profit,
            payment_method:
              existingSale.payment_method,
            purchased_at:
              existingSale.purchased_at,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editSale.id);
      } catch {
        // Keep the original item error.
      }

      for (const change of [
        ...appliedStockChanges,
      ].reverse()) {
        try {
          await adjustStock(
            change.productId,
            change.variantId,
            -change.delta
          );
        } catch {
          // Keep the original database error.
        }
      }

      throw new Error(itemUpdateError.message);
    }

    setMessage(
      `Sale ${editSale.invoice_number} updated successfully.`
    );
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setSaving(true);
    setError("");
    setMessage("");

    try {
      if (isEditMode) {
        await handleUpdateSale();
      } else {
        await handleAddSale();
      }

      onSaved?.();
      handleOpenChange(false);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Something went wrong."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {!isEditMode && showTrigger ? (
        <Button
          type="button"
          onClick={() => handleOpenChange(true)}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Sale
        </Button>
      ) : null}

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

            <div>
              <DialogTitle className="text-xl font-bold tracking-tight sm:text-2xl">
                {isEditMode
                  ? `Edit Sale • ${editSale?.invoice_number}`
                  : "Add Sale"}
              </DialogTitle>

              <p className="mt-1 text-sm text-muted-foreground">
                {isEditMode
                  ? "Update the details of this sale."
                  : "Record a customer sale quickly."}
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="max-h-[calc(94vh-140px)] overflow-y-auto">
          <form
            onSubmit={handleSubmit}
            className="mx-auto w-full max-w-[1280px] p-4 sm:p-6 lg:p-8"
          >
            {loadingData || loadingSale ? (
              <div className="flex min-h-72 items-center justify-center">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {loadingSale
                    ? "Loading sale..."
                    : "Loading products and customers..."}
                </div>
              </div>
            ) : (
              <div className="space-y-4 sm:space-y-5">
                {message ? (
                  <div className="flex items-center gap-2 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    {message}
                  </div>
                ) : null}

                {error ? (
                  <div className="rounded-2xl bg-red-600 px-4 py-3 text-sm font-bold text-white">
                    {error}
                  </div>
                ) : null}

                <Section
                  title="Transaction details"
                  description="Enter the basic information for this sale."
                  icon={
                    <CalendarDays className="h-4 w-4" />
                  }
                >
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Field label="Date" required>
                      <input
                        type="date"
                        value={date}
                        onChange={(e) =>
                          setDate(e.target.value)
                        }
                        className={inputClass}
                        required
                      />
                    </Field>

                    <Field label="Customer" required>
                      <select
                        value={customerId}
                        onChange={(e) =>
                          setCustomerId(e.target.value)
                        }
                        className={inputClass}
                        required
                      >
                        <option value="">
                          Select customer
                        </option>

                        {customers.map((customer) => (
                          <option
                            key={customer.id}
                            value={customer.id}
                          >
                            {customer.display_name}
                            {customer.phone
                              ? ` • ${customer.phone}`
                              : ""}
                          </option>
                        ))}
                      </select>
                    </Field>
                  </div>
                </Section>

                <Section
                  title="What was sold?"
                  description="Choose the category, product and quantity."
                  icon={<Package className="h-4 w-4" />}
                >
                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <Field label="Category" required>
                      <select
                        value={categoryId}
                        onChange={(e) =>
                          handleCategoryChange(
                            e.target.value
                          )
                        }
                        className={inputClass}
                        required
                      >
                        <option value="">
                          Select category
                        </option>

                        {topLevelCategories.map(
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
                        onChange={(e) =>
                          handleSubcategoryChange(
                            e.target.value
                          )
                        }
                        disabled={
                          !categoryId ||
                          subcategories.length === 0
                        }
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

                    <Field label="Product" required>
                      <select
                        value={productId}
                        onChange={(e) =>
                          setProductId(e.target.value)
                        }
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

                        {filteredProducts.map(
                          (product) => (
                            <option
                              key={product.id}
                              value={product.id}
                            >
                              {product.name}
                            </option>
                          )
                        )}
                      </select>
                    </Field>

                    {productVariants.length > 0 ? (
                      <Field label="Variant">
                        <select
                          value={variantId}
                          onChange={(e) =>
                            setVariantId(
                              e.target.value
                            )
                          }
                          className={inputClass}
                        >
                          <option value="">
                            No variant
                          </option>

                          {productVariants.map(
                            (variant) => (
                              <option
                                key={variant.id}
                                value={variant.id}
                              >
                                {variant.name}
                                {variant.variant_value
                                  ? ` • ${variant.variant_value}`
                                  : ""}
                              </option>
                            )
                          )}
                        </select>
                      </Field>
                    ) : null}

                    <Field label="Quantity" required>
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={quantity}
                        onChange={(e) =>
                          setQuantity(e.target.value)
                        }
                        className={inputClass}
                        required
                      />
                    </Field>
                  </div>
                </Section>

                <Section
                  title="Pricing"
                  description="Selling price is filled automatically and can be adjusted."
                  icon={
                    <CreditCard className="h-4 w-4" />
                  }
                >
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Field
                      label="Selling Price"
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
                          value={sellingPrice}
                          onChange={(e) =>
                            setSellingPrice(
                              e.target.value
                            )
                          }
                          placeholder="0.00"
                          className={`${inputClass} pl-8`}
                          required
                        />
                      </div>
                    </Field>

                    <div className="rounded-2xl border bg-muted/40 p-4">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Sale Total
                      </p>

                      <p className="mt-1 text-2xl font-bold tracking-tight">
                        {currency.format(saleTotal)}
                      </p>
                    </div>
                  </div>
                </Section>

                <Section
                  title="Payment"
                  description="Choose how the money was received."
                  icon={
                    <WalletCards className="h-4 w-4" />
                  }
                >
                  <Field
                    label="Payment Method"
                    required
                  >
                    <select
                      value={paymentMethod}
                      onChange={(e) =>
                        setPaymentMethod(
                          e.target.value
                        )
                      }
                      className={inputClass}
                      required
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
                </Section>

                <div className="flex flex-col-reverse gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    className="h-11 rounded-xl sm:min-w-28"
                    onClick={() => {
                      handleOpenChange(false);
                    }}
                    disabled={saving}
                  >
                    Cancel
                  </Button>

                  <Button
                    type="submit"
                    className="h-11 rounded-xl px-6 shadow-sm sm:min-w-40"
                    disabled={
                      saving ||
                      loadingData ||
                      loadingSale
                    }
                  >
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {isEditMode
                          ? "Updating..."
                          : "Saving..."}
                      </>
                    ) : (
                      <>
                        {isEditMode
                          ? "Update Sale"
                          : "Save Sale"}
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