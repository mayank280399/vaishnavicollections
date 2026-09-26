"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { createClient } from "@/lib/supabase/client";

import { CategoriesHeader } from "./categories-header";
import { CategoriesStats } from "./categories-stats";
import { CategoriesToolbar } from "./categories-toolbar";
import { CategoryCard } from "./category-card";
import { CategoryDialog } from "./category-dialog";
import { CategoryFormData, ProductCategory } from "@/lib/categories/category-types";



const supabase = createClient();

export function CategoriesPage() {
  const [categories, setCategories] =
    useState<ProductCategory[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [search, setSearch] =
    useState("");

  const [filter, setFilter] =
    useState<
      "ALL" | "ACTIVE" | "INACTIVE"
    >("ALL");

  const [dialogOpen, setDialogOpen] =
    useState(false);

  const [editingCategory, setEditingCategory] =
    useState<ProductCategory | null>(null);

  const [selectedParent, setSelectedParent] =
    useState<ProductCategory | null>(null);

  /* ------------------------------------------------------------------------ */
  /* Load Categories                                                          */
  /* ------------------------------------------------------------------------ */

  const loadCategories =
    useCallback(async () => {
      setLoading(true);

      try {
        const [
          categoriesResult,
          productsResult,
        ] = await Promise.all([
          supabase
            .from("product_categories")
            .select(`
              id,
              name,
              slug,
              description,
              active,
              category_type,
              parent_id,
              created_at,
              updated_at
            `)
            .order("name", {
              ascending: true,
            }),

          supabase
            .from("products")
            .select(
              "id, category_id"
            ),
        ]);

        if (categoriesResult.error) {
          throw categoriesResult.error;
        }

        if (productsResult.error) {
          throw productsResult.error;
        }

        const productCounts =
          new Map<string, number>();

        for (const product of
          productsResult.data ?? []) {
          if (!product.category_id) {
            continue;
          }

          const currentCount =
            productCounts.get(
              product.category_id
            ) ?? 0;

          productCounts.set(
            product.category_id,
            currentCount + 1
          );
        }

        const categoriesWithCounts = (
          categoriesResult.data ?? []
        ).map((category) => ({
          ...category,
          product_count:
            productCounts.get(
              category.id
            ) ?? 0,
        }));

        setCategories(
          categoriesWithCounts as ProductCategory[]
        );
      } catch (error) {
        console.error(
          "Failed to load categories:",
          error
        );

        setCategories([]);

        alert(
          error instanceof Error
            ? error.message
            : "Failed to load categories."
        );
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  /* ------------------------------------------------------------------------ */
  /* Helpers                                                                  */
  /* ------------------------------------------------------------------------ */

  function getSubcategories(
    parentId: string
  ) {
    return categories.filter(
      (category) =>
        category.parent_id === parentId
    );
  }

  function getCategoryProductCount(
    category: ProductCategory
  ) {
    const directCount =
      category.product_count ?? 0;

    const childCount = categories
      .filter(
        (item) =>
          item.parent_id ===
          category.id
      )
      .reduce(
        (sum, child) =>
          sum +
          (child.product_count ?? 0),
        0
      );

    return (
      directCount + childCount
    );
  }

  /* ------------------------------------------------------------------------ */
  /* Search + Filter                                                          */
  /* ------------------------------------------------------------------------ */

  const visibleParentCategories =
    useMemo(() => {
      const normalizedSearch =
        search.trim().toLowerCase();

      const parents =
        categories.filter(
          (category) =>
            category.parent_id === null
        );

      return parents.filter(
        (parent) => {
          const children =
            categories.filter(
              (category) =>
                category.parent_id ===
                parent.id
            );

          const parentMatchesSearch =
            !normalizedSearch ||
            parent.name
              .toLowerCase()
              .includes(
                normalizedSearch
              ) ||
            parent.slug
              .toLowerCase()
              .includes(
                normalizedSearch
              );

          const childMatchesSearch =
            children.some((child) => {
              return (
                child.name
                  .toLowerCase()
                  .includes(
                    normalizedSearch
                  ) ||
                child.slug
                  .toLowerCase()
                  .includes(
                    normalizedSearch
                  )
              );
            });

          const matchesSearch =
            parentMatchesSearch ||
            childMatchesSearch;

          const matchesFilter =
            filter === "ALL" ||
            (filter === "ACTIVE" &&
              parent.active) ||
            (filter === "INACTIVE" &&
              !parent.active);

          return (
            matchesSearch &&
            matchesFilter
          );
        }
      );
    }, [
      categories,
      search,
      filter,
    ]);

  function getVisibleSubcategories(
    parentId: string
  ) {
    const children =
      getSubcategories(parentId);

    const normalizedSearch =
      search.trim().toLowerCase();

    if (!normalizedSearch) {
      return children;
    }

    return children.filter(
      (child) => {
        return (
          child.name
            .toLowerCase()
            .includes(
              normalizedSearch
            ) ||
          child.slug
            .toLowerCase()
            .includes(
              normalizedSearch
            )
        );
      }
    );
  }

  /* ------------------------------------------------------------------------ */
  /* Stats                                                                    */
  /* ------------------------------------------------------------------------ */

  const activeCount =
    categories.filter(
      (category) => category.active
    ).length;

  const subcategoryCount =
    categories.filter(
      (category) =>
        category.parent_id !== null
    ).length;

  /* ------------------------------------------------------------------------ */
  /* Add / Edit                                                                */
  /* ------------------------------------------------------------------------ */

  function handleAddCategory() {
    setEditingCategory(null);
    setSelectedParent(null);
    setDialogOpen(true);
  }

  function handleEdit(
    category: ProductCategory
  ) {
    setEditingCategory(category);
    setSelectedParent(null);
    setDialogOpen(true);
  }

  function handleEditSubcategory(
    category: ProductCategory
  ) {
    setEditingCategory(category);
    setSelectedParent(null);
    setDialogOpen(true);
  }

  function handleAddSubcategory(
    parent: ProductCategory
  ) {
    setEditingCategory(null);
    setSelectedParent(parent);
    setDialogOpen(true);
  }

  /* ------------------------------------------------------------------------ */
  /* Save Category                                                             */
  /* ------------------------------------------------------------------------ */

  async function handleSubmit(
    formData: CategoryFormData
  ) {
    try {
      if (editingCategory) {
        const { error } =
          await supabase
            .from(
              "product_categories"
            )
            .update({
              name: formData.name,
              slug: formData.slug,
              description:
                formData.description ||
                null,
              category_type:
                formData.category_type,
              parent_id:
                formData.parent_id,
              active:
                formData.active,
              updated_at:
                new Date().toISOString(),
            })
            .eq(
              "id",
              editingCategory.id
            );

        if (error) {
          throw error;
        }
      } else {
        const { error } =
          await supabase
            .from(
              "product_categories"
            )
            .insert({
              name: formData.name,
              slug: formData.slug,
              description:
                formData.description ||
                null,
              category_type:
                formData.category_type,
              parent_id:
                formData.parent_id,
              active:
                formData.active,
            });

        if (error) {
          throw error;
        }
      }

      await loadCategories();

      setDialogOpen(false);
      setEditingCategory(null);
      setSelectedParent(null);
    } catch (error) {
      console.error(
        "Failed to save category:",
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : "Failed to save category."
      );
    }
  }

  /* ------------------------------------------------------------------------ */
  /* Activate / Deactivate                                                    */
  /* ------------------------------------------------------------------------ */

  async function handleToggleActive(
    category: ProductCategory
  ) {
    const nextActive =
      !category.active;

    const actionText = nextActive
      ? "activate"
      : "deactivate";

    const confirmed = window.confirm(
      `Are you sure you want to ${actionText} "${category.name}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      const { error } =
        await supabase
          .from("product_categories")
          .update({
            active: nextActive,
            updated_at:
              new Date().toISOString(),
          })
          .eq("id", category.id);

      if (error) {
        throw error;
      }

      await loadCategories();
    } catch (error) {
      console.error(
        `Failed to ${actionText} category:`,
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : `Failed to ${actionText} category.`
      );
    }
  }

  /* ------------------------------------------------------------------------ */
  /* Delete Category                                                           */
  /* ------------------------------------------------------------------------ */

 async function handleDelete(
  category: ProductCategory
) {
  /*
   * Check direct products assigned to this category.
   */
  const directProductCount =
    category.product_count ?? 0;

  /*
   * Check whether this category has
   * any subcategories.
   */
  const childCategories =
    categories.filter(
      (item) =>
        item.parent_id === category.id
    );

  /* ---------------------------------------------------------------------- */
  /* Block if category has subcategories                                    */
  /* ---------------------------------------------------------------------- */

  if (
    childCategories.length > 0
  ) {
    alert(
      `Cannot delete "${category.name}".\n\n` +
        `It has ${childCategories.length} ` +
        `${
          childCategories.length === 1
            ? "subcategory"
            : "subcategories"
        }.\n\n` +
        `Remove or move the subcategories first, or deactivate this category instead.`
    );

    return;
  }

  /* ---------------------------------------------------------------------- */
  /* Block if category has products                                         */
  /* ---------------------------------------------------------------------- */

  if (directProductCount > 0) {
    alert(
      `Cannot delete "${category.name}".\n\n` +
        `It has ${directProductCount} ` +
        `${
          directProductCount === 1
            ? "product"
            : "products"
        } assigned to it.\n\n` +
        `Move those products to another category first, or deactivate this category instead.`
    );

    return;
  }

  /* ---------------------------------------------------------------------- */
  /* Confirmation                                                           */
  /* ---------------------------------------------------------------------- */

  const confirmed =
    window.confirm(
      `Delete "${category.name}" permanently?\n\n` +
        `This category has no products and no subcategories.\n\n` +
        `This action cannot be undone.`
    );

  if (!confirmed) {
    return;
  }

  /* ---------------------------------------------------------------------- */
  /* Delete                                                                  */
  /* ---------------------------------------------------------------------- */

  try {
    const { data, error } =
      await supabase
        .from("product_categories")
        .delete()
        .eq("id", category.id)
        .select("id");

    if (error) {
      console.error(
        "Supabase delete error:",
        error
      );

      if (
        error.code === "23503"
      ) {
        alert(
          `This category cannot be deleted because it is still being used by other records.\n\n` +
            `Please deactivate it instead.`
        );

        return;
      }

      throw error;
    }

    /*
     * RLS can sometimes result in zero affected rows.
     * Explicitly verify that something was deleted.
     */
    if (
      !data ||
      data.length === 0
    ) {
      alert(
        `The category "${category.name}" was not deleted.\n\n` +
          `You may not have permission to delete categories.`
      );

      return;
    }

    await loadCategories();

    alert(
      `"${category.name}" was deleted successfully.`
    );
  } catch (error) {
    console.error(
      "Failed to delete category:",
      error
    );

    alert(
      error instanceof Error
        ? error.message
        : "Failed to delete category."
    );
  }
}
  /* ------------------------------------------------------------------------ */
  /* Render                                                                   */
  /* ------------------------------------------------------------------------ */

  return (
    <div className="space-y-6">
      <CategoriesHeader
        onAdd={handleAddCategory}
      />

      <CategoriesStats
        total={categories.length}
        active={activeCount}
        subcategories={
          subcategoryCount
        }
      />

      <CategoriesToolbar
        search={search}
        onSearchChange={setSearch}
        filter={filter}
        onFilterChange={setFilter}
      />

      {loading ? (
        <div className="rounded-2xl border py-14 text-center">
          <p className="text-sm text-muted-foreground">
            Loading categories...
          </p>
        </div>
      ) : visibleParentCategories.length ===
        0 ? (
        <div className="rounded-2xl border border-dashed py-14 text-center">
          <p className="text-sm font-medium">
            No categories found
          </p>

          <p className="mt-1 text-sm text-muted-foreground">
            {search
              ? "Try changing your search or filter."
              : "Create your first category to get started."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {visibleParentCategories.map(
            (category) => (
              <CategoryCard
                key={category.id}
                category={category}
                subcategories={getVisibleSubcategories(
                  category.id
                )}
                totalProductCount={getCategoryProductCount(
                  category
                )}
                onEdit={handleEdit}
                onEditSubcategory={
                  handleEditSubcategory
                }
                onAddSubcategory={
                  handleAddSubcategory
                }
                onToggleActive={
                  handleToggleActive
                }
                onDelete={handleDelete}
              />
            )
          )}
        </div>
      )}

      <CategoryDialog
        open={dialogOpen}
        onOpenChange={
          setDialogOpen
        }
        category={editingCategory}
        categories={categories}
        selectedParent={
          selectedParent
        }
        onSubmit={handleSubmit}
      />
    </div>
  );
}