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
  primary_image_url?: string | null;
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

const money =
  new Intl.NumberFormat(
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
    useState<Product | null>(
      null
    );

  const [deleting, setDeleting] =
    useState(false);

  const [deleteError, setDeleteError] =
    useState("");

  function getCategory(
    categoryId: string | null
  ) {
    if (!categoryId) {
      return null;
    }

    return (
      categories.find(
        (category) =>
          category.id ===
          categoryId
      ) ?? null
    );
  }

  function getParentCategory(
    categoryId: string | null
  ) {
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
  }

  function getSubcategory(
    categoryId: string | null
  ) {
    const category =
      getCategory(categoryId);

    if (
      !category ||
      !category.parent_id
    ) {
      return null;
    }

    return category;
  }

  const parentCategories =
    useMemo(
      () =>
        categories.filter(
          (category) =>
            category.parent_id ===
            null
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
            category.parent_id !==
            null
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

  const filteredProducts =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

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
            categoryFilter ===
              "ALL" ||
            parentCategory?.id ===
              categoryFilter;

          const matchesSubcategory =
            subcategoryFilter ===
              "ALL" ||
            subcategory?.id ===
              subcategoryFilter;

          const matchesVisibility =
            visibilityFilter ===
              "ALL" ||
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

  function handleCategoryChange(
    value: string
  ) {
    setCategoryFilter(value);
    setSubcategoryFilter("ALL");
  }

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
      /*
       * Check whether this product is used
       * in sales or purchases first.
       */
      const [
        salesResult,
        purchasesResult,
      ] = await Promise.all([
        supabase
          .from("sale_items")
          .select("id", {
            count: "exact",
            head: true,
          })
          .eq(
            "product_id",
            deletingProduct.id
          ),

        supabase
          .from("purchase_items")
          .select("id", {
            count: "exact",
            head: true,
          })
          .eq(
            "product_id",
            deletingProduct.id
          ),
      ]);

      if (
        salesResult.error ||
        purchasesResult.error
      ) {
        throw (
          salesResult.error ??
          purchasesResult.error
        );
      }

      const salesCount =
        salesResult.count ?? 0;

      const purchasesCount =
        purchasesResult.count ?? 0;

      if (
        salesCount > 0 ||
        purchasesCount > 0
      ) {
        throw new Error(
          "This product has been used in sales or purchases and cannot be deleted. Archive the product instead to preserve historical records."
        );
      }

      /*
       * Get product images so their
       * Storage files can be removed.
       */
      const {
        data: images,
        error:
          imageLoadError,
      } = await supabase
        .from("product_images")
        .select(
          "id, image_url"
        )
        .eq(
          "product_id",
          deletingProduct.id
        );

      if (imageLoadError) {
        throw imageLoadError;
      }

      const PRODUCT_IMAGE_BUCKET =
        "product-images";

      const storagePaths =
        (images ?? [])
          .map((image) => {
            const marker =
              `/storage/v1/object/public/${PRODUCT_IMAGE_BUCKET}/`;

            const index =
              image.image_url.indexOf(
                marker
              );

            if (index === -1) {
              return null;
            }

            return decodeURIComponent(
              image.image_url.slice(
                index +
                  marker.length
              )
            );
          })
          .filter(
            (
              path
            ): path is string =>
              Boolean(path)
          );

      /*
       * Delete image records.
       */
      if (images?.length) {
        const {
          error:
            imageDeleteError,
        } = await supabase
          .from("product_images")
          .delete()
          .eq(
            "product_id",
            deletingProduct.id
          );

        if (imageDeleteError) {
          throw imageDeleteError;
        }
      }

      /*
       * Delete Storage files.
       */
      if (storagePaths.length) {
        const {
          error:
            storageDeleteError,
        } =
          await supabase.storage
            .from(
              PRODUCT_IMAGE_BUCKET
            )
            .remove(
              storagePaths
            );

        if (storageDeleteError) {
          console.error(
            "Storage image cleanup error:",
            storageDeleteError
          );
        }
      }

      /*
       * Finally delete product.
       */
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

  return (
    <>
      <div className="overflow-hidden rounded-xl border bg-card">
        {/* HEADER */}
        <div className="border-b px-5 py-4">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-semibold">
                  Product Catalogue
                </h2>

                <p className="text-sm text-muted-foreground">
                  {
                    filteredProducts.length
                  }{" "}
                  {filteredProducts.length ===
                  1
                    ? "product"
                    : "products"}
                </p>
              </div>
            </div>

            {/* FILTERS */}
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-1.5">
                <Label className="text-xs">
                  Search
                </Label>

                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                  <Input
                    value={search}
                    onChange={(
                      event
                    ) =>
                      setSearch(
                        event.target
                          .value
                      )
                    }
                    placeholder="Search product or SKU..."
                    className="pl-9"
                  />
                </div>
              </div>

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
                    (
                      category
                    ) => (
                      <option
                        key={
                          category.id
                        }
                        value={
                          category.id
                        }
                      >
                        {
                          category.name
                        }
                      </option>
                    )
                  )}
                </SelectField>
              </div>

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
                    (
                      category
                    ) => (
                      <option
                        key={
                          category.id
                        }
                        value={
                          category.id
                        }
                      >
                        {
                          category.name
                        }
                      </option>
                    )
                  )}
                </SelectField>
              </div>

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
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1150px] text-sm">
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
                        key={
                          product.id
                        }
                        className="border-b last:border-0 hover:bg-muted/30"
                      >
                        {/* PRODUCT */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg border bg-muted">
                              {product.primary_image_url ? (
                                <img
                                  src={
                                    product.primary_image_url
                                  }
                                  alt={
                                    product.name
                                  }
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center">
                                  <Package className="h-5 w-5 text-muted-foreground" />
                                </div>
                              )}
                            </div>

                            <div className="min-w-0">
                              <div className="font-medium">
                                {
                                  product.name
                                }
                              </div>

                              {product.short_description && (
                                <div className="mt-1 max-w-[240px] truncate text-xs text-muted-foreground">
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
                            </div>
                          </div>
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
                              stock <=
                              0
                                ? "font-medium text-destructive"
                                : stock <=
                                    5
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

function StatusBadge({
  visibility,
}: {
  visibility: Product["visibility"];
}) {
  let className =
    "bg-yellow-100 text-yellow-700";

  if (
    visibility === "PUBLISHED"
  ) {
    className =
      "bg-green-100 text-green-700";
  }

  if (
    visibility === "ARCHIVED"
  ) {
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
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={
                onCancel
              }
              disabled={
                deleting
              }
            >
              Cancel
            </Button>

            <Button
              type="button"
              variant="destructive"
              onClick={
                onConfirm
              }
              disabled={
                deleting
              }
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