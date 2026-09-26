"use client";

import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";

import { createClient } from "@/lib/supabase/client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type Variant = {
  id: string;
  product_id: string;
  name: string;
  sku: string | null;
  variant_value: string | null;
  cost_price: number | null;
  stock_quantity: number;
  active: boolean;
};

type Product = {
  id: string;
  name: string;
  sku: string | null;
  cost_price: number;
  stock_quantity: number;
  variants: Variant[];
};

export type PurchaseItem = {
  id: string;
  purchase_id: string;
  product_id: string;
  variant_id: string | null;
  quantity: number;
  unit_cost: number;
  discount: number;
  line_total: number;
  created_at: string;

  product_name: string;
  product_sku: string | null;
  variant_name: string | null;
  variant_sku: string | null;
};

export type Purchase = {
  id: string;
  supplier_name: string | null;
  invoice_number: string | null;
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  shipping_amount: number;
  total_amount: number;
  payment_method: string;
  status: string;
  purchased_at: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

type PurchaseWithItems = Purchase & {
  items: PurchaseItem[];
};

type PurchaseDialogProps = {
  showTrigger?: boolean;
  editPurchase?: PurchaseWithItems | null;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSaved?: () => void;
};

type DraftItem = {
  key: string;
  productId: string;
  variantId: string;
  quantity: string;
  unitCost: string;
  discount: string;
};

type StockChange = {
  productId: string;
  variantId: string | null;
  delta: number;
};

const PAYMENT_METHODS = [
  ["CASH", "Cash"],
  ["UPI", "UPI"],
  ["CARD", "Card"],
  ["BANK_TRANSFER", "Bank Transfer"],
  ["OTHER", "Other"],
] as const;

const STATUS_OPTIONS = [
  ["RECEIVED", "Received"],
  ["PENDING", "Pending"],
  ["CANCELLED", "Cancelled"],
] as const;

const today = () =>
  new Date().toISOString().slice(0, 10);

function createItemKey() {
  return `purchase-item-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}`;
}

function newItem(): DraftItem {
  return {
    key: createItemKey(),
    productId: "",
    variantId: "",
    quantity: "1",
    unitCost: "",
    discount: "0",
  };
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
    <div className="min-w-0 space-y-1.5">
      <Label className="block text-sm font-medium text-foreground">
        {label}
        {required ? (
          <span className="ml-1 text-destructive">
            *
          </span>
        ) : null}
      </Label>

      {children}
    </div>
  );
}

const inputClass =
  "h-10 w-full min-w-0 rounded-lg border border-input bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10";

/*
 * --------------------------------------------------
 * STOCK HELPERS
 * --------------------------------------------------
 */

/**
 * Only purchases that have actually been received
 * should affect inventory.
 *
 * COMPLETED is also accepted because some of the
 * historical purchase records may use that status.
 */
function purchaseAffectsStock(
  purchaseStatus: string | null | undefined
) {
  const normalized = String(
    purchaseStatus ?? ""
  ).toUpperCase();

  return (
    normalized === "RECEIVED" ||
    normalized === "COMPLETED"
  );
}

function stockKey(
  productId: string,
  variantId: string | null
) {
  return variantId
    ? `variant:${variantId}`
    : `product:${productId}`;
}

export function PurchaseDialog({
  showTrigger = false,
  editPurchase = null,
  open: controlledOpen,
  onOpenChange,
  onSaved,
}: PurchaseDialogProps) {
  const supabase = useMemo(
    () => createClient(),
    []
  );

  const isEditMode = Boolean(editPurchase);
  const isControlled =
    controlledOpen !== undefined;

  const [internalOpen, setInternalOpen] =
    useState(false);

  const open =
    controlledOpen ?? internalOpen;

  const [saving, setSaving] =
    useState(false);

  const [loadingProducts, setLoadingProducts] =
    useState(false);

  const [loadingInvoice, setLoadingInvoice] =
    useState(false);

  const [error, setError] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [supplierName, setSupplierName] =
    useState("");

  const [invoiceNumber, setInvoiceNumber] =
    useState("");

  const [purchaseDate, setPurchaseDate] =
    useState(today());

  const [paymentMethod, setPaymentMethod] =
    useState("CASH");

  const [status, setStatus] =
    useState("RECEIVED");

  const [taxAmount, setTaxAmount] =
    useState("0");

  const [shippingAmount, setShippingAmount] =
    useState("0");

  const [items, setItems] = useState<
    DraftItem[]
  >([newItem()]);

  const [products, setProducts] =
    useState<Product[]>([]);

  /*
   * --------------------------------------------------
   * LOAD PRODUCTS
   * --------------------------------------------------
   */

  useEffect(() => {
    if (!open) return;

    let cancelled = false;

    async function loadProducts() {
      setLoadingProducts(true);
      setError("");

      const {
        data,
        error: queryError,
      } = await supabase
        .from("products")
        .select(`
          id,
          name,
          sku,
          cost_price,
          stock_quantity,
          product_variants (
            id,
            product_id,
            name,
            sku,
            variant_value,
            cost_price,
            stock_quantity,
            active
          )
        `)
        .order("name");

      if (cancelled) return;

      if (queryError) {
        console.error(
          "Product load error:",
          queryError
        );

        setProducts([]);

        setError(
          `Unable to load products: ${queryError.message}`
        );
      } else {
        const formatted: Product[] =
          (data ?? []).map(
            (product: any) => ({
              id: product.id,
              name: product.name,
              sku: product.sku,
              cost_price: Number(
                product.cost_price ?? 0
              ),
              stock_quantity: Number(
                product.stock_quantity ?? 0
              ),
              variants: (
                product.product_variants ??
                []
              )
                .filter(
                  (variant: any) =>
                    variant.active
                )
                .map(
                  (variant: any) => ({
                    id: variant.id,
                    product_id:
                      variant.product_id,
                    name: variant.name,
                    sku: variant.sku,
                    variant_value:
                      variant.variant_value,
                    cost_price:
                      variant.cost_price ===
                      null
                        ? null
                        : Number(
                            variant.cost_price
                          ),
                    stock_quantity:
                      Number(
                        variant.stock_quantity ??
                          0
                      ),
                    active: Boolean(
                      variant.active
                    ),
                  })
                ),
            })
          );

        setProducts(formatted);
      }

      setLoadingProducts(false);
    }

    loadProducts();

    return () => {
      cancelled = true;
    };
  }, [open, supabase]);

  /*
   * --------------------------------------------------
   * LOAD EDIT DATA
   * --------------------------------------------------
   */

  useEffect(() => {
    if (!open) return;

    if (editPurchase) {
      setSupplierName(
        editPurchase.supplier_name ?? ""
      );

      setInvoiceNumber(
        editPurchase.invoice_number ?? ""
      );

      setPurchaseDate(
        new Date(
          editPurchase.purchased_at
        )
          .toISOString()
          .slice(0, 10)
      );

      setPaymentMethod(
        editPurchase.payment_method ||
          "CASH"
      );

      setStatus(
        editPurchase.status ||
          "RECEIVED"
      );

      setTaxAmount(
        String(
          editPurchase.tax_amount ?? 0
        )
      );

      setShippingAmount(
        String(
          editPurchase.shipping_amount ??
            0
        )
      );

      setItems(
        editPurchase.items.length > 0
          ? editPurchase.items.map(
              (item) => ({
                key: createItemKey(),
                productId:
                  item.product_id,
                variantId:
                  item.variant_id ?? "",
                quantity:
                  String(item.quantity),
                unitCost:
                  String(item.unit_cost),
                discount:
                  String(
                    item.discount ?? 0
                  ),
              })
            )
          : [newItem()]
      );

      setError("");
      setMessage("");
    } else {
      resetForm(false);
    }
  }, [open, editPurchase]);

  /*
   * --------------------------------------------------
   * GENERATE NEXT TRANSACTION NUMBER
   * --------------------------------------------------
   */

  useEffect(() => {
    if (!open || isEditMode) return;

    let cancelled = false;

    async function generateNextInvoiceNumber() {
      setLoadingInvoice(true);

      try {
        const [
          salesResult,
          purchasesResult,
          expensesResult,
        ] = await Promise.all([
          supabase
            .from("sales")
            .select(
              "invoice_number"
            ),

          supabase
            .from("purchases")
            .select(
              "invoice_number"
            ),

          supabase
            .from("expenses")
            .select(
              "expense_number"
            ),
        ]);

        if (cancelled) return;

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

        for (const row of
          salesResult.data ?? []) {
          const match = String(
            row.invoice_number ?? ""
          ).match(/^TXN-(\d+)$/);

          if (match) {
            numbers.push(
              Number(match[1])
            );
          }
        }

        for (const row of
          purchasesResult.data ?? []) {
          const match = String(
            row.invoice_number ?? ""
          ).match(/^TXN-(\d+)$/);

          if (match) {
            numbers.push(
              Number(match[1])
            );
          }
        }

        for (const row of
          expensesResult.data ?? []) {
          const match = String(
            row.expense_number ?? ""
          ).match(/^TXN-(\d+)$/);

          if (match) {
            numbers.push(
              Number(match[1])
            );
          }
        }

        const highestNumber =
          numbers.length > 0
            ? Math.max(...numbers)
            : 0;

        setInvoiceNumber(
          `TXN-${String(
            highestNumber + 1
          ).padStart(3, "0")}`
        );
      } catch (err) {
        console.error(
          "Invoice number generation error:",
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : "Unable to generate invoice number."
        );
      } finally {
        if (!cancelled) {
          setLoadingInvoice(false);
        }
      }
    }

    generateNextInvoiceNumber();

    return () => {
      cancelled = true;
    };
  }, [
    open,
    isEditMode,
    supabase,
  ]);

  /*
   * --------------------------------------------------
   * CALCULATIONS
   * --------------------------------------------------
   */

  const subtotal = useMemo(() => {
    return items.reduce(
      (sum, item) => {
        const quantity =
          Number(item.quantity) || 0;

        const unitCost =
          Number(item.unitCost) || 0;

        return (
          sum +
          Math.max(
            0,
            quantity * unitCost
          )
        );
      },
      0
    );
  }, [items]);

  const itemDiscount = useMemo(() => {
    return items.reduce(
      (sum, item) => {
        return (
          sum +
          Math.max(
            0,
            Number(item.discount) || 0
          )
        );
      },
      0
    );
  }, [items]);

  const tax = Math.max(
    0,
    Number(taxAmount) || 0
  );

  const shipping = Math.max(
    0,
    Number(shippingAmount) || 0
  );

  const total = Math.max(
    0,
    subtotal -
      itemDiscount +
      tax +
      shipping
  );

  /*
   * --------------------------------------------------
   * RESET
   * --------------------------------------------------
   */

  function resetForm(
    generateNumber = true
  ) {
    setSupplierName("");

    if (generateNumber) {
      setInvoiceNumber("");
    }

    setPurchaseDate(today());
    setPaymentMethod("CASH");
    setStatus("RECEIVED");
    setTaxAmount("0");
    setShippingAmount("0");
    setItems([newItem()]);
    setError("");
    setMessage("");
  }

  /*
   * --------------------------------------------------
   * OPEN / CLOSE
   * --------------------------------------------------
   */

  function handleOpenChange(
    value: boolean
  ) {
    if (!isControlled) {
      setInternalOpen(value);
    }

    onOpenChange?.(value);

    if (!value) {
      setError("");
      setMessage("");
    }
  }

  /*
   * --------------------------------------------------
   * ITEM HELPERS
   * --------------------------------------------------
   */

  function updateItem(
    key: string,
    patch: Partial<DraftItem>
  ) {
    setItems((current) =>
      current.map((item) =>
        item.key === key
          ? {
              ...item,
              ...patch,
            }
          : item
      )
    );
  }

  function selectProduct(
    item: DraftItem,
    productId: string
  ) {
    const product =
      products.find(
        (p) => p.id === productId
      );

    const defaultCost =
      product?.cost_price ?? 0;

    updateItem(item.key, {
      productId,
      variantId: "",
      unitCost:
        defaultCost > 0
          ? String(defaultCost)
          : "",
    });
  }

  function selectVariant(
    item: DraftItem,
    variantId: string
  ) {
    const product =
      products.find(
        (p) =>
          p.id === item.productId
      );

    const variant =
      product?.variants.find(
        (v) =>
          v.id === variantId
      );

    const variantCost =
      variant?.cost_price ??
      product?.cost_price ??
      0;

    updateItem(item.key, {
      variantId,
      unitCost:
        variantCost > 0
          ? String(variantCost)
          : item.unitCost,
    });
  }

  function addItem() {
    setItems((current) => [
      ...current,
      newItem(),
    ]);
  }

  function removeItem(key: string) {
    setItems((current) => {
      if (current.length === 1) {
        return current;
      }

      return current.filter(
        (item) =>
          item.key !== key
      );
    });
  }

  /*
   * --------------------------------------------------
   * STOCK
   * --------------------------------------------------
   */

  async function getCurrentStock(
    productId: string,
    variantId: string | null
  ) {
    if (variantId) {
      const {
        data,
        error,
      } = await supabase
        .from("product_variants")
        .select(
          "id,stock_quantity"
        )
        .eq("id", variantId)
        .eq(
          "product_id",
          productId
        )
        .single();

      if (error) {
        throw error;
      }

      return Number(
        data.stock_quantity ?? 0
      );
    }

    const {
      data,
      error,
    } = await supabase
      .from("products")
      .select(
        "id,stock_quantity"
      )
      .eq("id", productId)
      .single();

    if (error) {
      throw error;
    }

    return Number(
      data.stock_quantity ?? 0
    );
  }

  async function adjustStock(
    productId: string,
    variantId: string | null,
    delta: number
  ) {
    if (delta === 0) {
      return;
    }

    if (variantId) {
      const {
        data: variant,
        error: variantError,
      } = await supabase
        .from("product_variants")
        .select(
          "id,stock_quantity"
        )
        .eq("id", variantId)
        .eq(
          "product_id",
          productId
        )
        .single();

      if (variantError) {
        throw variantError;
      }

      const currentStock =
        Number(
          variant.stock_quantity ??
            0
        );

      const newStock =
        currentStock + delta;

      if (newStock < 0) {
        throw new Error(
          "Stock cannot become negative."
        );
      }

      const {
        error,
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
          variantId
        );

      if (error) {
        throw error;
      }

      return;
    }

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
        productId
      )
      .single();

    if (productError) {
      throw productError;
    }

    const currentStock =
      Number(
        product.stock_quantity ??
          0
      );

    const newStock =
      currentStock + delta;

    if (newStock < 0) {
      throw new Error(
        "Stock cannot become negative."
      );
    }

    const {
      error,
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
        productId
      );

    if (error) {
      throw error;
    }
  }

  /*
   * --------------------------------------------------
   * BUILD STOCK CHANGES
   * --------------------------------------------------
   *
   * Instead of:
   *
   *   subtract old quantity
   *   add new quantity
   *
   * we calculate the NET difference.
   *
   * Example:
   *
   * Old purchase = 10
   * New purchase = 8
   *
   * Stock change = -2
   *
   * This is important when some of the purchased
   * stock has already been sold.
   * --------------------------------------------------
   */

  function buildStockChanges(
    oldItems: PurchaseItem[],
    newItems: {
      product_id: string;
      variant_id: string | null;
      quantity: number;
    }[],
    oldStatus: string,
    newStatus: string
  ): StockChange[] {
    const changes = new Map<
      string,
      StockChange
    >();

    const oldAffectsStock =
      purchaseAffectsStock(
        oldStatus
      );

    const newAffectsStock =
      purchaseAffectsStock(
        newStatus
      );

    if (oldAffectsStock) {
      for (const item of oldItems) {
        const quantity =
          Number(item.quantity);

        if (
          !Number.isFinite(
            quantity
          ) ||
          quantity <= 0
        ) {
          continue;
        }

        const key = stockKey(
          item.product_id,
          item.variant_id
        );

        const existing =
          changes.get(key);

        if (existing) {
          existing.delta -=
            quantity;
        } else {
          changes.set(key, {
            productId:
              item.product_id,
            variantId:
              item.variant_id,
            delta:
              -quantity,
          });
        }
      }
    }

    if (newAffectsStock) {
      for (const item of newItems) {
        const quantity =
          Number(item.quantity);

        if (
          !Number.isFinite(
            quantity
          ) ||
          quantity <= 0
        ) {
          continue;
        }

        const key = stockKey(
          item.product_id,
          item.variant_id
        );

        const existing =
          changes.get(key);

        if (existing) {
          existing.delta +=
            quantity;
        } else {
          changes.set(key, {
            productId:
              item.product_id,
            variantId:
              item.variant_id,
            delta:
              quantity,
          });
        }
      }
    }

    return Array.from(
      changes.values()
    ).filter(
      (change) =>
        change.delta !== 0
    );
  }

  /*
   * --------------------------------------------------
   * VALIDATE STOCK CHANGES
   * --------------------------------------------------
   */

  async function validateStockChanges(
    changes: StockChange[]
  ) {
    for (const change of changes) {
      if (change.delta >= 0) {
        continue;
      }

      const currentStock =
        await getCurrentStock(
          change.productId,
          change.variantId
        );

      const newStock =
        currentStock +
        change.delta;

      if (newStock < 0) {
        const product =
          products.find(
            (item) =>
              item.id ===
              change.productId
          );

        const variant =
          product?.variants.find(
            (item) =>
              item.id ===
              change.variantId
          );

        const name =
          variant
            ? `${product?.name ?? "Product"} · ${variant.name}`
            : product?.name ??
              "Product";

        throw new Error(
          `Insufficient stock for "${name}". Current stock: ${currentStock}. Required reduction: ${Math.abs(
            change.delta
          )}.`
        );
      }
    }
  }

  /*
   * --------------------------------------------------
   * APPLY STOCK CHANGES
   * --------------------------------------------------
   */

  async function applyStockChanges(
    changes: StockChange[]
  ) {
    for (const change of changes) {
      await adjustStock(
        change.productId,
        change.variantId,
        change.delta
      );
    }
  }

  /*
   * --------------------------------------------------
   * BUILD ITEM PAYLOAD
   * --------------------------------------------------
   */

  function buildItemPayload() {
    return items.map((item) => {
      const quantity =
        Number(item.quantity);

      const unitCost =
        Number(item.unitCost);

      const discount =
        Number(item.discount) || 0;

      if (!item.productId) {
        throw new Error(
          "Please select a product for every purchase item."
        );
      }

      if (
        !Number.isFinite(
          quantity
        ) ||
        quantity <= 0
      ) {
        throw new Error(
          "Quantity must be greater than zero."
        );
      }

      if (
        !Number.isFinite(
          unitCost
        ) ||
        unitCost < 0
      ) {
        throw new Error(
          "Unit cost cannot be negative."
        );
      }

      if (
        !Number.isFinite(
          discount
        ) ||
        discount < 0
      ) {
        throw new Error(
          "Discount cannot be negative."
        );
      }

      const gross =
        quantity * unitCost;

      if (discount > gross) {
        throw new Error(
          "Item discount cannot be greater than the item amount."
        );
      }

      return {
        product_id:
          item.productId,
        variant_id:
          item.variantId || null,
        quantity,
        unit_cost:
          unitCost,
        discount,
        line_total:
          gross - discount,
      };
    });
  }

  /*
   * --------------------------------------------------
   * SAVE
   * --------------------------------------------------
   */

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (saving) return;

    setSaving(true);
    setError("");
    setMessage("");

    try {
      if (!invoiceNumber.trim()) {
        throw new Error(
          "Invoice number is required."
        );
      }

      if (!purchaseDate) {
        throw new Error(
          "Purchase date is required."
        );
      }

      const itemPayload =
        buildItemPayload();

      if (
        itemPayload.length === 0
      ) {
        throw new Error(
          "Add at least one purchase item."
        );
      }

      /*
       * --------------------------------------------------
       * EDIT
       * --------------------------------------------------
       */

      if (
        isEditMode &&
        editPurchase
      ) {
        /*
         * Calculate only the NET inventory
         * difference between old and new.
         */
        const stockChanges =
          buildStockChanges(
            editPurchase.items,
            itemPayload,
            editPurchase.status,
            status
          );

        /*
         * Validate all negative changes before
         * modifying the database.
         */
        await validateStockChanges(
          stockChanges
        );

        /*
         * Save the purchase header.
         */

        const {
          error:
            purchaseError,
        } = await supabase
          .from("purchases")
          .update({
            supplier_name:
              supplierName.trim() ||
              null,

            invoice_number:
              invoiceNumber.trim(),

            subtotal,

            discount_amount:
              itemDiscount,

            tax_amount:
              tax,

            shipping_amount:
              shipping,

            total_amount:
              total,

            payment_method:
              paymentMethod,

            status,

            purchased_at:
              new Date(
                `${purchaseDate}T12:00:00`
              ).toISOString(),

            updated_at:
              new Date().toISOString(),
          })
          .eq(
            "id",
            editPurchase.id
          );

        if (purchaseError) {
          throw purchaseError;
        }

        /*
         * Delete existing items.
         *
         * The database FK now uses ON DELETE CASCADE,
         * but deleting items explicitly here keeps
         * this edit flow independent of that behaviour.
         */

        const {
          error:
            deleteItemsError,
        } = await supabase
          .from("purchase_items")
          .delete()
          .eq(
            "purchase_id",
            editPurchase.id
          );

        if (deleteItemsError) {
          throw deleteItemsError;
        }

        /*
         * Insert updated items.
         */

        const rows =
          itemPayload.map(
            (item) => ({
              purchase_id:
                editPurchase.id,
              ...item,
            })
          );

        const {
          error:
            insertItemsError,
        } = await supabase
          .from("purchase_items")
          .insert(rows);

        if (insertItemsError) {
          throw insertItemsError;
        }

        /*
         * Apply NET stock difference.
         */
        try {
          await applyStockChanges(
            stockChanges
          );
        } catch (stockError) {
          /*
           * Best-effort rollback of the stock changes
           * that may already have been applied.
           */
          try {
            const rollbackChanges =
              stockChanges.map(
                (change) => ({
                  ...change,
                  delta:
                    -change.delta,
                })
              );

            await applyStockChanges(
              rollbackChanges
            );
          } catch (rollbackError) {
            console.error(
              "Purchase stock rollback error:",
              rollbackError
            );
          }

          throw stockError;
        }

        setMessage(
          `${invoiceNumber} updated successfully.`
        );
      }

      /*
       * --------------------------------------------------
       * CREATE
       * --------------------------------------------------
       */

      else {
        /*
         * Only RECEIVED purchases add stock.
         */
        const shouldUpdateStock =
          purchaseAffectsStock(
            status
          );

        /*
         * Aggregate new stock changes.
         */
        const stockChanges =
          shouldUpdateStock
            ? buildStockChanges(
                [],
                itemPayload,
                "PENDING",
                status
              )
            : [];

        /*
         * Create purchase header.
         */

        const {
          data: purchase,
          error:
            purchaseError,
        } = await supabase
          .from("purchases")
          .insert({
            supplier_name:
              supplierName.trim() ||
              null,

            invoice_number:
              invoiceNumber.trim(),

            subtotal,

            discount_amount:
              itemDiscount,

            tax_amount:
              tax,

            shipping_amount:
              shipping,

            total_amount:
              total,

            payment_method:
              paymentMethod,

            status,

            purchased_at:
              new Date(
                `${purchaseDate}T12:00:00`
              ).toISOString(),
          })
          .select("id")
          .single();

        if (purchaseError) {
          throw purchaseError;
        }

        if (!purchase) {
          throw new Error(
            "Purchase was saved but no purchase ID was returned."
          );
        }

        /*
         * Insert purchase items.
         */

        const rows =
          itemPayload.map(
            (item) => ({
              purchase_id:
                purchase.id,
              ...item,
            })
          );

        const {
          error: itemError,
        } = await supabase
          .from("purchase_items")
          .insert(rows);

        if (itemError) {
          await supabase
            .from(
              "purchase_items"
            )
            .delete()
            .eq(
              "purchase_id",
              purchase.id
            );

          await supabase
            .from("purchases")
            .delete()
            .eq(
              "id",
              purchase.id
            );

          throw itemError;
        }

        /*
         * Update inventory only when RECEIVED.
         */

        try {
          await validateStockChanges(
            stockChanges
          );

          await applyStockChanges(
            stockChanges
          );
        } catch (stockError) {
          /*
           * Purchase was created, but stock could not
           * be updated. Remove the purchase so we do
           * not leave an inconsistent purchase record.
           */
          await supabase
            .from(
              "purchase_items"
            )
            .delete()
            .eq(
              "purchase_id",
              purchase.id
            );

          await supabase
            .from("purchases")
            .delete()
            .eq(
              "id",
              purchase.id
            );

          throw stockError;
        }

        setMessage(
          `${invoiceNumber} saved successfully.`
        );
      }

      onSaved?.();

      setTimeout(() => {
        handleOpenChange(false);
      }, 500);
    } catch (err) {
      console.error(
        "Purchase save error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to save purchase."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={handleOpenChange}
    >
      {showTrigger ? (
        <DialogTrigger>
          <Button className="gap-2 bg-brand-navy text-white hover:bg-brand-navy/90">
            <Plus className="h-4 w-4" />
            Add Purchase
          </Button>
        </DialogTrigger>
      ) : null}

      <DialogContent
        className="
          !w-[calc(100vw-1rem)]
          !max-w-5xl
          max-h-[95vh]
          overflow-x-hidden
          overflow-y-auto
          bg-white
          p-0
          sm:!w-[calc(100vw-2rem)]
        "
      >
        <DialogHeader className="border-b px-4 py-4 sm:px-6">
          <DialogTitle className="text-lg font-semibold">
            {isEditMode
              ? "Edit Purchase"
              : "Add Purchase"}
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="min-w-0 space-y-6 px-4 pb-6 sm:px-6"
        >
          {error ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          ) : null}

          {message ? (
            <div className="rounded-xl border border-green-500/30 bg-green-500/5 px-4 py-3 text-sm text-green-700">
              {message}
            </div>
          ) : null}

          {/* HEADER */}

          <div className="flex flex-col gap-4 lg:grid lg:grid-cols-12">
            <div className="min-w-0 lg:col-span-3">
              <Field
                label="Invoice Number"
                required
              >
                <Input
                  value={invoiceNumber}
                  onChange={(event) =>
                    setInvoiceNumber(
                      event.target.value
                    )
                  }
                  disabled={
                    loadingInvoice ||
                    saving ||
                    isEditMode
                  }
                  className={inputClass}
                  placeholder="TXN-129"
                />
              </Field>
            </div>

            <div className="min-w-0 lg:col-span-3">
              <Field
                label="Purchase Date"
                required
              >
                <Input
                  type="date"
                  value={purchaseDate}
                  onChange={(event) =>
                    setPurchaseDate(
                      event.target.value
                    )
                  }
                  disabled={saving}
                  className={inputClass}
                />
              </Field>
            </div>

            <div className="min-w-0 lg:col-span-3">
              <Field label="Supplier">
                <Input
                  value={supplierName}
                  onChange={(event) =>
                    setSupplierName(
                      event.target.value
                    )
                  }
                  disabled={saving}
                  className={inputClass}
                  placeholder="Supplier name"
                />
              </Field>
            </div>

            <div className="min-w-0 lg:col-span-3">
              <Field
                label="Payment Method"
                required
              >
                <select
                  value={paymentMethod}
                  onChange={(event) =>
                    setPaymentMethod(
                      event.target.value
                    )
                  }
                  disabled={saving}
                  className={inputClass}
                >
                  {PAYMENT_METHODS.map(
                    ([
                      value,
                      label,
                    ]) => (
                      <option
                        key={value}
                        value={value}
                      >
                        {label}
                      </option>
                    )
                  )}
                </select>
              </Field>
            </div>
          </div>

          <div className="max-w-full sm:max-w-xs">
            <Field
              label="Status"
              required
            >
              <select
                value={status}
                onChange={(event) =>
                  setStatus(
                    event.target.value
                  )
                }
                disabled={saving}
                className={inputClass}
              >
                {STATUS_OPTIONS.map(
                  ([
                    value,
                    label,
                  ]) => (
                    <option
                      key={value}
                      value={value}
                    >
                      {label}
                    </option>
                  )
                )}
              </select>
            </Field>
          </div>

          {/* PURCHASE ITEMS */}

          <div className="min-w-0 overflow-hidden rounded-2xl border border-border">
            <div className="flex flex-col gap-3 border-b px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <h3 className="font-semibold">
                  Purchase Items
                </h3>

                <p className="text-xs text-muted-foreground">
                  Add the products and quantities
                  received from the supplier.
                </p>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addItem}
                disabled={
                  saving ||
                  loadingProducts
                }
                className="w-full gap-2 sm:w-auto"
              >
                <Plus className="h-4 w-4" />
                Add Item
              </Button>
            </div>

            <div className="min-w-0 space-y-4 p-4">
              {loadingProducts ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin" />
                </div>
              ) : null}

              {items.map(
                (
                  item,
                  index
                ) => {
                  const product =
                    products.find(
                      (p) =>
                        p.id ===
                        item.productId
                    );

                  const variants =
                    product?.variants ??
                    [];

                  const lineTotal =
                    Math.max(
                      0,
                      (Number(
                        item.quantity
                      ) || 0) *
                        (Number(
                          item.unitCost
                        ) || 0) -
                        (Number(
                          item.discount
                        ) || 0)
                    );

                  return (
                    <div
                      key={
                        item.key
                      }
                      className="min-w-0 overflow-hidden rounded-xl border bg-muted/10 p-3 sm:p-4"
                    >
                      <div className="mb-4 flex items-center justify-between">
                        <span className="text-sm font-semibold">
                          Item{" "}
                          {index +
                            1}
                        </span>

                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            removeItem(
                              item.key
                            )
                          }
                          disabled={
                            saving ||
                            items.length ===
                              1
                          }
                          title="Remove item"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>

                      <div className="flex min-w-0 flex-col gap-4 lg:grid lg:grid-cols-12">
                        <div className="min-w-0 lg:col-span-4">
                          <Field
                            label="Product"
                            required
                          >
                            <select
                              value={
                                item.productId
                              }
                              onChange={(
                                event
                              ) =>
                                selectProduct(
                                  item,
                                  event
                                    .target
                                    .value
                                )
                              }
                              disabled={
                                saving
                              }
                              className={
                                inputClass
                              }
                            >
                              <option value="">
                                Select product
                              </option>

                              {products.map(
                                (
                                  product
                                ) => (
                                  <option
                                    key={
                                      product.id
                                    }
                                    value={
                                      product.id
                                    }
                                  >
                                    {
                                      product.name
                                    }
                                    {product.sku
                                      ? ` (${product.sku})`
                                      : ""}
                                  </option>
                                )
                              )}
                            </select>
                          </Field>
                        </div>

                        <div className="min-w-0 lg:col-span-3">
                          <Field label="Variant">
                            <select
                              value={
                                item.variantId
                              }
                              onChange={(
                                event
                              ) =>
                                selectVariant(
                                  item,
                                  event
                                    .target
                                    .value
                                )
                              }
                              disabled={
                                saving ||
                                !item.productId ||
                                variants.length ===
                                  0
                              }
                              className={
                                inputClass
                              }
                            >
                              <option value="">
                                {variants.length >
                                0
                                  ? "No variant"
                                  : "No variants"}
                              </option>

                              {variants.map(
                                (
                                  variant
                                ) => (
                                  <option
                                    key={
                                      variant.id
                                    }
                                    value={
                                      variant.id
                                    }
                                  >
                                    {
                                      variant.name
                                    }
                                    {variant.variant_value
                                      ? ` - ${variant.variant_value}`
                                      : ""}
                                  </option>
                                )
                              )}
                            </select>
                          </Field>
                        </div>

                        <div className="min-w-0 lg:col-span-2">
                          <Field
                            label="Quantity"
                            required
                          >
                            <Input
                              type="number"
                              min="0.01"
                              step="0.01"
                              value={
                                item.quantity
                              }
                              onChange={(
                                event
                              ) =>
                                updateItem(
                                  item.key,
                                  {
                                    quantity:
                                      event
                                        .target
                                        .value,
                                  }
                                )
                              }
                              disabled={
                                saving
                              }
                              className={
                                inputClass
                              }
                            />
                          </Field>
                        </div>

                        <div className="min-w-0 lg:col-span-2">
                          <Field
                            label="Unit Cost"
                            required
                          >
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={
                                item.unitCost
                              }
                              onChange={(
                                event
                              ) =>
                                updateItem(
                                  item.key,
                                  {
                                    unitCost:
                                      event
                                        .target
                                        .value,
                                  }
                                )
                              }
                              disabled={
                                saving
                              }
                              className={
                                inputClass
                              }
                              placeholder="0.00"
                            />
                          </Field>
                        </div>

                        <div className="min-w-0 lg:col-span-1">
                          <Field label="Discount">
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={
                                item.discount
                              }
                              onChange={(
                                event
                              ) =>
                                updateItem(
                                  item.key,
                                  {
                                    discount:
                                      event
                                        .target
                                        .value,
                                  }
                                )
                              }
                              disabled={
                                saving
                              }
                              className={
                                inputClass
                              }
                            />
                          </Field>
                        </div>
                      </div>

                      <div className="mt-4 flex justify-end border-t pt-3">
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">
                            Line Total
                          </p>

                          <p className="font-semibold">
                            ₹
                            {lineTotal.toLocaleString(
                              "en-IN",
                              {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              }
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          </div>

          {/* TOTALS */}

          <div className="ml-auto w-full max-w-md rounded-2xl border bg-muted/20 p-4">
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">
                  Subtotal
                </span>

                <span className="font-medium">
                  ₹
                  {subtotal.toLocaleString(
                    "en-IN",
                    {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }
                  )}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">
                  Item Discount
                </span>

                <span className="font-medium">
                  ₹
                  {itemDiscount.toLocaleString(
                    "en-IN",
                    {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }
                  )}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">
                  Tax
                </span>

                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={taxAmount}
                  onChange={(event) =>
                    setTaxAmount(
                      event.target.value
                    )
                  }
                  disabled={saving}
                  className="h-9 w-28 text-right"
                />
              </div>

              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">
                  Shipping
                </span>

                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={
                    shippingAmount
                  }
                  onChange={(event) =>
                    setShippingAmount(
                      event.target.value
                    )
                  }
                  disabled={saving}
                  className="h-9 w-28 text-right"
                />
              </div>

              <div className="border-t pt-3">
                <div className="flex items-center justify-between text-base font-bold">
                  <span>Total</span>

                  <span>
                    ₹
                    {total.toLocaleString(
                      "en-IN",
                      {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ACTIONS */}

          <div className="flex flex-col-reverse gap-2 border-t pt-4 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                handleOpenChange(
                  false
                )
              }
              disabled={saving}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={
                saving ||
                loadingProducts ||
                loadingInvoice
              }
              className="w-full gap-2 bg-brand-navy text-white hover:bg-brand-navy/90 sm:w-auto"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : null}

              {saving
                ? "Saving..."
                : isEditMode
                ? "Update Purchase"
                : "Save Purchase"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}