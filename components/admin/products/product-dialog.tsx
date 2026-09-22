"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Loader2,
  Plus,
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
};

type Product = {
  id: string;
  category_id: string | null;
  sku: string | null;
  name: string;
  short_description: string | null;
  selling_price: number | null;
  cost_price: number | null;
  stock_quantity: number | null;
  online_enabled: boolean | null;
  online_price: number | null;
  visibility:
    | "DRAFT"
    | "PUBLISHED"
    | "ARCHIVED";
  featured: boolean | null;
  created_at: string;
  updated_at: string;
};

type ProductDialogProps = {
  product?: Product | null;
  categories: Category[];

  open?: boolean;
  onOpenChange?: (open: boolean) => void;

  onSaved?: () => void;
};

export function ProductDialog({
  product = null,
  categories,
  open: controlledOpen,
  onOpenChange,
  onSaved,
}: ProductDialogProps) {
  const supabase = useMemo(
    () => createClient(),
    []
  );

  const isEditMode = Boolean(product);

  const isControlled =
    controlledOpen !== undefined;

  const [internalOpen, setInternalOpen] =
    useState(false);

  const open =
    controlledOpen ?? internalOpen;

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  // --------------------------------------------------
  // FORM STATE
  // --------------------------------------------------

  const [name, setName] =
    useState("");

  const [categoryId, setCategoryId] =
    useState("");

  const [parentCategoryId, setParentCategoryId] =
    useState("");

  const [sku, setSku] =
    useState("");

  const [shortDescription, setShortDescription] =
    useState("");

  const [costPrice, setCostPrice] =
    useState("");

  const [sellingPrice, setSellingPrice] =
    useState("");

  const [onlinePrice, setOnlinePrice] =
    useState("");

  const [stockQuantity, setStockQuantity] =
    useState("");

  const [onlineEnabled, setOnlineEnabled] =
    useState(false);

  const [featured, setFeatured] =
    useState(false);

  const [visibility, setVisibility] =
    useState<
      "DRAFT" | "PUBLISHED" | "ARCHIVED"
    >("PUBLISHED");

  // --------------------------------------------------
  // CATEGORIES
  // --------------------------------------------------

  const parentCategories = useMemo(
    () =>
      categories.filter(
        (category) =>
          category.parent_id === null
      ),
    [categories]
  );

  const subcategories = useMemo(
    () => {
      if (!parentCategoryId) {
        return [];
      }

      return categories.filter(
        (category) =>
          category.parent_id ===
          parentCategoryId
      );
    },
    [categories, parentCategoryId]
  );

  // --------------------------------------------------
  // RESET FORM
  // --------------------------------------------------

  function resetForm() {
    setName("");
    setCategoryId("");
    setParentCategoryId("");
    setSku("");
    setShortDescription("");

    setCostPrice("");
    setSellingPrice("");
    setOnlinePrice("");
    setStockQuantity("");

    setOnlineEnabled(false);
    setFeatured(false);
    setVisibility("PUBLISHED");

    setError("");
  }

  // --------------------------------------------------
  // LOAD PRODUCT INTO EDIT FORM
  // --------------------------------------------------

  useEffect(() => {
    if (!open) {
      return;
    }

    setError("");

    if (!product) {
      resetForm();
      return;
    }

    const selectedCategory =
      categories.find(
        (category) =>
          category.id ===
          product.category_id
      );

    let parentId = "";

    if (selectedCategory) {
      parentId =
        selectedCategory.parent_id ??
        selectedCategory.id;
    }

    setName(product.name ?? "");

    setCategoryId(
      product.category_id ?? ""
    );

    setParentCategoryId(parentId);

    setSku(product.sku ?? "");

    setShortDescription(
      product.short_description ?? ""
    );

    setCostPrice(
      product.cost_price !== null &&
        product.cost_price !== undefined
        ? String(product.cost_price)
        : ""
    );

    setSellingPrice(
      product.selling_price !== null &&
        product.selling_price !== undefined
        ? String(product.selling_price)
        : ""
    );

    setOnlinePrice(
      product.online_price !== null &&
        product.online_price !== undefined
        ? String(product.online_price)
        : ""
    );

    setStockQuantity(
      product.stock_quantity !== null &&
        product.stock_quantity !== undefined
        ? String(product.stock_quantity)
        : ""
    );

    setOnlineEnabled(
      Boolean(product.online_enabled)
    );

    setFeatured(
      Boolean(product.featured)
    );

    setVisibility(
      product.visibility ?? "PUBLISHED"
    );
  }, [
    open,
    product,
    categories,
  ]);

  // --------------------------------------------------
  // OPEN / CLOSE
  // --------------------------------------------------

  function handleOpenChange(
    value: boolean
  ) {
    if (!isControlled) {
      setInternalOpen(value);
    }

    onOpenChange?.(value);

    if (!value) {
      resetForm();
    }
  }

  // --------------------------------------------------
  // CATEGORY CHANGE
  // --------------------------------------------------

  function handleParentCategoryChange(
    value: string
  ) {
    setParentCategoryId(value);

    // Reset subcategory when parent changes.
    setCategoryId("");
  }

  // --------------------------------------------------
  // SUBCATEGORY CHANGE
  // --------------------------------------------------

  function handleSubcategoryChange(
    value: string
  ) {
    setCategoryId(value);
  }

  // --------------------------------------------------
  // SAVE / UPDATE
  // --------------------------------------------------

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");

    const trimmedName =
      name.trim();

    if (!trimmedName) {
      setError(
        "Product name is required."
      );
      return;
    }

    if (!parentCategoryId) {
      setError(
        "Please select a category."
      );
      return;
    }

    if (!categoryId) {
      setError(
        "Please select a subcategory."
      );
      return;
    }

    if (
      sellingPrice === "" ||
      Number(sellingPrice) < 0
    ) {
      setError(
        "Please enter a valid selling price."
      );
      return;
    }

    if (
      costPrice !== "" &&
      Number(costPrice) < 0
    ) {
      setError(
        "Cost price cannot be negative."
      );
      return;
    }

    if (
      onlinePrice !== "" &&
      Number(onlinePrice) < 0
    ) {
      setError(
        "Online price cannot be negative."
      );
      return;
    }

    if (
      stockQuantity !== "" &&
      Number(stockQuantity) < 0
    ) {
      setError(
        "Stock quantity cannot be negative."
      );
      return;
    }

    setSaving(true);
const generateSlug = (value: string) => {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
};
    try {
      const payload = {
        name: trimmedName,
         slug: generateSlug(trimmedName),
        category_id:
          categoryId,

        sku:
          sku.trim() || null,

        short_description:
          shortDescription.trim() || null,

        cost_price:
          Number(costPrice || 0),

        selling_price:
          Number(sellingPrice || 0),

        online_price:
          onlinePrice === ""
            ? null
            : Number(onlinePrice),

        stock_quantity:
          Number(stockQuantity || 0),

        online_enabled:
          onlineEnabled,

        featured:
          featured,

        visibility:
          visibility,
      };

      if (isEditMode && product) {
        const {
          error: updateError,
        } = await supabase
          .from("products")
          .update(payload)
          .eq("id", product.id);

        if (updateError) {
          throw updateError;
        }
      } else {
        const {
          error: insertError,
        } = await supabase
          .from("products")
          .insert(payload);

        if (insertError) {
          throw insertError;
        }
      }

      onSaved?.();

      handleOpenChange(false);
    } catch (err) {
      console.error(
        "Product save error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to save product."
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
      {/* ONLY ADD MODE HAS A TRIGGER */}
      {!isEditMode && (
        <Button
          type="button"
          onClick={() => handleOpenChange(true)}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      )}

      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl bg-white">
        <DialogHeader>
          <DialogTitle>
            {isEditMode
              ? "Edit Product"
              : "Add Product"}
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          {/* ----------------------------------------- */}
          {/* BASIC INFORMATION */}
          {/* ----------------------------------------- */}

          <section className="space-y-4">
            <div>
              <h3 className="font-medium">
                Basic Information
              </h3>

              <p className="text-sm text-muted-foreground">
                Enter the basic details of the product.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="product-name">
                Product Name *
              </Label>

              <Input
                id="product-name"
                value={name}
                onChange={(event) =>
                  setName(
                    event.target.value
                  )
                }
                placeholder="e.g. Designer Laddu Gopal Poshak"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {/* CATEGORY */}
              <div className="space-y-2">
                <Label>
                  Category *
                </Label>

                <select
                  value={
                    parentCategoryId
                  }
                  onChange={(event) =>
                    handleParentCategoryChange(
                      event.target.value
                    )
                  }
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">
                    Select Category
                  </option>

                  {parentCategories.map(
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
              </div>

              {/* SUBCATEGORY */}
              <div className="space-y-2">
                <Label>
                  Subcategory *
                </Label>

                <select
                  value={categoryId}
                  onChange={(event) =>
                    handleSubcategoryChange(
                      event.target.value
                    )
                  }
                  disabled={
                    !parentCategoryId
                  }
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">
                    Select Subcategory
                  </option>

                  {subcategories.map(
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
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="product-sku">
                SKU
              </Label>

              <Input
                id="product-sku"
                value={sku}
                onChange={(event) =>
                  setSku(
                    event.target.value
                  )
                }
                placeholder="e.g. LG-POS-001"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="short-description">
                Short Description
              </Label>

              <textarea
                id="short-description"
                value={shortDescription}
                onChange={(event) =>
                  setShortDescription(
                    event.target.value
                  )
                }
                rows={3}
                placeholder="Short product description..."
                className="w-full resize-none rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </section>

          {/* ----------------------------------------- */}
          {/* PRICING */}
          {/* ----------------------------------------- */}

          <section className="space-y-4 border-t pt-5">
            <div>
              <h3 className="font-medium">
                Pricing
              </h3>

              <p className="text-sm text-muted-foreground">
                Set the cost and selling prices.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="cost-price">
                  Cost Price
                </Label>

                <Input
                  id="cost-price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={costPrice}
                  onChange={(event) =>
                    setCostPrice(
                      event.target.value
                    )
                  }
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="selling-price">
                  Selling Price *
                </Label>

                <Input
                  id="selling-price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={sellingPrice}
                  onChange={(event) =>
                    setSellingPrice(
                      event.target.value
                    )
                  }
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="online-price">
                  Online Price
                </Label>

                <Input
                  id="online-price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={onlinePrice}
                  onChange={(event) =>
                    setOnlinePrice(
                      event.target.value
                    )
                  }
                  placeholder="Optional"
                />
              </div>
            </div>
          </section>

          {/* ----------------------------------------- */}
          {/* INVENTORY */}
          {/* ----------------------------------------- */}

          <section className="space-y-4 border-t pt-5">
            <div>
              <h3 className="font-medium">
                Inventory
              </h3>

              <p className="text-sm text-muted-foreground">
                Set the current available stock.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock-quantity">
                Stock Quantity
              </Label>

              <Input
                id="stock-quantity"
                type="number"
                min="0"
                step="1"
                value={stockQuantity}
                onChange={(event) =>
                  setStockQuantity(
                    event.target.value
                  )
                }
                placeholder="0"
              />
            </div>
          </section>

          {/* ----------------------------------------- */}
          {/* ONLINE STORE */}
          {/* ----------------------------------------- */}

          <section className="space-y-4 border-t pt-5">
            <div>
              <h3 className="font-medium">
                Online Store
              </h3>
            </div>

            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={onlineEnabled}
                onChange={(event) =>
                  setOnlineEnabled(
                    event.target.checked
                  )
                }
                className="mt-1 h-4 w-4"
              />

              <div>
                <p className="text-sm font-medium">
                  Available for online orders
                </p>

                <p className="text-xs text-muted-foreground">
                  Allow this product to be used for online orders.
                </p>
              </div>
            </label>

            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={featured}
                onChange={(event) =>
                  setFeatured(
                    event.target.checked
                  )
                }
                className="mt-1 h-4 w-4"
              />

              <div>
                <p className="text-sm font-medium">
                  Featured Product
                </p>

                <p className="text-xs text-muted-foreground">
                  Mark this product as featured.
                </p>
              </div>
            </label>
          </section>

          {/* ----------------------------------------- */}
          {/* VISIBILITY */}
          {/* ----------------------------------------- */}

          <section className="space-y-2 border-t pt-5">
            <Label>
              Visibility
            </Label>

            <select
              value={visibility}
              onChange={(event) =>
                setVisibility(
                  event.target.value as
                    | "DRAFT"
                    | "PUBLISHED"
                    | "ARCHIVED"
                )
              }
              className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="PUBLISHED">
                Published
              </option>

              <option value="DRAFT">
                Draft
              </option>

              <option value="ARCHIVED">
                Archived
              </option>
            </select>
          </section>

          {/* ----------------------------------------- */}
          {/* ERROR */}
          {/* ----------------------------------------- */}

          {error && (
            <div className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* ----------------------------------------- */}
          {/* ACTIONS */}
          {/* ----------------------------------------- */}

          <div className="flex justify-end gap-2 border-t pt-5">
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                handleOpenChange(false)
              }
              disabled={saving}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={saving}
            >
              {saving && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}

              {isEditMode
                ? "Update Product"
                : "Save Product"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}