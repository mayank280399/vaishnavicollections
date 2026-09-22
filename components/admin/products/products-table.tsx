"use client";

import {
  useMemo,
  useState,
} from "react";

import {
  ChevronDown,
  Edit,
  Loader2,
  Package,
  Search,
  Trash2,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Category = {
  id: string;
  name: string;
  parent_id: string | null;
  active: boolean;
};

export type Product = {
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

type ProductsTableProps = {
  products: Product[];
  categories: Category[];
  loading: boolean;

  onEdit: (
    product: Product
  ) => void;

  onDeleted?: () => void;
};

const money = new Intl.NumberFormat(
  "en-IN",
  {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }
);

const visibilityLabels: Record<
  Product["visibility"],
  string
> = {
  DRAFT: "Draft",
  PUBLISHED: "Published",
  ARCHIVED: "Archived",
};

export function ProductsTable({
  products,
  categories,
  loading,
  onEdit,
  onDeleted,
}: ProductsTableProps) {
  const supabase = useMemo(
    () => createClient(),
    []
  );

  const [search, setSearch] =
    useState("");

  const [categoryFilter, setCategoryFilter] =
    useState("ALL");

  const [subcategoryFilter, setSubcategoryFilter] =
    useState("ALL");

  const [visibilityFilter, setVisibilityFilter] =
    useState("ALL");

  const [deletingProduct, setDeletingProduct] =
    useState<Product | null>(null);

  const [deleting, setDeleting] =
    useState(false);

  const [deleteError, setDeleteError] =
    useState("");

  // --------------------------------------------------
  // CATEGORY HELPERS
  // --------------------------------------------------

  const getCategory = (
    categoryId: string | null
  ) => {
    if (!categoryId) {
      return null;
    }

    return (
      categories.find(
        (category) =>
          category.id === categoryId
      ) ?? null
    );
  };

  const getParentCategory = (
    categoryId: string | null
  ) => {
    const category =
      getCategory(categoryId);

    if (!category) {
      return null;
    }

    if (!category.parent_id) {
      return category;
    }

    return getCategory(
      category.parent_id
    );
  };

  const getSubcategory = (
    categoryId: string | null
  ) => {
    const category =
      getCategory(categoryId);

    if (
      !category ||
      !category.parent_id
    ) {
      return null;
    }

    return category;
  };

  // --------------------------------------------------
  // FILTER CATEGORIES
  // --------------------------------------------------

  const parentCategories =
    useMemo(
      () =>
        categories.filter(
          (category) =>
            category.parent_id === null
        ),
      [categories]
    );

  const subcategoriesForFilter =
    useMemo(() => {
      if (
        categoryFilter === "ALL"
      ) {
        return categories.filter(
          (category) =>
            category.parent_id !== null
        );
      }

      return categories.filter(
        (category) =>
          category.parent_id ===
          categoryFilter
      );
    }, [
      categories,
      categoryFilter,
    ]);

  // --------------------------------------------------
  // FILTER PRODUCTS
  // --------------------------------------------------

  const filteredProducts =
    useMemo(() => {
      const query =
        search.trim().toLowerCase();

      return products.filter(
        (product) => {
          const parentCategory =
            getParentCategory(
              product.category_id
            );

          const subcategory =
            getSubcategory(
              product.category_id
            );

          const matchesSearch =
            !query ||
            product.name
              .toLowerCase()
              .includes(query) ||
            (product.sku ?? "")
              .toLowerCase()
              .includes(query);

          const matchesCategory =
            categoryFilter === "ALL" ||
            parentCategory?.id ===
              categoryFilter;

          const matchesSubcategory =
            subcategoryFilter === "ALL" ||
            subcategory?.id ===
              subcategoryFilter;

          const matchesVisibility =
            visibilityFilter === "ALL" ||
            product.visibility ===
              visibilityFilter;

          return (
            matchesSearch &&
            matchesCategory &&
            matchesSubcategory &&
            matchesVisibility
          );
        }
      );
    }, [
      products,
      search,
      categoryFilter,
      subcategoryFilter,
      visibilityFilter,
      categories,
    ]);

  // --------------------------------------------------
  // FILTER HANDLERS
  // --------------------------------------------------

  function handleCategoryChange(
    value: string
  ) {
    setCategoryFilter(value);

    // A category change invalidates
    // the currently selected subcategory.
    setSubcategoryFilter("ALL");
  }

  // --------------------------------------------------
  // DELETE
  // --------------------------------------------------

  function openDeleteDialog(
    product: Product
  ) {
    setDeleteError("");
    setDeletingProduct(product);
  }

  function closeDeleteDialog() {
    if (deleting) {
      return;
    }

    setDeletingProduct(null);
    setDeleteError("");
  }

  async function handleDelete() {
    if (!deletingProduct) {
      return;
    }

    setDeleting(true);
    setDeleteError("");

    try {
      const {
        error,
      } = await supabase
        .from("products")
        .delete()
        .eq(
          "id",
          deletingProduct.id
        );

      if (error) {
        throw error;
      }

      setDeletingProduct(null);

      onDeleted?.();
    } catch (err) {
      console.error(
        "Delete product error:",
        err
      );

      setDeleteError(
        err instanceof Error
          ? err.message
          : "Unable to delete product."
      );
    } finally {
      setDeleting(false);
    }
  }

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <>
      <div className="overflow-hidden rounded-xl border bg-card">
        {/* TABLE HEADER */}
        <div className="border-b px-5 py-4">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-semibold">
                  Product Catalogue
                </h2>

                <p className="text-sm text-muted-foreground">
                  {filteredProducts.length}{" "}
                  {filteredProducts.length ===
                  1
                    ? "product"
                    : "products"}
                </p>
              </div>
            </div>

            {/* FILTERS */}
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              {/* SEARCH */}
              <div className="space-y-1.5">
                <Label className="text-xs">
                  Search
                </Label>

                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                  <Input
                    value={search}
                    onChange={(event) =>
                      setSearch(
                        event.target.value
                      )
                    }
                    placeholder="Search product or SKU..."
                    className="pl-9"
                  />
                </div>
              </div>

              {/* CATEGORY */}
              <div className="space-y-1.5">
                <Label className="text-xs">
                  Category
                </Label>

                <SelectField
                  value={
                    categoryFilter
                  }
                  onChange={
                    handleCategoryChange
                  }
                >
                  <option value="ALL">
                    All Categories
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
                </SelectField>
              </div>

              {/* SUBCATEGORY */}
              <div className="space-y-1.5">
                <Label className="text-xs">
                  Subcategory
                </Label>

                <SelectField
                  value={
                    subcategoryFilter
                  }
                  onChange={
                    setSubcategoryFilter
                  }
                >
                  <option value="ALL">
                    All Subcategories
                  </option>

                  {subcategoriesForFilter.map(
                    (category) => (
                      <option
                        key={category.id}
                        value={category.id}
                      >
                        {category.name}
                      </option>
                    )
                  )}
                </SelectField>
              </div>

              {/* VISIBILITY */}
              <div className="space-y-1.5">
                <Label className="text-xs">
                  Status
                </Label>

                <SelectField
                  value={
                    visibilityFilter
                  }
                  onChange={
                    setVisibilityFilter
                  }
                >
                  <option value="ALL">
                    All Statuses
                  </option>

                  <option value="PUBLISHED">
                    Published
                  </option>

                  <option value="DRAFT">
                    Draft
                  </option>

                  <option value="ARCHIVED">
                    Archived
                  </option>
                </SelectField>
              </div>
            </div>
          </div>
        </div>

        {/* LOADING */}
        {loading ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />

              Loading products...
            </div>
          </div>
        ) : filteredProducts.length ===
          0 ? (
          /* EMPTY */
          <div className="flex min-h-[300px] flex-col items-center justify-center gap-3 px-6 text-center">
            <Package className="h-10 w-10 text-muted-foreground" />

            <div>
              <p className="font-medium">
                No products found
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                Try changing your filters or add a new product.
              </p>
            </div>
          </div>
        ) : (
          /* TABLE */
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] text-sm">
              <thead>
                <tr className="border-b bg-muted/40">
                  <th className="px-5 py-3 text-left font-medium">
                    Product
                  </th>

                  <th className="px-5 py-3 text-left font-medium">
                    Category
                  </th>

                  <th className="px-5 py-3 text-left font-medium">
                    Subcategory
                  </th>

                  <th className="px-5 py-3 text-left font-medium">
                    SKU
                  </th>

                  <th className="px-5 py-3 text-right font-medium">
                    Cost
                  </th>

                  <th className="px-5 py-3 text-right font-medium">
                    Selling
                  </th>

                  <th className="px-5 py-3 text-right font-medium">
                    Stock
                  </th>

                  <th className="px-5 py-3 text-left font-medium">
                    Status
                  </th>

                  <th className="px-5 py-3 text-right font-medium">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredProducts.map(
                  (product) => {
                    const parentCategory =
                      getParentCategory(
                        product.category_id
                      );

                    const subcategory =
                      getSubcategory(
                        product.category_id
                      );

                    const stock =
                      Number(
                        product.stock_quantity ??
                          0
                      );

                    return (
                      <tr
                        key={product.id}
                        className="border-b last:border-0 hover:bg-muted/30"
                      >
                        {/* PRODUCT */}
                        <td className="px-5 py-4">
                          <div className="font-medium">
                            {product.name}
                          </div>

                          {product.short_description && (
                            <div className="mt-1 max-w-[260px] truncate text-xs text-muted-foreground">
                              {
                                product.short_description
                              }
                            </div>
                          )}

                          {product.featured && (
                            <span className="mt-1 inline-flex text-xs text-muted-foreground">
                              Featured
                            </span>
                          )}
                        </td>

                        {/* CATEGORY */}
                        <td className="px-5 py-4">
                          {
                            parentCategory?.name ??
                              "—"
                          }
                        </td>

                        {/* SUBCATEGORY */}
                        <td className="px-5 py-4">
                          {
                            subcategory?.name ??
                              "—"
                          }
                        </td>

                        {/* SKU */}
                        <td className="px-5 py-4 text-muted-foreground">
                          {product.sku ||
                            "—"}
                        </td>

                        {/* COST */}
                        <td className="px-5 py-4 text-right">
                          {money.format(
                            Number(
                              product.cost_price ??
                                0
                            )
                          )}
                        </td>

                        {/* SELLING */}
                        <td className="px-5 py-4 text-right font-medium">
                          {money.format(
                            Number(
                              product.selling_price ??
                                0
                            )
                          )}
                        </td>

                        {/* STOCK */}
                        <td className="px-5 py-4 text-right">
                          <span
                            className={
                              stock <= 0
                                ? "font-medium text-destructive"
                                : stock <= 5
                                  ? "font-medium"
                                  : ""
                            }
                          >
                            {stock}
                          </span>
                        </td>

                        {/* STATUS */}
                        <td className="px-5 py-4">
                          <StatusBadge
                            visibility={
                              product.visibility
                            }
                          />
                        </td>

                        {/* ACTIONS */}
                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                onEdit(
                                  product
                                )
                              }
                            >
                              <Edit className="mr-1.5 h-4 w-4" />

                              Edit
                            </Button>

                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                              onClick={() =>
                                openDeleteDialog(
                                  product
                                )
                              }
                            >
                              <Trash2 className="mr-1.5 h-4 w-4" />

                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  }
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* DELETE CONFIRMATION */}
      {deletingProduct && (
        <DeleteProductDialog
          product={
            deletingProduct
          }
          open={
            !!deletingProduct
          }
          deleting={deleting}
          error={deleteError}
          onCancel={
            closeDeleteDialog
          }
          onConfirm={
            handleDelete
          }
        />
      )}
    </>
  );
}

// --------------------------------------------------
// SELECT
// --------------------------------------------------

function SelectField({
  value,
  onChange,
  children,
}: {
  value: string;
  onChange: (
    value: string
  ) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        className="h-10 w-full appearance-none rounded-md border bg-background px-3 pr-9 text-sm outline-none focus:ring-2 focus:ring-ring"
      >
        {children}
      </select>

      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
    </div>
  );
}

// --------------------------------------------------
// STATUS BADGE
// --------------------------------------------------

function StatusBadge({
  visibility,
}: {
  visibility: Product["visibility"];
}) {
  let className =
    "bg-yellow-100 text-yellow-700";

  if (visibility === "PUBLISHED") {
    className =
      "bg-green-100 text-green-700";
  }

  if (visibility === "ARCHIVED") {
    className =
      "bg-muted text-muted-foreground";
  }

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${className}`}
    >
      {
        visibilityLabels[
          visibility
        ]
      }
    </span>
  );
}

// --------------------------------------------------
// DELETE DIALOG
// --------------------------------------------------

function DeleteProductDialog({
  product,
  open,
  deleting,
  error,
  onCancel,
  onConfirm,
}: {
  product: Product;
  open: boolean;
  deleting: boolean;
  error: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div
      className={
        open
          ? "fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          : "hidden"
      }
    >
      <div className="w-full max-w-md rounded-xl border bg-background p-6 shadow-xl">
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold">
              Delete Product
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Are you sure you want to delete this product?
            </p>
          </div>

          <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
            <p className="font-medium">
              {product.name}
            </p>

            {product.sku && (
              <p className="mt-1 text-xs text-muted-foreground">
                SKU: {product.sku}
              </p>
            )}

            <p className="mt-2 text-sm text-muted-foreground">
              This action cannot be undone.
            </p>
          </div>

          {error && (
            <div className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {error}

              <p className="mt-2 text-xs">
                If this product has already been used in sales or purchases, the database may prevent deletion to protect your historical records.
              </p>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={deleting}
            >
              Cancel
            </Button>

            <Button
              type="button"
              variant="destructive"
              onClick={onConfirm}
              disabled={deleting}
            >
              {deleting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}

              Delete Product
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}